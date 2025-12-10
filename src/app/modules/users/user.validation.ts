import { z } from "zod";

export const userCreateZodSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});