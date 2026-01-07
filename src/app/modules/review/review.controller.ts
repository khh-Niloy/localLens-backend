import { Request, Response } from "express";
import { responseManager } from "../../utils/responseManager";
import { reviewService } from "./review.service";
import { JwtPayload } from "jsonwebtoken";
import { redis } from "../../lib/connectRedis";
import { logger } from "../../utils/logger";

const createReview = async (req: Request, res: Response) => {
  try {
    const jwt_user = req.user as JwtPayload;
    const reviewData = { ...req.body, userId: jwt_user.userId };
    
    const result = await reviewService.createReview(reviewData);

    // Cache Invalidation
    await redis.incr(`review:tour:${reviewData.tourId}:v`);
    await redis.incr(`review:guide:${result?.guideId}:v`);
    await redis.incr(`review:user:${jwt_user.userId}:v`);
    
    // Ratings affect tour lists and details
    await redis.incr("global:tours:version");
    await redis.incr("featured:version");
    await redis.incr("global:reviews:version");
    await redis.del(`tour:detail:${reviewData.tourId}`);

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "Review created successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 400);
  }
};

const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jwt_user = req.user as JwtPayload;
    
    const result = (await reviewService.updateReview(id, jwt_user.userId, req.body)) as any;

    // Cache Invalidation
    const tourId = result?.tourId?._id || result?.tourId;
    await redis.incr(`review:tour:${tourId}:v`);
    await redis.incr(`review:guide:${result?.guideId?._id || result?.guideId}:v`);
    await redis.incr(`review:user:${jwt_user.userId}:v`);
    
    // Ratings affect tour lists and details
    await redis.incr("global:tours:version");
    await redis.incr("featured:version");
    await redis.incr("global:reviews:version");
    await redis.del(`tour:detail:${tourId}`);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Review updated successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 400);
  }
};

const getTourReviews = async (req: Request, res: Response) => {
  try {
    const { tourId } = req.params;
    const { page = 1, limit = 10, cursor } = req.query;

    const version = (await redis.get(`review:tour:${tourId}:v`)) || 1;
    const cacheKey = `review:tour:${tourId}:v:${version}:p:${page}:l:${limit}:c:${cursor || "none"}`;

    const cachedReviews = await redis.get(cacheKey);
    if (cachedReviews) {
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "Tour reviews retrieved successfully",
        data: JSON.parse(cachedReviews),
      });
    }
    
    const result = await reviewService.getTourReviews({
      tourId,
      page: Number(page),
      limit: Number(limit),
      cursor: cursor as string,
    });

    await redis.setex(cacheKey, 1800, JSON.stringify(result));

    return responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.log("Error fetching tour reviews:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getGuideReviews = async (req: Request, res: Response) => {
  try {
    const { guideId } = req.params;
    const { page = 1, limit = 10, cursor } = req.query;

    const version = (await redis.get(`review:guide:${guideId}:v`)) || 1;
    const cacheKey = `review:guide:${guideId}:v:${version}:p:${page}:l:${limit}:c:${cursor || "none"}`;

    const cachedReviews = await redis.get(cacheKey);
    if (cachedReviews) {
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "Guide reviews retrieved successfully",
        data: JSON.parse(cachedReviews),
      });
    }
    
    const result = await reviewService.getGuideReviews({
      guideId,
      page: Number(page),
      limit: Number(limit),
      cursor: cursor as string,
    });

    await redis.setex(cacheKey, 1800, JSON.stringify(result));

    return responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Guide reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.log("Error fetching guide reviews:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, cursor } = req.query;

    const version = (await redis.get(`review:user:${userId}:v`)) || 1;
    const cacheKey = `review:user:${userId}:v:${version}:p:${page}:l:${limit}:c:${cursor || "none"}`;

    const cachedReviews = await redis.get(cacheKey);
    if (cachedReviews) {
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "User reviews retrieved successfully",
        data: JSON.parse(cachedReviews),
      });
    }
    
    const result = await reviewService.getUserReviews({
      userId,
      page: Number(page),
      limit: Number(limit),
      cursor: cursor as string,
    });

    await redis.setex(cacheKey, 1800, JSON.stringify(result));

    return responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "User reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.log("Error fetching user reviews:", error);
    responseManager.error(res, error as Error, 500);
  }
};



const getLatestReviews = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;

    const version = (await redis.get("global:reviews:version")) || 1;
    const cacheKey = `review:latest:v:${version}:l:${limit}`;

    const cachedReviews = await redis.get(cacheKey);
    if (cachedReviews) {
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "Latest reviews retrieved successfully",
        data: JSON.parse(cachedReviews),
      });
    }

    const result = await reviewService.getLatestReviews(Number(limit));

    await redis.setex(cacheKey, 3600, JSON.stringify(result));

    return responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Latest reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.log("Error fetching latest reviews:", error);
    responseManager.error(res, error as Error, 500);
  }
};

export const reviewController = {
  createReview,
  updateReview,
  getTourReviews,
  getGuideReviews,
  getUserReviews,
  getLatestReviews,
};

