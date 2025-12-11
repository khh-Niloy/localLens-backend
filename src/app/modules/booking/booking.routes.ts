import { Router } from "express";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { validateSchema } from "../../middleware/zodValidate";
import { createBookingZodSchema } from "./booking.validation";
import { Roles } from "../users/user.interface";
import { bookingController } from "./booking.controller";

export const bookingRoutes = Router()

bookingRoutes.post("/",roleBasedProtection(...Object.values(Roles)), validateSchema(createBookingZodSchema), bookingController.createBooking)