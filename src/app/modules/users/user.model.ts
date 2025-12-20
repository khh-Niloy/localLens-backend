import { model, Schema } from "mongoose";
import { IisActive, IUser, Roles } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    image: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 6,
    },
    role: {
      type: String,
      required: true,
      enum: Roles,
      index: true,
    },
    phone: {
      type: String,
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
        "Please provide a valid phone number",
      ],
      trim: true,
    },
    address: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    language: {
      type: [String],
      required: false,
      default: [],
    },
    bio: {
      type: String,
      required: false,
      maxlength: 1000,
      trim: true,
    },

    // Guide-specific fields
    expertise: {
      type: [String],
      required: false,
    },
    dailyRate: {
      type: Number,
      required: false,
      min: 0,
      max: 100000,
    },

    // Tourist-specific fields
    travelPreferences: {
      type: [String],
      required: false,
    },
    isActive: {
      type: String,
      required: true,
      enum: IisActive,
      default: IisActive.ACTIVE,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.index({ role: 1, isDeleted: 1, isBlocked: 1 });
userSchema.index({ isActive: 1, isDeleted: 1 });

export const User = model<IUser>("User", userSchema);
