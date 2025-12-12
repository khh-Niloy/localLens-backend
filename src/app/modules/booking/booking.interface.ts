import { Types } from "mongoose";

export enum BOOKING_STATUS {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}

export interface IBooking {
    userId: Types.ObjectId;
    tourId: Types.ObjectId;
    guideId: Types.ObjectId;
    payment?: Types.ObjectId;
    bookingDate: string;
    bookingTime: string;
    numberOfGuests: number;
    totalAmount: number;
    specialRequests?: string;
    status: BOOKING_STATUS;
    createdAt?: Date;
    updatedAt?: Date;
}