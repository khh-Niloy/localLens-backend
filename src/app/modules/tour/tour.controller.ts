import { Request, Response } from "express";
import { responseManager } from "../../utils/responseManager";
import { tourServices } from "./tour.service";
import { logger } from "../../utils/logger";
import { ITourSearchQuery, TOUR_CATEGORY, TOUR_STATUS } from "./tour.interface";
import { string } from "zod";
import { redis } from "../../lib/connectRedis";

const createTour = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const imagePaths = files?.map((file) => file.path) || [];

    const tourData = {
      ...req.body,
      guideId: req.user.userId,
      images: imagePaths,
    };

    const tour = await tourServices.createTourService(tourData);

    await redis.incr(`guide-tour-list:${req.user.userId}:version`);
    await redis.incr("global:tours:version");

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "Tour created successfully",
      data: tour,
    });
  } catch (error) {
    logger.log("Error creating tour:", error);
    const statusCode = (error as Error).message.includes("already exists")
      ? 409
      : 500;
    responseManager.error(res, error as Error, statusCode);
  }
};

const getTourEnums = async (req: Request, res: Response) => {
  try {
    const cache = await redis.get("tour:enums");
    if (cache) {
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "Tour enums fetched successfully",
        data: JSON.parse(cache),
      });
    }

    const data = {
      categories: Object.values(TOUR_CATEGORY),
      statuses: Object.values(TOUR_STATUS),
    };

    redis.set("tour:enums", JSON.stringify(data), "EX", 86400);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour enums fetched successfully",
      data: {
        categories: Object.values(TOUR_CATEGORY),
        statuses: Object.values(TOUR_STATUS),
      },
    });
  } catch (error) {
    logger.log("Error fetching tour enums:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getAllFeaturedTours = async (req: Request, res: Response) => {
  try {
    const version = (await redis.get("featured:version")) || 1;

    const cursor = req.query.cursor as string;
    const cursorKey = cursor || "first";
    const cacheKey = `featured-ids:${version}:cursor:${cursorKey}`;

    const cachedIdsData = await redis.get(cacheKey);

    if (cachedIdsData) {
      const { ids, nextCursor } = JSON.parse(cachedIdsData);

      const hydratedTours = await Promise.all(
        ids.map(async (id: string) => {
          const version = (await redis.get(`tour:detail:${id}:version`)) || 1;
          const detailCache = await redis.get(`tour:detail:${id}:${version}`);
          if (detailCache) return JSON.parse(detailCache);

          try {
            const tour = await tourServices.getTourByIdService(id);
            if (tour) {
              await redis.setex(
                `tour:detail:${id}:${version}`,
                3600,
                JSON.stringify(tour)
              );
            }
            return tour;
          } catch (error) {
            return null;
          }
        })
      );

      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "Featured tours fetched successfully",
        data: {
          data: hydratedTours.filter((t) => t !== null),
          nextCursor,
        },
      });
    }

    const { data, nextCursor } = await tourServices.getAllFeaturedToursService({
      cursor: cursor as string,
    });

    const ids = data.map((t: any) => t._id.toString());
    await redis.setex(cacheKey, 900, JSON.stringify({ ids, nextCursor }));

    await Promise.all(
      data.map(async (tour: any) => {
        const version =
          (await redis.get(`tour:detail:${tour._id.toString()}:version`)) || 1;
        await redis.setex(
          `tour:detail:${tour._id.toString()}:${version}`,
          3600,
          JSON.stringify(tour)
        );
      })
    );

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Featured tours fetched successfully",
      data: { data, nextCursor },
    });
  } catch (error) {
    logger.log("Error fetching featured tours:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getAllToursByCategory = async (req: Request, res: Response) => {
  try {
    const { category, location } = req.query;

    const globalVersion = (await redis.get("global:tours:version")) || 1;
    const cacheKey = `tour-list-ids:cat:${category || "all"}:loc:${location || "all"}:v:${globalVersion}`;

    const cachedIdsData = await redis.get(cacheKey);
    if (cachedIdsData) {
      const { ids, total: cachedTotal } = JSON.parse(cachedIdsData);

      const hydratedTours = await Promise.all(
        ids.map(async (id: string) => {
          const version = (await redis.get(`tour:detail:${id}:version`)) || 1;
          const detailCache = await redis.get(`tour:detail:${id}:${version}`);
          if (detailCache) return JSON.parse(detailCache);

          const tour = await tourServices.getTourByIdService(id);
          if (tour) {
            await redis.setex(
              `tour:detail:${id}:${version}`,
              300,
              JSON.stringify(tour)
            );
          }
          return tour;
        })
      );

      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "Tours fetched successfully",
        meta: cachedTotal,
        data: hydratedTours.filter((t) => t !== null),
      });
    }

    const { data, total } = await tourServices.getAllToursByCategoryService(
      category as string,
      location as string
    );

    // Cache the List Structure (IDs)
    const ids = data.map((t: any) => t._id.toString());
    await redis.setex(cacheKey, 3600, JSON.stringify({ ids, total }));

    // Pre-cache individual tour details for future list requests
    await Promise.all(
      data.map(async (tour: any) => {
        const version =
          (await redis.get(`tour:detail:${tour._id.toString()}:version`)) || 1;
        await redis.setex(
          `tour:detail:${tour._id.toString()}:${version}`,
          3600,
          JSON.stringify(tour)
        );
      })
    );

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tours fetched successfully",
      meta: total,
      data: data,
    });
  } catch (error) {
    logger.log("Error fetching tours by category:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const searchTours = async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query as unknown as ITourSearchQuery;
    const result = await tourServices.searchToursService(searchQuery);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tours searched successfully",
      meta: result.pagination.totalItems,
      data: {
        tours: result.tours,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.log("Error searching tours:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getTourById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const version = (await redis.get(`tour:detail:${id}:version`)) || 1;
    const cacheKey = `tour:detail:${id}:${version}`;
    console.log("Tour version: ", version);
    // console.log("Tour id: ", id);

    const cachedTour = await redis.get(cacheKey);

    if (cachedTour) {
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "Tour fetched successfully",
        data: JSON.parse(cachedTour),
      });
    }

    const tour = await tourServices.getTourByIdService(id);

    await redis.setex(cacheKey, 3600, JSON.stringify(tour));

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour fetched successfully",
      data: tour,
    });
  } catch (error) {
    logger.log("Error fetching tour by id:", error);
    const statusCode =
      (error as Error).message === "Tour not found" ? 404 : 500;
    responseManager.error(res, error as Error, statusCode);
  }
};

const getGuideMyTours = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;

    const version = (await redis.get(`guide-tour-list:${userId}:version`)) || 1;
    const cacheKey = `guide-tour-list:${userId}:${version}`;

    const cachedGuideTours = await redis.get(cacheKey);

    if (cachedGuideTours) {
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "My tours fetched successfully",
        data: JSON.parse(cachedGuideTours),
      });
    }

    const tours = await tourServices.getGuideMyToursService(userId);

    await redis.setex(cacheKey, 600, JSON.stringify(tours));

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "My tours fetched successfully",
      data: tours,
    });
  } catch (error) {
    logger.log("Error fetching my tours:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getTouristMyTours = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;

    const version =
      (await redis.get(`tourist-tour-list:${userId}:version`)) || 1;

    const cacheKey = `tourist-tour-list:${userId}:v:${version}`;

    const cachedTouristTours = await redis.get(cacheKey);

    if (cachedTouristTours) {
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "My tours fetched successfully",
        data: JSON.parse(cachedTouristTours),
      });
    }

    const tours = await tourServices.getTouristMyToursService(userId);

    await redis.setex(cacheKey, 300, JSON.stringify(tours));

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tourist trips fetched successfully",
      data: tours,
    });
  } catch (error) {
    logger.log("Error fetching tourist trips:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const updateTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const files = req.files as Express.Multer.File[];
    const updateData = { ...req.body };

    if (files && files.length > 0) {
      updateData.images = files.map((file) => file.path);
    }

    // console.log(updateData);

    const tour = await tourServices.updateTourService(id, updateData, userId);

    const shouldInvalidateFeatured =
      req.body.isFeatured !== undefined || tour?.isFeatured;

    if (shouldInvalidateFeatured) {
      await redis.incr("featured:version");
    }

    if (
      req.body.category ||
      req.body.location ||
      req.body.tourFee !== undefined
    ) {
      await redis.incr("global:tours:version");
    }

    await redis.incr(`guide-tour-list:${userId}:version`);
    await redis.incr(`tour:detail:${id}:version`);

    console.log("Tour updated successfully, invalidating cache");
    // console.log("Tour id: ", id);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour updated successfully",
      data: tour,
    });
  } catch (error) {
    logger.log("Error updating tour:", error);
    let statusCode = 500;
    if (
      (error as Error).message.includes("not found") ||
      (error as Error).message.includes("Invalid")
    ) {
      statusCode = 404;
    } else if (
      (error as Error).message.includes("only update your own") ||
      (error as Error).message.includes("already exists")
    ) {
      statusCode = 403;
    }
    responseManager.error(res, error as Error, statusCode);
  }
};

const deleteTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const result = await tourServices.deleteTourService(id, userId);

    // Cache Invalidation
    if (result.data.isFeatured) {
      await redis.incr("featured:version");
    }

    await redis.incr(`guide-tour-list:${userId}:version`);
    // Structural change: List of IDs has changed, increment global version
    await redis.incr("global:tours:version");
    await redis.del(`tour:detail:${id}`);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    logger.log("Error deleting tour:", error);
    let statusCode = 500;
    if (
      (error as Error).message.includes("not found") ||
      (error as Error).message.includes("Invalid")
    ) {
      statusCode = 404;
    } else if ((error as Error).message.includes("only delete your own")) {
      statusCode = 403;
    }
    responseManager.error(res, error as Error, statusCode);
  }
};

const getAllToursForAdmin = async (req: Request, res: Response) => {
  try {
    const tours = await tourServices.getAllToursForAdminService();
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Admin: All tours fetched successfully",
      data: tours,
    });
  } catch (error) {
    logger.log("Error fetching admin tours:", error);
    responseManager.error(res, error as Error, 500);
  }
};

export const TourController = {
  createTour,
  getAllFeaturedTours,
  searchTours,
  getTourById,
  updateTour,
  deleteTour,
  getGuideMyTours,
  getTouristMyTours,
  getTourEnums,
  getAllToursForAdmin,
  getAllToursByCategory,
};
