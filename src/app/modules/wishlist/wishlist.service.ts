import { Types } from "mongoose";
import { Wishlist } from "./wishlist.model";
import { Tour } from "../tour/tour.model";
import { IWishlist } from "./wishlist.interface";

const getUserWishlistService = async (userId: string) => {
  const wishlist = await Wishlist.find({ userId: new Types.ObjectId(userId) })
    .populate({
      path: 'tourId',
      select: 'title description tourFee originalPrice location images maxDuration maxGroupSize rating reviewCount category status slug guideId',
      populate: {
        path: 'guideId',
        select: 'name image'
      }
    })
    .sort({ createdAt: -1 });

  return wishlist;
};

const addToWishlistService = async (userId: string, tourId: string) => {
  // Check if tour exists
  const tour = await Tour.findById(tourId);
  if (!tour) {
    throw new Error("Tour not found");
  }

  // Check if already in wishlist
  const existingWishlistItem = await Wishlist.findOne({
    userId: new Types.ObjectId(userId),
    tourId: new Types.ObjectId(tourId)
  });

  if (existingWishlistItem) {
    throw new Error("Tour is already in your wishlist");
  }

  const wishlistItem = await Wishlist.create({
    userId: new Types.ObjectId(userId),
    tourId: new Types.ObjectId(tourId)
  });

  return wishlistItem;
};

const removeFromWishlistService = async (userId: string, tourId: string) => {
  const wishlistItem = await Wishlist.findOneAndDelete({
    userId: new Types.ObjectId(userId),
    tourId: new Types.ObjectId(tourId)
  });

  if (!wishlistItem) {
    throw new Error("Tour not found in your wishlist");
  }

  return wishlistItem;
};

const checkWishlistStatusService = async (userId: string, tourId: string) => {
  const wishlistItem = await Wishlist.findOne({
    userId: new Types.ObjectId(userId),
    tourId: new Types.ObjectId(tourId)
  });

  return { isInWishlist: !!wishlistItem };
};

export const wishlistServices = {
  getUserWishlistService,
  addToWishlistService,
  removeFromWishlistService,
  checkWishlistStatusService
};
