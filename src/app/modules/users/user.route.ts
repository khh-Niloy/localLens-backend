import { Router } from "express";
import { userController } from "./user.controller";
import { Roles } from "./user.interface";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { validateSchema } from "../../middleware/zodValidate";
import { userCreateZodSchema, userUpdateZodSchema } from "./user.validation";
import { profileUpload } from "../../config/multer.config";

export const userRoutes = Router();

// Public routes
userRoutes.get("/enums", userController.getUserEnums); // Get roles and statuses

userRoutes.post(
  "/register",
  validateSchema(userCreateZodSchema),
  userController.createUser
);

// Protected routes
userRoutes.get(
  "/profile",
  roleBasedProtection(...Object.values(Roles)),
  userController.getProfile
);

userRoutes.patch(
  "/profile",
  roleBasedProtection(...Object.values(Roles)),
  profileUpload.single('image'),
  validateSchema(userUpdateZodSchema),
  userController.updateProfile
);

// Admin routes
userRoutes.get(
  "/admin/all-users",
  roleBasedProtection(Roles.ADMIN),
  userController.getAllUsers
);
