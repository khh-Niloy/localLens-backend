import { model, Schema } from "mongoose";
import { BOOKING_STATUS, IBooking } from "./booking.interface";

const bookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tourId: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
    guideId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    payment: { type: Schema.Types.ObjectId, ref: "Payment", required: false },
    bookingDate: { type: String, required: true },
    bookingTime: { type: String, required: true },
    numberOfGuests: { type: Number, required: true, min: 1, max: 100 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: BOOKING_STATUS,
      required: true,
      default: BOOKING_STATUS.PENDING,
    },
  },
  { timestamps: true, versionKey: false }
);

// Single field indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ tourId: 1 });
bookingSchema.index({ guideId: 1 });
bookingSchema.index({ status: 1 });

// Compound indexes for common queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ guideId: 1, status: 1 });
bookingSchema.index({ guideId: 1, status: 1, bookingDate: 1 });

export const Booking = model<IBooking>("Booking", bookingSchema);
