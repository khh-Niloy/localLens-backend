import { model, Schema } from "mongoose";
import { BOOKING_STATUS, IBooking } from "./booking.interface";

const bookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tourId: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
    payment: { type: Schema.Types.ObjectId, ref: "Payment", required: false },
    status: {
      type: String,
      enum: BOOKING_STATUS,
      required: true,
      default: BOOKING_STATUS.PENDING,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Booking = model<IBooking>("Booking", bookingSchema);
