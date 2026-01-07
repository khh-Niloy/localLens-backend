import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { IUser, Roles } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import { jwtManagement } from "../../utils/jwtManagement";

const createUserService = async (playLoad: Partial<IUser>) => {
  const { email, password, ...rest } = playLoad;

  const userEmail = email?.toLowerCase().trim();

  const isUserExist = await User.findOne({ email: userEmail });
  if (isUserExist) {
    throw new Error("User already exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    parseInt(envVars.BCRYPT_SALT_ROUND)
  );

  const userData = {
    email: userEmail,
    password: hashedPassword,
    ...rest,
  };

  const newCreatedUser = await User.create(userData);
  const userWithoutPassword = await User.findById(newCreatedUser._id);

  const jwtPayload = {
    userId: newCreatedUser._id,
    email: newCreatedUser.email,
    role: newCreatedUser.role,
  };

  const { accessToken, refreshToken } =
    jwtManagement.createAccessAndRefreshToken(jwtPayload);

  return { accessToken, refreshToken, user: userWithoutPassword };
};

const getProfileService = async (userInfo: JwtPayload) => {
  const profile = await User.findById(userInfo.userId);
  return profile;
};

const updateProfileService = async (
  userInfo: JwtPayload,
  reqBody: Partial<IUser>
) => {
  const userId = userInfo.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const allowedFields = [
    "name",
    "image",
    "phone",
    "address",
    "bio",
    "language",
  ];

  if (user.role === Roles.GUIDE) {
    allowedFields.push("expertise", "dailyRate");
  } else if (user.role === Roles.TOURIST) {
    allowedFields.push("travelPreferences");
  }

  const updateData: Partial<IUser> = {};

  for (const field of allowedFields) {
    const fieldKey = field as keyof IUser;
    if (reqBody[fieldKey] !== undefined) {
      (updateData as any)[fieldKey] = reqBody[fieldKey];
    }
  }

  const updatedProfile = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedProfile;
};

const getAllUsersService = async () => {
    const users = await User.find({ isDeleted: false }).sort({ createdAt: -1 });
    return users;
};

export const userServices = {
  createUserService,
  getProfileService,
  updateProfileService,
  getAllUsersService,
};
