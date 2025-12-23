import { Router } from "express";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { validateSchema } from "../../middleware/zodValidate";
import { Roles } from "../users/user.interface";
import { reviewController } from "./review.controller";
import { createReviewZodSchema, updateReviewZodSchema } from "./review.validation";

export const reviewRoutes = Router();

// Tourist routes - create and manage reviews
reviewRoutes.post(
  "/",
  roleBasedProtection(Roles.TOURIST),
  validateSchema(createReviewZodSchema),
  reviewController.createReview
);

reviewRoutes.patch(
  "/:id",
  roleBasedProtection(Roles.TOURIST),
  validateSchema(updateReviewZodSchema),
  reviewController.updateReview
);

// Public routes - view reviews
reviewRoutes.get("/tour/:tourId", reviewController.getTourReviews);
reviewRoutes.get("/guide/:guideId", reviewController.getGuideReviews);
reviewRoutes.get("/user/:userId", reviewController.getUserReviews);

