import { NextFunction, Request, Response } from "express";
import { userServices } from "./user.service";
import { responseManager } from "../../utils/responseManager";
import { JwtPayload } from "jsonwebtoken";
import { cookiesManagement } from "../../utils/cookiesManagement";
import { redis } from "../../lib/connectRedis";
import { IisActive, Roles } from "./user.interface";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = { ...req.body };

    const newCreatedUser = await userServices.createUserService(userData);
    cookiesManagement.setCookie(
      res,
      newCreatedUser.accessToken,
      newCreatedUser.refreshToken
    );

    await redis.incr("user:v");

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

const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const version = (await redis.get(`user:profile:${userId}:version`)) || 1
    const cacheKey = `user:profile:${userId}:v${version}`
    const profileCache = await redis.get(cacheKey)

    if(profileCache){
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "my info",
        data: JSON.parse(profileCache),
      });
    }

    const userInfo = req.user;
    const profile = await userServices.getProfileService(
      userInfo as JwtPayload
    );

    await redis.set(cacheKey, JSON.stringify(profile), "EX", 1800);

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

const updateProfile = async (req: Request, res: Response) => {
  try {
    const userInfo = req.user;
    const file = req.file as Express.Multer.File;

    // console.log(
    //   "File uploaded:",
    //   file ? { path: file.path, fieldname: file.fieldname } : "No file"
    // );

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

    await redis.incr(`user:profile:${userInfo.userId}:version`);

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

const getUserEnums = async (req: Request, res: Response) => {
  try {
    const cached = await redis.get("user:enums");

    if(cached){
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "User enums fetched successfully",
        data: JSON.parse(cached),
      });
    }

    const data = {
      roles: Object.values(Roles),
      activeStatuses: Object.values(IisActive),
    }

    await redis.set("user:enums", JSON.stringify(data), "EX", 1800);

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

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const version = (await redis.get("user:v")) || 1
    const userCacheKey = `user:v${version}`

    const userCache = await redis.get(userCacheKey);

    if(userCache){
      return responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "All users retrieved successfully",
        data: JSON.parse(userCache),
      });
    }

    const users = await userServices.getAllUsersService();
    await redis.set(userCacheKey, JSON.stringify(users), "EX", 1800);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "All users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

export const userController = {
  createUser,
  getProfile,
  updateProfile,
  getUserEnums,
  getAllUsers,
};
