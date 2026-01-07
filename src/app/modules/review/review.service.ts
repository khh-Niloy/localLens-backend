import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { Booking } from "../booking/booking.model";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Tour } from "../tour/tour.model";

// Helper function to update tour ratings
const updateTourRating = async (tourId: any) => {
  const reviews = await Review.find({ tourId });
  if (reviews.length === 0) {
    await Tour.findByIdAndUpdate(tourId, {
      rating: 0,
      reviewCount: 0,
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  const reviewCount = reviews.length;

  await Tour.findByIdAndUpdate(tourId, {
    rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    reviewCount,
  });
};

const createReview = async (reviewData: IReview) => {
  // Check if booking exists and is completed
  const booking = await Booking.findById(reviewData.bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }
  
  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    throw new Error("Can only review completed bookings");
  }
  
  if (booking.userId.toString() !== reviewData.userId.toString()) {
    throw new Error("You can only review your own bookings");
  }
  
  // Check if review already exists for this booking
  const existingReview = await Review.findOne({ bookingId: reviewData.bookingId });
  if (existingReview) {
    throw new Error("Review already exists for this booking");
  }
  
  const review = await Review.create(reviewData);
  
  return review
};

const updateReview = async (reviewId: string, userId: string, updateData: Partial<IReview>) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }
  
  if (review.userId.toString() !== userId) {
    throw new Error("You can only update your own reviews");
  }
  
  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    updateData,
    { new: true }
  )
    .populate("userId", "name image")
    .populate("tourId", "title slug")
    .populate("guideId", "name image");
  
  // Update tour rating after updating review
  await updateTourRating(review.tourId);
    
  return updatedReview;
};

const getTourReviews = async ({
  tourId,
  page,
  limit,
  cursor,
}: {
  tourId: string;
  page: number;
  limit: number;
  cursor?: string;
}) => {
  const filter: any = { tourId };

  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const reviews = await Review.find(filter)
    .populate("userId", "name image")
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasNextPage = reviews.length > limit;
  if (hasNextPage) reviews.pop();

  const nextCursor = hasNextPage ? reviews[reviews.length - 1].createdAt : null;
  const total = await Review.countDocuments({ tourId });

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage,
      nextCursor,
    },
  };
};

const getGuideReviews = async ({
  guideId,
  page,
  limit,
  cursor,
}: {
  guideId: string;
  page: number;
  limit: number;
  cursor?: string;
}) => {
  const filter: any = { guideId };

  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const reviews = await Review.find(filter)
    .populate("userId", "name image")
    .populate("tourId", "title slug")
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasNextPage = reviews.length > limit;
  if (hasNextPage) reviews.pop();

  const nextCursor = hasNextPage ? reviews[reviews.length - 1].createdAt : null;
  const total = await Review.countDocuments({ guideId });

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage,
      nextCursor,
    },
  };
};

const getUserReviews = async ({
  userId,
  page,
  limit,
  cursor,
}: {
  userId: string;
  page: number;
  limit: number;
  cursor?: string;
}) => {
  const filter: any = { userId };

  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const reviews = await Review.find(filter)
    .populate("tourId", "title slug")
    .populate("guideId", "name image")
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasNextPage = reviews.length > limit;
  if (hasNextPage) reviews.pop();

  const nextCursor = hasNextPage ? reviews[reviews.length - 1].createdAt : null;
  const total = await Review.countDocuments({ userId });

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage,
      nextCursor,
    },
  };
};

const getLatestReviews = async (limit: number = 6) => {
  const reviews = await Review.find({})
    .populate("userId", "name image")
    .populate("tourId", "title location")
    .sort({ createdAt: -1 })
    .limit(limit);
  return reviews;
};

export const reviewService = {
  createReview,
  updateReview,
  getTourReviews,
  getGuideReviews,
  getUserReviews,
  getLatestReviews,
};

