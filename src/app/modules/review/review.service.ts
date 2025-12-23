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
  
  // Update tour rating after creating review
  await updateTourRating(reviewData.tourId);
  
  return await Review.findById(review._id)
    .populate("userId", "name image")
    .populate("tourId", "title slug")
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
    .populate("tourId", "title slug")
    .populate("guideId", "name image");
  
  // Update tour rating after updating review
  await updateTourRating(review.tourId);
    
  return updatedReview;
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
    .populate("tourId", "title slug")
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
    .populate("tourId", "title slug")
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





export const reviewService = {
  createReview,
  updateReview,
  getTourReviews,
  getGuideReviews,
  getUserReviews,
};

