import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { IUser, Roles } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";

const createUserService = async (playLoad: Partial<IUser>) => {
  const { email, password, ...rest } = playLoad;

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new Error("User already exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    parseInt(envVars.BCRYPT_SALT_ROUND)
  );

  const newCreatedUser = await User.create({
    email,
    password: hashedPassword,
    ...rest,
  });
  return newCreatedUser;
};

const updateUserService = async (
  userId: string,
  payload: JwtPayload,
  reqBody: Partial<IUser>
) => {

  if ( reqBody.role !== undefined && [Roles.TOURIST, Roles.GUIDE].includes(reqBody.role)) {
    if(payload.userId !== userId){
      throw new Error("you are not authorized to change others info");
    }
  }

  if (
    payload.role &&
    reqBody.role !== undefined &&
    [Roles.TOURIST, Roles.GUIDE].includes(reqBody.role)
  ) {
    throw new Error("you are not authorized to change role");
  }

  if (
    (reqBody?.isActive || reqBody?.isDeleted) &&
    reqBody.role !== undefined &&
    [Roles.TOURIST, Roles.GUIDE].includes(reqBody.role)
  ) {
    throw new Error(
      "you are not authorized to make this change"
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("user not found!");
  }

  if(payload.role == Roles.ADMIN && user.role == Roles.ADMIN){
    throw new Error("you can not update super admin info");
  }

  const updateUser = await User.findByIdAndUpdate(userId, reqBody, {
    new: true,
  });
  return updateUser;
};

const getAllUserService = async () => {
  const allUser = await User.find({});
  const totalCount = await User.countDocuments();
  return { allUser, totalCount };
};

const getProfileService = async (userInfo: JwtPayload) => {
  const profile = await User.findById(userInfo.userId).select("-password")
  return profile
};

export const userServices = {
  createUserService,
  getAllUserService,
  updateUserService,
  getProfileService
};
