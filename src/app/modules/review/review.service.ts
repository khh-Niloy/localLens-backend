import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { Booking } from "../booking/booking.model";
import { BOOKING_STATUS } from "../booking/booking.interface";

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
  return await Review.findById(review._id)
    .populate("userId", "name image")
    .populate("tourId", "title")
    .populate("guideId", "name image");
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
    .populate("tourId", "title")
    .populate("guideId", "name image");
    
  return updatedReview;
};

const deleteReview = async (reviewId: string, userId: string) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }
  
  if (review.userId.toString() !== userId) {
    throw new Error("You can only delete your own reviews");
  }
  
  await Review.findByIdAndDelete(reviewId);
};

const getTourReviews = async (tourId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  
  const reviews = await Review.find({ tourId })
    .populate("userId", "name image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Review.countDocuments({ tourId });
  
  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getGuideReviews = async (guideId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  
  const reviews = await Review.find({ guideId })
    .populate("userId", "name image")
    .populate("tourId", "title")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Review.countDocuments({ guideId });
  
  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getUserReviews = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  
  const reviews = await Review.find({ userId })
    .populate("tourId", "title")
    .populate("guideId", "name image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Review.countDocuments({ userId });
  
  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const markHelpful = async (reviewId: string) => {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $inc: { helpful: 1 } },
    { new: true }
  );
  
  if (!review) {
    throw new Error("Review not found");
  }
  
  return review;
};

const getAllReviews = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  
  const reviews = await Review.find()
    .populate("userId", "name image email")
    .populate("tourId", "title")
    .populate("guideId", "name image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Review.countDocuments();
  
  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const adminDeleteReview = async (reviewId: string) => {
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }
  return review;
};

export const reviewService = {
  createReview,
  updateReview,
  deleteReview,
  getTourReviews,
  getGuideReviews,
  getUserReviews,
  markHelpful,
  getAllReviews,
  adminDeleteReview,
};

