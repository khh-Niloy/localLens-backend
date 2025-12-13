import { z } from "zod";
import { TOUR_CATEGORY, TOUR_STATUS } from "./tour.interface";

// Simplified validation schemas for easier frontend integration
export const createTourZodSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    longDescription: z.string().optional(),
    tourFee: z.union([z.string(), z.number()]).transform(val => parseFloat(val.toString())),
    maxDuration: z.union([z.string(), z.number()]).transform(val => parseFloat(val.toString())),
    meetingPoint: z.string().min(1, "Meeting point is required"),
    maxGroupSize: z.union([z.string(), z.number()]).transform(val => parseInt(val.toString())),
    category: z.nativeEnum(TOUR_CATEGORY),
    location: z.string().min(1, "Location is required"),
    cancellationPolicy: z.string().optional(),
    status: z.nativeEnum(TOUR_STATUS).optional(),
    // Arrays can be empty, will be handled in controller
    highlights: z.any().optional(),
    included: z.any().optional(),
    notIncluded: z.any().optional(),
    importantInfo: z.any().optional(),
    itinerary: z.any().optional(),
    availableDates: z.any().optional(),
  })
});

export const updateTourZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    longDescription: z.string().optional(),
    tourFee: z.union([z.string(), z.number()]).transform(val => parseFloat(val.toString())).optional(),
    maxDuration: z.union([z.string(), z.number()]).transform(val => parseFloat(val.toString())).optional(),
    meetingPoint: z.string().optional(),
    maxGroupSize: z.union([z.string(), z.number()]).transform(val => parseInt(val.toString())).optional(),
    category: z.nativeEnum(TOUR_CATEGORY).optional(),
    location: z.string().optional(),
    cancellationPolicy: z.string().optional(),
    status: z.nativeEnum(TOUR_STATUS).optional(),
    active: z.boolean().optional(),
    // Arrays - flexible handling
    highlights: z.any().optional(),
    included: z.any().optional(),
    notIncluded: z.any().optional(),
    importantInfo: z.any().optional(),
    itinerary: z.any().optional(),
    availableDates: z.any().optional(),
  })
});

// Simplified search validation
export const tourSearchZodSchema = z.object({
  query: z.object({
    category: z.nativeEnum(TOUR_CATEGORY).optional(),
      location: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    rating: z.string().optional(),
    maxDuration: z.string().optional(),
    date: z.string().optional(),
    search: z.string().optional(),
    page: z.string().default("1"),
    limit: z.string().default("10"),
    sortBy: z.enum(['price', 'rating', 'duration', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
});
