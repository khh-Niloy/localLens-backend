import { model, Schema } from "mongoose";
import { IisActive, IUser, Roles } from "./user.interface";

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  image: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: Roles },
  phone: { type: String },
  address: { type: String },
  language: { type: [String], required: false, default: [] },
  bio: { type: String, required: false },
  // Guide-specific fields
  expertise: { type: [String], required: false, default: [] },
  dailyRate: { type: Number, required: false, min: 0 },
  // Tourist-specific fields
  travelPreferences: { type: [String], required: false, default: [] },
  isActive: { type: String, required: true, enum: IisActive, default: IisActive.ACTIVE },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
});

export const User = model<IUser>("User", userSchema);
