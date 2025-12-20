import { Schema, model } from "mongoose";
import { IReview } from "./review.interface";

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tourId: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    guideId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint - one review per booking
reviewSchema.index({ bookingId: 1 }, { unique: true });

// Single field indexes
reviewSchema.index({ userId: 1 });
reviewSchema.index({ tourId: 1 });
reviewSchema.index({ guideId: 1 });
reviewSchema.index({ rating: -1 });

// Compound indexes for common queries
reviewSchema.index({ tourId: 1, createdAt: -1 });
reviewSchema.index({ guideId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

export const Review = model<IReview>("Review", reviewSchema);

