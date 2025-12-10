import { model, Schema } from "mongoose";
import { ITourist } from "./tourist.interface";

const touristSchema = new Schema<ITourist>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    travelPreferences: { type: Schema.Types.Mixed, required: true },
});

export const Tourist = model<ITourist>('Tourist', touristSchema);