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

export const bookingController = {
  createBooking,
};
