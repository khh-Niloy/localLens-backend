import { NextFunction, Request, Response } from "express";
import { userServices } from "./user.service";
import { responseManager } from "../../utils/responseManager";
import { JwtPayload } from "jsonwebtoken";
import { cookiesManagement } from "../../utils/cookiesManagement";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = { ...req.body };

    const newCreatedUser = await userServices.createUserService(userData);
    cookiesManagement.setCookie(
      res,
      newCreatedUser.accessToken,
      newCreatedUser.refreshToken
    );
    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: newCreatedUser,
    });
  } catch (err) {
    console.log(err);
    responseManager.error(res, err as Error, 500);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    const payload = req.user;
    const reqBody = req.body;
    const updatedUserInfo = await userServices.updateUserService(
      userId,
      payload as JwtPayload,
      reqBody
    );

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "user info updated",
      data: updatedUserInfo,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getAllUser = async (req: Request, res: Response) => {
  try {
    const { allUser, totalCount } = await userServices.getAllUserService();
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "all user retreived",
      meta: totalCount,
      data: allUser,
    });
  } catch (error) {
    console.log(error);
  }
};

const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const { Roles } = await import("./user.interface");

    if (
      !Object.values(Roles).includes(role as (typeof Roles)[keyof typeof Roles])
    ) {
      return responseManager.error(res, new Error("Invalid role"), 400);
    }

    const { users, totalCount } = await userServices.getUsersByRoleService(
      role as (typeof Roles)[keyof typeof Roles]
    );
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: `${role} users retrieved successfully`,
      meta: totalCount,
      data: users,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getProfile = async (req: Request, res: Response) => {
  try {
    const userInfo = req.user;
    const profile = await userServices.getProfileService(
      userInfo as JwtPayload
    );
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "my info",
      data: profile,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await userServices.getPublicProfileService(id);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Public profile retrieved",
      data: profile,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const userInfo = req.user;
    const file = req.file as Express.Multer.File;

    console.log(
      "File uploaded:",
      file ? { path: file.path, fieldname: file.fieldname } : "No file"
    );

    const reqBody: any = {
      ...req.body,
    };

    if (file && file.path) {
      reqBody.image = file.path;
      console.log("Setting image URL:", file.path);
    }

    if (reqBody.dailyRate && typeof reqBody.dailyRate === "string") {
      reqBody.dailyRate = parseFloat(reqBody.dailyRate);
    }

    const updatedProfile = await userServices.updateProfileService(
      userInfo as JwtPayload,
      reqBody
    );

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userServices.deleteUserService(id);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "User deleted successfully",
      data: null,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getUserEnums = async (req: Request, res: Response) => {
  try {
    const { Roles, IisActive } = await import("./user.interface");

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "User enums fetched successfully",
      data: {
        roles: Object.values(Roles),
        activeStatuses: Object.values(IisActive),
      },
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

export const userController = {
  createUser,
  getAllUser,
  getUsersByRole,
  updateUser,
  getProfile,
  getPublicProfile,
  updateProfile,
  deleteUser,
  getUserEnums,
};
