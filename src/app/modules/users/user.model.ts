import { model, Schema } from "mongoose";
import { IisActive, IUser, Roles } from "./user.interface";

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: Roles },
  language: { type: [String], required: true },
  bio: { type: String, required: true },
  isActive: { type: String, required: true, enum: IisActive },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
});

export const User = model<IUser>("User", userSchema);
