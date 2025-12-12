import { Router } from "express";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { Roles } from "../users/user.interface";
import { reviewController } from "./review.controller";

export const reviewRoutes = Router();

// Tourist routes - create and manage reviews
reviewRoutes.post(
  "/",
  roleBasedProtection(Roles.TOURIST),
  reviewController.createReview
);

reviewRoutes.patch(
  "/:id",
  roleBasedProtection(Roles.TOURIST),
  reviewController.updateReview
);

reviewRoutes.delete(
  "/:id",
  roleBasedProtection(Roles.TOURIST),
  reviewController.deleteReview
);

// Public routes - view reviews
reviewRoutes.get("/tour/:tourId", reviewController.getTourReviews);
reviewRoutes.get("/guide/:guideId", reviewController.getGuideReviews);
reviewRoutes.get("/user/:userId", reviewController.getUserReviews);

// Mark review as helpful
reviewRoutes.patch(
  "/:id/helpful",
  roleBasedProtection(...Object.values(Roles)),
  reviewController.markHelpful
);

// Admin routes
reviewRoutes.get(
  "/admin/all",
  roleBasedProtection(Roles.ADMIN),
  reviewController.getAllReviews
);

reviewRoutes.delete(
  "/admin/:id",
  roleBasedProtection(Roles.ADMIN),
  reviewController.adminDeleteReview
);

