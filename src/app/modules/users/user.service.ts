import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { IUser, Roles } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import { jwtManagement } from "../../utils/jwtManagement";

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

  // Set default values for required fields
  const userData = {
    email,
    password: hashedPassword,
    language: rest.language || ["English"],
    bio: rest.bio || "No bio provided",
    image: rest.image || "https://via.placeholder.com/150",
    ...rest,
  };

  const newCreatedUser = await User.create(userData);

  const jwtPayload = {
    userId: newCreatedUser._id,
    email: newCreatedUser.email,
    role: newCreatedUser.role,
  };

  const { accessToken, refreshToken } = jwtManagement.createAccessAndRefreshToken(jwtPayload);

  return { accessToken, refreshToken, user: newCreatedUser };
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

const getUsersByRoleService = async (role: Roles) => {
  const users = await User.find({ role, isDeleted: false })
    .select("-password")
    .sort({ createdAt: -1 });
  const totalCount = await User.countDocuments({ role, isDeleted: false });
  return { users, totalCount };
};

const getProfileService = async (userInfo: JwtPayload) => {
  const profile = await User.findById(userInfo.userId).select("-password")
  return profile
};

const getPublicProfileService = async (userId: string) => {
  const profile = await User.findById(userId).select("-password -isDeleted -isBlocked");
  if (!profile) {
    throw new Error("User not found");
  }
  return profile;
};

const updateProfileService = async (userInfo: JwtPayload, reqBody: Partial<IUser>) => {
  const userId = userInfo.userId;
  
  // Users can only update their own profile
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent users from updating sensitive fields
  // Common fields + role-specific fields
  const allowedFields = ['name', 'image', 'phone', 'address', 'bio', 'language'];
  
  // Add role-specific fields
  if (user.role === Roles.GUIDE) {
    allowedFields.push('expertise', 'dailyRate');
  } else if (user.role === Roles.TOURIST) {
    allowedFields.push('travelPreferences');
  }
  
  const updateData: Partial<IUser> = {};
  
  for (const field of allowedFields) {
    if (reqBody[field as keyof IUser] !== undefined) {
      updateData[field as keyof IUser] = reqBody[field as keyof IUser];
    }
  }

  const updatedProfile = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select("-password");

  return updatedProfile;
};

const deleteUserService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent deletion of admin users
  if (user.role === Roles.ADMIN) {
    throw new Error("Cannot delete admin users");
  }

  // Soft delete by setting isDeleted to true
  await User.findByIdAndUpdate(userId, { isDeleted: true });
  return { message: "User deleted successfully" };
};

export const userServices = {
  createUserService,
  getAllUserService,
  getUsersByRoleService,
  updateUserService,
  getProfileService,
  getPublicProfileService,
  updateProfileService,
  deleteUserService
};
