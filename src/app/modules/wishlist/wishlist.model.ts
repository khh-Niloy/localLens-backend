import { model, Schema } from "mongoose";
import { IWishlist } from "./wishlist.interface";

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tourId: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

// Ensure a user can't add the same tour to wishlist multiple times
wishlistSchema.index({ userId: 1, tourId: 1 }, { unique: true });

// Index for better performance
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ tourId: 1 });

export const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);
