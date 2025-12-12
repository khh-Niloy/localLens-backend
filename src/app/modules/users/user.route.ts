import { Router } from "express";
import { userController } from "./user.controller";
import { Roles } from "./user.interface";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { validateSchema } from "../../middleware/zodValidate";
import { userCreateZodSchema, userUpdateZodSchema } from "./user.validation";

export const userRoutes = Router();

// Public routes
userRoutes.get("/enums", userController.getUserEnums); // Get roles and statuses
userRoutes.get("/profile/:id", userController.getPublicProfile);

// Protected routes
userRoutes.get(
  "/profile",
  roleBasedProtection(...Object.values(Roles)),
  userController.getProfile
);

userRoutes.patch(
  "/profile",
  roleBasedProtection(...Object.values(Roles)),
  validateSchema(userUpdateZodSchema),
  userController.updateProfile
);

userRoutes.post(
  "/register",
  validateSchema(userCreateZodSchema),
  userController.createUser
);

// Admin routes
userRoutes.get(
  "/admin/all",
  roleBasedProtection(Roles.ADMIN),
  userController.getAllUser
);

userRoutes.patch(
  "/admin/:id",
  roleBasedProtection(Roles.ADMIN),
  userController.updateUser
);

userRoutes.delete(
  "/admin/:id",
  roleBasedProtection(Roles.ADMIN),
  userController.deleteUser
);
