import { z } from "zod";

export const addToWishlistZodSchema = z.object({
  body: z.object({
    tourId: z.string().min(1, "Tour ID is required"),
  })
});

export const removeFromWishlistZodSchema = z.object({
  params: z.object({
    tourId: z.string().min(1, "Tour ID is required"),
  })
});
