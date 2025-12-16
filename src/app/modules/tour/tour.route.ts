import { Router } from "express";
import { TourController } from "./tour.controller";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { Roles } from "../users/user.interface";
import { validateSchema } from "../../middleware/zodValidate";
import { createTourZodSchema, updateTourZodSchema, tourSearchZodSchema } from "./tour.validation";
import { upload } from "../../config/multer.config";

export const tourRoutes = Router();

// Public routes
tourRoutes.get("/", TourController.getAllTours);
tourRoutes.get("/enums", TourController.getTourEnums); // Get categories and statuses
tourRoutes.get("/debug", TourController.debugAllTours); // Debug endpoint to see all tours
tourRoutes.get(
  "/search", 
  validateSchema(tourSearchZodSchema),
  TourController.searchTours
);

// Specific routes MUST come before /:slug to avoid conflicts
// Guide-specific routes
tourRoutes.get(
  "/guide/my-tours",
  roleBasedProtection(Roles.GUIDE),
  TourController.getMyTours
);

// Universal my-tours endpoint for all roles
tourRoutes.get(
  "/my-tours",
  roleBasedProtection(Roles.TOURIST, Roles.GUIDE, Roles.ADMIN),
  TourController.getMyToursForAnyRole
);

// Generic slug route MUST be last
tourRoutes.get("/:slug", TourController.getTourBySlug);

tourRoutes.get(
  "/debug/user",
  roleBasedProtection(Roles.GUIDE, Roles.ADMIN),
  TourController.debugUser
);

tourRoutes.get(
  "/test/my-tours",
  roleBasedProtection(Roles.GUIDE),
  TourController.testMyTours
);

// Admin routes (must come before generic routes with :id)
tourRoutes.get(
  "/admin/all",
  roleBasedProtection(Roles.ADMIN),
  TourController.getAllToursForAdmin
);

// Protected routes for guides and admins
tourRoutes.post(
  "/",
  roleBasedProtection(Roles.GUIDE, Roles.ADMIN),
  upload.array('images', 10), // Allow up to 10 images
  validateSchema(createTourZodSchema),
  TourController.createTour
);

tourRoutes.get(
  "/details/:id",
  TourController.getTourById
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