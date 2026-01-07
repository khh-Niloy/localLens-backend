import { Router } from "express";
import { wishlistController } from "./wishlist.controller";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { Roles } from "../users/user.interface";
import { validateSchema } from "../../middleware/zodValidate";
import { addToWishlistZodSchema, removeFromWishlistZodSchema } from "./wishlist.validation";

export const wishlistRoutes = Router();

// All wishlist routes require authentication and tourist role
wishlistRoutes.use(roleBasedProtection(Roles.TOURIST));

// Get user's wishlist
wishlistRoutes.get("/", wishlistController.getUserWishlist);

// Add tour to wishlist
wishlistRoutes.post(
  "/",
  validateSchema(addToWishlistZodSchema),
  wishlistController.addToWishlist
);

// Remove tour from wishlist
wishlistRoutes.delete(
  "/:tourId",
  validateSchema(removeFromWishlistZodSchema),
  wishlistController.removeFromWishlist
);