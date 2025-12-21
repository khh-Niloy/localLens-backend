import { Router } from "express";
import { TourController } from "./tour.controller";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { Roles } from "../users/user.interface";
import { validateSchema } from "../../middleware/zodValidate";
import { createTourZodSchema, updateTourZodSchema, tourSearchZodSchema } from "./tour.validation";
import { upload } from "../../config/multer.config";

export const tourRoutes = Router();

tourRoutes.post(
  "/",
  roleBasedProtection(Roles.GUIDE, Roles.ADMIN),
  upload.array('images', 10),
  validateSchema(createTourZodSchema),
  TourController.createTour
);

tourRoutes.get("/enums", TourController.getTourEnums);

tourRoutes.get("/", TourController.getAllTours);

tourRoutes.get("/:slug", TourController.getTourBySlug);

tourRoutes.get(
  "/search", 
  validateSchema(tourSearchZodSchema),
  TourController.searchTours
);

tourRoutes.get(
  "/guide/my-tours",
  roleBasedProtection(Roles.GUIDE),
  TourController.getGuideMyTours
);

tourRoutes.get(
  "/tourist/my-tours",
  roleBasedProtection(Roles.TOURIST),
  TourController.getTouristMyTours
);

tourRoutes.patch(
  "/:id",
  roleBasedProtection(Roles.GUIDE, Roles.ADMIN),
  upload.array('images', 10),
  validateSchema(updateTourZodSchema),
  TourController.updateTour
);

tourRoutes.delete(
  "/:id",
  roleBasedProtection(Roles.GUIDE, Roles.ADMIN),
  TourController.deleteTour
);

// Admin routes
tourRoutes.get(
  "/admin/all-tours",
  roleBasedProtection(Roles.ADMIN),
  TourController.getAllToursForAdmin
);