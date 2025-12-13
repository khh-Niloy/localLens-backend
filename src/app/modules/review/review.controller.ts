import { Request, Response } from "express";
import { responseManager } from "../../utils/responseManager";
import { reviewService } from "./review.service";
import { JwtPayload } from "jsonwebtoken";

const createReview = async (req: Request, res: Response) => {
  try {
    const jwt_user = req.user as JwtPayload;
    const reviewData = { ...req.body, userId: jwt_user.userId };
    
    const result = await reviewService.createReview(reviewData);
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
    
    const result = await reviewService.updateReview(id, jwt_user.userId, req.body);
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

const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jwt_user = req.user as JwtPayload;
    
    await reviewService.deleteReview(id, jwt_user.userId);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Review deleted successfully",
      data: null,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 400);
  }
};

const getTourReviews = async (req: Request, res: Response) => {
  try {
    const { tourId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await reviewService.getTourReviews(
      tourId,
      Number(page),
      Number(limit)
    );
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getGuideReviews = async (req: Request, res: Response) => {
  try {
    const { guideId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await reviewService.getGuideReviews(
      guideId,
      Number(page),
      Number(limit)
    );
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Guide reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await reviewService.getUserReviews(
      userId,
      Number(page),
      Number(limit)
    );
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "User reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const result = await reviewService.getAllReviews(Number(page), Number(limit));
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "All reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const adminDeleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await reviewService.adminDeleteReview(id);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Review deleted successfully",
      data: null,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 400);
  }
};

export const reviewController = {
  createReview,
  updateReview,
  deleteReview,
  getTourReviews,
  getGuideReviews,
  getUserReviews,
  getAllReviews,
  adminDeleteReview,
};

