import { NextFunction, Request, Response } from "express";
import { userServices } from "./user.service";
import { responseManager } from "../../utils/responseManager";
import { JwtPayload } from "jsonwebtoken";
import { cookiesManagement } from "../../utils/cookiesManagement";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parse language array if it's a string
    const userData = { ...req.body };
    if (userData.language && typeof userData.language === 'string') {
      try {
        userData.language = JSON.parse(userData.language);
      } catch {
        userData.language = userData.language.split(',').map((lang: string) => lang.trim());
      }
    }
    
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
    const reqBody = req.body;
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
        activeStatuses: Object.values(IisActive)
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
  updateUser,
  getProfile,
  getPublicProfile,
  updateProfile,
  deleteUser,
  getUserEnums,
};
