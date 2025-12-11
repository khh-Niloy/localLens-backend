import { Types } from "mongoose";

export interface IItineraryItem {
  time: string;
  activity: string;
  location?: string;
}

export interface ITourListing {
  _id: Types.ObjectId;
  slug?: string;
  guideId: Types.ObjectId;
  title: string;
  description: string;
  itinerary: IItineraryItem[];
  tourFee: number;
  maxDuration: number;
  meetingPoint: string;
  maxGroupSize: number;
  images: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
