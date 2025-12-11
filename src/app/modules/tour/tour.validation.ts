import { z } from "zod";

export const tourCreateZodSchema = z.object({
  guideId: z.string(),
  title: z.string(),
  description: z.string(),
  itinerary: z.array(
    z.object({
      time: z.string(),
      activity: z.string(),
      location: z.string().optional(),
    })
  ),
  tourFee: z.number(),
  maxDuration: z.number(),
  meetingPoint: z.string(),
  maxGroupSize: z.number(),
  images: z.array(z.string()).optional(),
});
