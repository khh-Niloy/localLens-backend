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

const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const { Roles } = await import("./user.interface");
    
    if (!Object.values(Roles).includes(role as Roles)) {
      return responseManager.error(res, new Error("Invalid role"), 400);
    }
    
    const { users, totalCount } = await userServices.getUsersByRoleService(role as Roles);
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
    
    console.log('File uploaded:', file ? { path: file.path, fieldname: file.fieldname } : 'No file');
    
    // Helper function to safely parse JSON or return array
    const parseArrayField = (field: any): any[] => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return field.split(',').map((item: string) => item.trim()).filter(Boolean);
        }
      }
      return [];
    };

    // Parse array fields from FormData (they come as JSON strings)
    const reqBody: any = {
      ...req.body,
    };
    
    // If a file was uploaded, add the Cloudinary URL to the request body
    if (file && file.path) {
      reqBody.image = file.path;
      console.log('Setting image URL:', file.path);
    }

    // Parse array fields if they exist
    if (reqBody.language) {
      reqBody.language = parseArrayField(reqBody.language);
    }
    if (reqBody.expertise) {
      reqBody.expertise = parseArrayField(reqBody.expertise);
    }
    if (reqBody.travelPreferences) {
      reqBody.travelPreferences = parseArrayField(reqBody.travelPreferences);
    }

    // Parse dailyRate if it's a string
    if (reqBody.dailyRate && typeof reqBody.dailyRate === 'string') {
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
  getUsersByRole,
  updateUser,
  getProfile,
  getPublicProfile,
  updateProfile,
  deleteUser,
  getUserEnums,
};
