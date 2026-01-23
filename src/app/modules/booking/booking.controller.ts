import { Request, Response } from "express";
import { bookingServices } from "./booking.service";
import { responseManager } from "../../utils/responseManager";
import { JwtPayload } from "jsonwebtoken";
import { redis } from "../../lib/connectRedis";
import { logger } from "../../utils/logger";

const createBooking = async (req: Request, res: Response) => {
  try {
    const jwt_user = req.user as JwtPayload;
    const result = await bookingServices.createBookingService(
      req.body,
      jwt_user.userId
    );

    await redis.incr(`booking:my:user:${jwt_user.userId}:v`);
    await redis.incr(`booking:my:user:${result?.guideId}:v`);
    await redis.incr(`booking:pending:guide:${result?.guideId}:v`);
    await redis.incr("booking:all:v");

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (error) {
    logger.log("Error creating booking:", error);
    responseManager.error(res, error as Error, 400);
  }
};

const getMyBookings = async (req: Request, res: Response) => {
  try {
    const jwt_user = req.user as JwtPayload;
    
    const version = (await redis.get(`booking:my:user:${jwt_user.userId}:v`)) || 1;
    const cacheKey = `booking:my:user:${jwt_user.userId}:v:${version}`;

    const cachedBookings = await redis.get(cacheKey);
    if (cachedBookings) {
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "My bookings retrieved successfully",
        data: JSON.parse(cachedBookings),
      });
    }

    const result = await bookingServices.getMyBookingsService(
      jwt_user.userId,
      jwt_user.role
    );

    await redis.setex(cacheKey, 1800, JSON.stringify(result));

    return responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "My bookings retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.log("Error fetching my bookings:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getPendingBookings = async (req: Request, res: Response) => {
  try {
    const jwt_user = req.user as JwtPayload;
    
    // const version = (await redis.get(`booking:pending:guide:${jwt_user.userId}:v`)) || 1;
    // const cacheKey = `booking:pending:guide:${jwt_user.userId}:v:${version}`;

    // const cachedBookings = await redis.get(cacheKey);
    // if (cachedBookings) {
    //   return responseManager.success(res, {
    //     statusCode: 200,
    //     success: true,
    //     message: "Pending bookings retrieved successfully",
    //     data: JSON.parse(cachedBookings),
    //   });
    // }

    const result = await bookingServices.getPendingBookingsService(jwt_user.userId);

    // await redis.setex(cacheKey, 1800, JSON.stringify(result));

    return responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Pending bookings retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.log("Error fetching pending bookings:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const jwt_user = req.user as JwtPayload;
    
    const booking = (await bookingServices.updateBookingStatusService(id, status, jwt_user.userId)) as any;

    // Cache Invalidation
    await redis.incr(`booking:my:user:${jwt_user.userId}:v`);
    await redis.incr(`booking:my:user:${booking?.userId?._id || booking?.userId}:v`);
    await redis.incr(`booking:pending:guide:${jwt_user.userId}:v`);
    await redis.incr("booking:all:v");

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    logger.log("Error updating booking status:", error);
    responseManager.error(res, error as Error, 400);
  }
};

const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jwt_user = req.user as JwtPayload;
    
    const result = await bookingServices.initiatePaymentForCompletedBooking(id, jwt_user.userId) as any;

    // Cache Invalidation
    await redis.incr(`booking:my:user:${jwt_user.userId}:v`);
    await redis.incr("booking:all:v");

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Payment initiated successfully",
      data: result,
    });
  } catch (error) {
    logger.log("Error initiating payment:", error);
    responseManager.error(res, error as Error, 400);
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const version = (await redis.get("booking:all:v")) || 1;
    const cacheKey = `booking:all:v:${version}`;

    const cachedBookings = await redis.get(cacheKey);
    if (cachedBookings) {
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "All bookings retrieved successfully",
        data: JSON.parse(cachedBookings),
      });
    }

    const result = await bookingServices.getAllBookingsService();

    await redis.setex(cacheKey, 1800, JSON.stringify(result));

    return responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "All bookings retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.log("Error fetching all bookings:", error);
    responseManager.error(res, error as Error, 500);
  }
};

export const bookingController = {
  createBooking,
  getMyBookings,
  getPendingBookings,
  updateBookingStatus,
  initiatePayment,
  getAllBookings,
};
