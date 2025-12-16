import { model, Schema } from "mongoose";
import { IAvailableDate, IItineraryItem, ITourListing, TOUR_CATEGORY, TOUR_STATUS } from "./tour.interface";

const itinerarySchema = new Schema<IItineraryItem>({
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
});

const availableDateSchema = new Schema<IAvailableDate>({
  date: { type: String, required: true },
  times: { type: [String], required: true },
});

const tourSchema = new Schema<ITourListing>(
  {
    slug: { type: String, required: true, unique: true },
    guideId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String },
    itinerary: { type: [itinerarySchema], default: [] },
    tourFee: { type: Number, required: true },
    maxDuration: { type: Number, required: true },
    meetingPoint: { type: String, required: true },
    maxGroupSize: { type: Number, required: true },
    category: { 
      type: String, 
      enum: Object.values(TOUR_CATEGORY), 
      required: true 
    },
    location: { type: String, required: true },
    images: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    included: { type: [String], default: [] },
    notIncluded: { type: [String], default: [] },
    importantInfo: { type: [String], default: [] },
    cancellationPolicy: { type: String },
    availableDates: { type: [availableDateSchema], default: [] },
    status: { 
      type: String, 
      enum: Object.values(TOUR_STATUS), 
      default: TOUR_STATUS.ACTIVE 
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// Indexes for better performance (slug index is already defined in schema)
tourSchema.index({ guideId: 1 });
tourSchema.index({ category: 1 });
tourSchema.index({ location: 1 });
tourSchema.index({ rating: -1 });
tourSchema.index({ tourFee: 1 });
tourSchema.index({ status: 1, active: 1 });
tourSchema.index({ title: 'text', description: 'text', location: 'text' });

export const Tour = model<ITourListing>("Tour", tourSchema);
