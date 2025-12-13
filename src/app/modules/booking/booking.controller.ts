import { Request, Response } from "express";
import { bookingServices } from "./booking.service";
import { responseManager } from "../../utils/responseManager";
import { JwtPayload } from "jsonwebtoken";

const createBooking = async (req: Request, res: Response) => {
  try {
    const jwt_user = req.user as JwtPayload;
    const newBooking = await bookingServices.createBookingService(
      req.body,
      jwt_user.userId
    );

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 400);
  }
};

const getMyBookings = async (req: Request, res: Response) => {
  try {
    const jwt_user = req.user as JwtPayload;
    const bookings = await bookingServices.getMyBookingsService(jwt_user.userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "My bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getUpcomingBookings = async (req: Request, res: Response) => {
  try {
    const jwt_user = req.user as JwtPayload;
    const bookings = await bookingServices.getUpcomingBookingsService(jwt_user.userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Upcoming bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getPendingBookings = async (req: Request, res: Response) => {
  try {
    const jwt_user = req.user as JwtPayload;
    const bookings = await bookingServices.getPendingBookingsService(jwt_user.userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Pending bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getAllGuideBookings = async (req: Request, res: Response) => {
  try {
    const jwt_user = req.user as JwtPayload;
    const bookings = await bookingServices.getAllGuideBookingsService(jwt_user.userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "All bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const jwt_user = req.user as JwtPayload;
    
    const booking = await bookingServices.updateBookingStatusService(id, status, jwt_user.userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 400);
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await bookingServices.getAllBookingsService();

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "All bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jwt_user = req.user as JwtPayload;
    const booking = await bookingServices.getBookingByIdService(id, jwt_user.userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Booking retrieved successfully",
      data: booking,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jwt_user = req.user as JwtPayload;
    
    const result = await bookingServices.initiatePaymentForCompletedBooking(id, jwt_user.userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Payment initiated successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 400);
  }
};

export const bookingController = {
  createBooking,
  getMyBookings,
  getUpcomingBookings,
  getPendingBookings,
  getAllGuideBookings,
  updateBookingStatus,
  getAllBookings,
  getBookingById,
  initiatePayment,
};
