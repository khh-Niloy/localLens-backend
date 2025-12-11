import { Request, Response } from "express";
import { responseManager } from "../../utils/responseManager";
import { tourServices } from "./tour.service";
import { logger } from "../../utils/logger";

const createTour = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const imagePaths = files?.map((file) => file.path);

    const tourData = {
      ...req.body,
      images: imagePaths,
    };

    const tour = await tourServices.createTourService(tourData);

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "Tour created successfully",
      data: tour,
    });
  } catch (error) {
    logger.error(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getAllTours = async (req: Request, res: Response) => {
  try {
    const tours = await tourServices.getAllToursService();
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tours fetched successfully",
      data: tours,
    });
  } catch (error) {
    logger.error(error);
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
    logger.error(error);
    responseManager.error(res, error as Error, 500);
  }
};

const myTourList = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const tours = await tourServices.myTourListService(userId);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "My tour list fetched successfully",
      data: tours,
    });
  } catch (error) {
    logger.error(error);
    responseManager.error(res, error as Error, 500);
  }
};

export const TourController = {
  createTour,
  getAllTours,
  getTourBySlug,
  myTourList
};
