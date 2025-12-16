import { Request, Response, NextFunction } from "express";
import { wishlistServices } from "./wishlist.service";
import { responseManager } from "../../utils/responseManager";

const getUserWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const wishlist = await wishlistServices.getUserWishlistService(userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Wishlist retrieved successfully",
      data: wishlist,
    });
  } catch (error) {
    responseManager.error(res, error as Error, 500);
  }
};

const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { tourId } = req.body;

    const wishlistItem = await wishlistServices.addToWishlistService(userId, tourId);

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "Tour added to wishlist successfully",
      data: wishlistItem,
    });
  } catch (error) {
    let statusCode = 500;
    if ((error as Error).message.includes("not found")) {
      statusCode = 404;
    } else if ((error as Error).message.includes("already in")) {
      statusCode = 409;
    }
    responseManager.error(res, error as Error, statusCode);
  }
};

const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { tourId } = req.params;

    await wishlistServices.removeFromWishlistService(userId, tourId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour removed from wishlist successfully",
      data: null,
    });
  } catch (error) {
    let statusCode = 500;
    if ((error as Error).message.includes("not found")) {
      statusCode = 404;
    }
    responseManager.error(res, error as Error, statusCode);
  }
};

const checkWishlistStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { tourId } = req.params;

    const status = await wishlistServices.checkWishlistStatusService(userId, tourId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Wishlist status retrieved successfully",
      data: status,
    });
  } catch (error) {
    responseManager.error(res, error as Error, 500);
  }
};

export const wishlistController = {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
};
