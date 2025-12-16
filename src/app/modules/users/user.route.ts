import { NextFunction, Router } from "express";
import { userController } from "./user.controller";
import { Roles } from "./user.interface";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { validateSchema } from "../../middleware/zodValidate";
import { userCreateZodSchema } from "./user.validation";

export const userRoutes = Router();

userRoutes.get(
  "/all-user",
  roleBasedProtection(Roles.ADMIN),
  userController.getAllUser
);

userRoutes.get("/profile", roleBasedProtection(...Object.values(Roles)), userController.getProfile)

userRoutes.post(
  "/register",
  validateSchema(userCreateZodSchema),
  userController.createUser
);

userRoutes.patch(
  "/:id",
  roleBasedProtection(...Object.values(Roles)),
  userController.updateUser
);
