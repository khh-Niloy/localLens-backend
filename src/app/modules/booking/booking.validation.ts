import { z } from "zod";
import { BOOKING_STATUS } from "./booking.interface";

export const createBookingZodSchema = z.object({
  body: z.object({
    tourId: z.string().min(1, "Tour ID is required"),
    guideId: z.string().min(1, "Guide ID is required"),
    bookingDate: z.string().min(1, "Booking date is required"),
    bookingTime: z.string().min(1, "Booking time is required"),
    numberOfGuests: z.number().positive("Number of guests must be positive").max(50, "Too many guests"),
    totalAmount: z.number().positive("Total amount must be positive"),
  })
});

export const updateBookingStatusZodSchema = z.object({
  body: z.object({
    status: z.nativeEnum(BOOKING_STATUS, { errorMap: () => ({ message: "Invalid booking status" }) }),
  })
});
