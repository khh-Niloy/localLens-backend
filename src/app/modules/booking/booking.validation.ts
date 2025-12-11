import { z } from "zod";

export const createBookingZodSchema = z.object({
    tourid: z.string(),
    userId: z.string(),
});
