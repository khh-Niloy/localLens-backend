import { z } from "zod";

export const createReviewZodSchema = z.object({
  body: z.object({
    tourId: z.string().min(1, "Tour ID is required"),
    guideId: z.string().min(1, "Guide ID is required"),
    bookingId: z.string().min(1, "Booking ID is required"),
    rating: z.number().min(1).max(5),
    comment: z.string().max(1000).optional(),
  })
});

export const updateReviewZodSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().max(1000).optional(),
  })
});
