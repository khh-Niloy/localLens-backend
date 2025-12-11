import { model, Schema } from "mongoose";
import { IItineraryItem, ITourListing } from "./tour.interface";

const itinerarySchema = new Schema<IItineraryItem>({
  time: { type: String },
  activity: { type: String },
  location: { type: String },
});

const tourSchema = new Schema<ITourListing>(
  {
    slug: { type: String, required: true, unique: true },
    guideId: { type: Schema.Types.ObjectId, ref: "Guide", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    itinerary: { type: [itinerarySchema], required: true },
    tourFee: { type: Number, required: true },
    maxDuration: { type: Number, required: true },
    meetingPoint: { type: String, required: true },
    maxGroupSize: { type: Number, required: true },
    images: { type: [String] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const Tour = model<ITourListing>("Tour", tourSchema);
