import { Request, Response } from "express";
import { responseManager } from "../../utils/responseManager";
import { reviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const reviewData = { ...req.body, userId };
    
    const result = await reviewService.createReview(reviewData);
    responseManager(res, 201, true, "Review created successfully", result);
  } catch (error: any) {
    responseManager(res, 500, false, error.message);
  }
};

const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    const result = await reviewService.updateReview(id, userId, req.body);
    responseManager(res, 200, true, "Review updated successfully", result);
  } catch (error: any) {
    responseManager(res, 500, false, error.message);
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    await reviewService.deleteReview(id, userId);
    responseManager(res, 200, true, "Review deleted successfully");
  } catch (error: any) {
    responseManager(res, 500, false, error.message);
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
    responseManager(res, 200, true, "Tour reviews retrieved successfully", result);
  } catch (error: any) {
    responseManager(res, 500, false, error.message);
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
    responseManager(res, 200, true, "Guide reviews retrieved successfully", result);
  } catch (error: any) {
    responseManager(res, 500, false, error.message);
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
    responseManager(res, 200, true, "User reviews retrieved successfully", result);
  } catch (error: any) {
    responseManager(res, 500, false, error.message);
  }
};

const markHelpful = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await reviewService.markHelpful(id);
    responseManager(res, 200, true, "Review marked as helpful", result);
  } catch (error: any) {
    responseManager(res, 500, false, error.message);
  }
};

const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const result = await reviewService.getAllReviews(Number(page), Number(limit));
    responseManager(res, 200, true, "All reviews retrieved successfully", result);
  } catch (error: any) {
    responseManager(res, 500, false, error.message);
  }
};

const adminDeleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await reviewService.adminDeleteReview(id);
    responseManager(res, 200, true, "Review deleted successfully");
  } catch (error: any) {
    responseManager(res, 500, false, error.message);
  }
};

export const reviewController = {
  createReview,
  updateReview,
  deleteReview,
  getTourReviews,
  getGuideReviews,
  getUserReviews,
  markHelpful,
  getAllReviews,
  adminDeleteReview,
};

