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
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 500 },
    longDescription: { type: String, maxlength: 5000 },
    itinerary: { type: [itinerarySchema], default: [] },
    tourFee: { type: Number, required: true, min: 0, max: 100000 },
    maxDuration: { type: Number, required: true, min: 1, max: 168 },
    meetingPoint: { type: String, required: true, maxlength: 500 },
    maxGroupSize: { type: Number, required: true, min: 1, max: 100 },
    category: { 
      type: String, 
      enum: Object.values(TOUR_CATEGORY), 
      required: true 
    },
    location: { type: String, required: true, maxlength: 200 },
    images: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    included: { type: [String], default: [] },
    notIncluded: { type: [String], default: [] },
    importantInfo: { type: [String], default: [] },
    cancellationPolicy: { type: String, maxlength: 1000 },
    availableDates: { type: [availableDateSchema], default: [] },
    status: { 
      type: String, 
      enum: Object.values(TOUR_STATUS), 
      default: TOUR_STATUS.ACTIVE 
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    bookingCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

// Single field indexes
tourSchema.index({ guideId: 1 });
tourSchema.index({ category: 1 });
tourSchema.index({ location: 1 });
tourSchema.index({ rating: -1 });
tourSchema.index({ tourFee: 1 });
tourSchema.index({ createdAt: -1 });

// Compound indexes for common queries
tourSchema.index({ status: 1 }); // Most common: active tours
tourSchema.index({ status: 1, category: 1 }); // Search with category
tourSchema.index({ guideId: 1, status: 1 }); // Guide's active tours

// Text search index
tourSchema.index({ title: 'text', description: 'text', location: 'text' });

export const Tour = model<ITourListing>("Tour", tourSchema);
