import { Request, Response, NextFunction } from "express";
import { wishlistServices } from "./wishlist.service";
import { responseManager } from "../../utils/responseManager";
import { redis } from "../../lib/connectRedis";
import { logger } from "../../utils/logger";

const getUserWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    
    const version = (await redis.get(`wishlist:user:${userId}:v`)) || 1;
    const cacheKey = `wishlist:user:${userId}:v:${version}`;

    const cachedWishlist = await redis.get(cacheKey);
    if (cachedWishlist) {
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "Wishlist retrieved successfully",
        data: JSON.parse(cachedWishlist),
      });
    }

    const result = await wishlistServices.getUserWishlistService(userId);

    await redis.setex(cacheKey, 1800, JSON.stringify(result));

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Wishlist retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.log("Error fetching user wishlist:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { tourId } = req.body;

    const wishlistItem = await wishlistServices.addToWishlistService(userId, tourId);

    // Cache Invalidation
    await redis.incr(`wishlist:user:${userId}:v`);

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "Tour added to wishlist successfully",
      data: wishlistItem,
    });
  } catch (error) {
    logger.log("Error adding to wishlist:", error);
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

    // Cache Invalidation
    await redis.incr(`wishlist:user:${userId}:v`);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour removed from wishlist successfully",
      data: null,
    });
  } catch (error) {
    logger.log("Error removing from wishlist:", error);
    let statusCode = 500;
    if ((error as Error).message.includes("not found")) {
      statusCode = 404;
    }
    responseManager.error(res, error as Error, statusCode);
  }
};

export const wishlistController = {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
};
