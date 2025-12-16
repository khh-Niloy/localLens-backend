import { z } from "zod";
import { IisActive, Roles } from "./user.interface";

// Simplified user validation for easier frontend integration
export const userCreateZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    image: z.string().optional(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    address: z.string().optional(),
    role: z.nativeEnum(Roles),
    bio: z.string().optional(),
    language: z.any().optional(), // Flexible array handling
    isActive: z.nativeEnum(IisActive).optional(),
  })
});

export const userUpdateZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    image: z.string().optional(), // This will be set from file.path after multer upload
    phone: z.string().optional(),
    address: z.string().optional(),
    bio: z.string().optional(),
    language: z.any().optional(), // Flexible array handling
    // Guide-specific fields
    expertise: z.any().optional(), // Flexible array handling
    dailyRate: z.union([z.number(), z.string()]).optional().transform((val) => {
      if (typeof val === 'string') return parseFloat(val);
      return val;
    }),
    // Tourist-specific fields
    travelPreferences: z.any().optional(), // Flexible array handling
  })
});