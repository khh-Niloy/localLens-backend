import { model, Schema } from "mongoose";
import { IGuide } from "./guide.interface";

const guideSchema = new Schema<IGuide>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  expertise: { type: [String], required: true },
  dailyRate: { type: Number, required: true },
});

export const Guide = model<IGuide>("Guide", guideSchema);
