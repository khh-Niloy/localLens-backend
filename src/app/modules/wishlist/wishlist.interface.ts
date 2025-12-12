import { Types } from "mongoose";

export interface IWishlist {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  tourId: Types.ObjectId;
  addedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWishlistPopulated extends Omit<IWishlist, 'tourId'> {
  tourId: {
    _id: Types.ObjectId;
    title: string;
    description: string;
    tourFee: number;
    originalPrice?: number;
    location: string;
    images: string[];
    maxDuration: number;
    maxGroupSize: number;
    rating?: number;
    reviewCount?: number;
    category: string;
    status: string;
    slug: string;
    guideId: {
      _id: Types.ObjectId;
      name: string;
      image?: string;
    };
  };
}
