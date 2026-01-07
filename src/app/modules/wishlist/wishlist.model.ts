import { model, Schema } from "mongoose";
import { IWishlist } from "./wishlist.interface";

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tourId: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
  },
  { timestamps: true, versionKey: false }
);

// Unique constraint - user can't add same tour twice
wishlistSchema.index({ userId: 1, tourId: 1 }, { unique: true });

// Single field indexes
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ tourId: 1 });

// Compound index for user's wishlist sorted by date
wishlistSchema.index({ userId: 1, createdAt: -1 });

export const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);
