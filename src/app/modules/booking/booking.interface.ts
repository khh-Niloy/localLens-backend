import { Types } from "mongoose";

export enum BOOKING_STATUS {
    PENDING = "PENDING",
    CANCEL = "CANCEL",
    COMPLETE = "COMPLETE",
    FAILED = "FAILED"
}

export interface IBooking {
    userId: Types.ObjectId,
    tourId: Types.ObjectId,
    payment?: Types.ObjectId,
    status: BOOKING_STATUS,
    createdAt?: Date
}