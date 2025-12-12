import { Types } from "mongoose";

export interface IReview {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  tourId: Types.ObjectId;
  guideId: Types.ObjectId;
  bookingId: Types.ObjectId;
  rating: number;
  comment: string;
  helpful?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

