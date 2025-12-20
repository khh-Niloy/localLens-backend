import { model, Schema } from "mongoose";
import { IPayment, PAYMENT_STATUS } from "./payment.interface";

const paymentSchema = new Schema<IPayment>({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        unique: true,
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.UNPAID,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
        max: 10000000,
    },
    paymentGatewayData: {
        type: Schema.Types.Mixed
    },
    paidAt: {
        type: Date
    },
}, {
    timestamps: true, 
    versionKey: false
});

// Single field indexes (unique already creates indexes for bookingId and transactionId)
paymentSchema.index({ status: 1 });
paymentSchema.index({ paidAt: -1 });

// Compound indexes
paymentSchema.index({ status: 1, paidAt: -1 });

export const Payment = model<IPayment>("Payment", paymentSchema);