import { Router } from "express";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { validateSchema } from "../../middleware/zodValidate";
import { createBookingZodSchema, updateBookingStatusZodSchema } from "./booking.validation";
import { Roles } from "../users/user.interface";
import { bookingController } from "./booking.controller";

export const bookingRoutes = Router();

// Tourist routes
bookingRoutes.post(
  "/",
  roleBasedProtection(Roles.TOURIST),
  validateSchema(createBookingZodSchema),
  bookingController.createBooking
);

bookingRoutes.get(
  "/my-bookings",
  roleBasedProtection(Roles.TOURIST, Roles.GUIDE),
  bookingController.getMyBookings
);

bookingRoutes.post(
  "/:id/payment",
  roleBasedProtection(Roles.TOURIST),
  bookingController.initiatePayment
);

// Guide routes
bookingRoutes.get(
  "/guide/pending",
  roleBasedProtection(Roles.GUIDE),
  bookingController.getPendingBookings
);

bookingRoutes.patch(
  "/:id/status",
  roleBasedProtection(Roles.GUIDE, Roles.ADMIN),
  validateSchema(updateBookingStatusZodSchema),
  bookingController.updateBookingStatus
);

// Admin routes
bookingRoutes.get(
  "/admin/all-bookings",
  roleBasedProtection(Roles.ADMIN),
  bookingController.getAllBookings
);