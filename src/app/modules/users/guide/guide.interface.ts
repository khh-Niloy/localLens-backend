import { Types } from "mongoose";

export interface IGuide {
  userId: Types.ObjectId;
  expertise: string[];
  dailyRate: number;
}
