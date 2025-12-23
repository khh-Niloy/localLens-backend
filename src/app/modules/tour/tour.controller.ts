import { Request, Response } from "express";
import { responseManager } from "../../utils/responseManager";
import { tourServices } from "./tour.service";
import { logger } from "../../utils/logger";
import { ITourSearchQuery, TOUR_CATEGORY, TOUR_STATUS } from "./tour.interface";

const createTour = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const imagePaths = files?.map((file) => file.path) || [];

    const tourData = {
      ...req.body,
      guideId: req.user.userId,
      images: imagePaths,
    };

    console.log("Tour data:", tourData);

    const tour = await tourServices.createTourService(tourData);

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "Tour created successfully",
      data: tour,
    });
  } catch (error) {
    logger.log("Error creating tour:", error);
    const statusCode = (error as Error).message.includes("already exists") ? 409 : 500;
    responseManager.error(res, error as Error, statusCode);
  }
};

const getTourEnums = async (req: Request, res: Response) => {
  try {
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour enums fetched successfully",
      data: {
        categories: Object.values(TOUR_CATEGORY),
        statuses: Object.values(TOUR_STATUS)
      },
    });
  } catch (error) {
    logger.log("Error fetching tour enums:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getAllTours = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const tours = await tourServices.getAllToursService(category as string);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tours fetched successfully",
      data: tours,
    });
  } catch (error) {
    logger.log("Error fetching tours:", error);
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
        pagination: result.pagination
      },
    });
  } catch (error) {
    logger.log("Error searching tours:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getTourBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const tour = await tourServices.getTourBySlugService(slug);
    
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour fetched successfully",
      data: tour,
    });
  } catch (error) {
    logger.log("Error fetching tour by slug:", error);
    const statusCode = (error as Error).message === "Tour not found" ? 404 : 500;
    responseManager.error(res, error as Error, statusCode);
  }
};

const getGuideMyTours = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    
    const tours = await tourServices.getGuideMyToursService(userId);
    
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
    const tours = await tourServices.getTouristMyToursService(userId);
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

    const tour = await tourServices.updateTourService(id, updateData, userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour updated successfully",
      data: tour,
    });
  } catch (error) {
    logger.log("Error updating tour:", error);
    let statusCode = 500;
    if ((error as Error).message.includes("not found") || (error as Error).message.includes("Invalid")) {
      statusCode = 404;
    } else if ((error as Error).message.includes("only update your own") || (error as Error).message.includes("already exists")) {
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

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    logger.log("Error deleting tour:", error);
    let statusCode = 500;
    if ((error as Error).message.includes("not found") || (error as Error).message.includes("Invalid")) {
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
  getAllTours,
  searchTours,
  getTourBySlug,
  updateTour,
  deleteTour,
  getGuideMyTours,
  getTouristMyTours,
  getTourEnums,
  getAllToursForAdmin,
};