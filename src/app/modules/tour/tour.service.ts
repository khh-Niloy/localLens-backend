import { createSlug } from "../../utils/createSlug";
import { ITourListing, ITourSearchQuery, TOUR_STATUS } from "./tour.interface";
import { Tour } from "./tour.model";
import { Types } from "mongoose";

const createTourService = async (tourData: Partial<ITourListing>) => {
  const slug = createSlug(tourData.title!);
  
  // Check if slug already exists
  const existingTour = await Tour.findOne({ slug });
  if (existingTour) {
    throw new Error("A tour with this title already exists");
  }

  const tour = await Tour.create({ 
    ...tourData, 
    slug,
    status: tourData.status || TOUR_STATUS.ACTIVE // Default to ACTIVE so tours show up immediately
  });
  
  return await Tour.findById(tour._id).populate('guideId', 'name email image');
};

const getAllToursService = async () => {
  const tours = await Tour.find({ 
    status: { $in: [TOUR_STATUS.ACTIVE, TOUR_STATUS.DRAFT] }, // Show both active and draft tours
    active: true 
  })
  .populate('guideId', 'name email image rating reviewCount')
  .sort({ createdAt: -1 });
  
  return tours;
};

const searchToursService = async (searchQuery: ITourSearchQuery) => {
  const {
    category,
    location,
    minPrice,
    maxPrice,
    rating,
    maxDuration,
    date,
    search,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = searchQuery;

  // Build filter object
  const filter: any = {
    status: TOUR_STATUS.ACTIVE,
    active: true
  };

  if (category) filter.category = category;
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (minPrice || maxPrice) {
    filter.tourFee = {};
    if (minPrice) filter.tourFee.$gte = minPrice;
    if (maxPrice) filter.tourFee.$lte = maxPrice;
  }
  if (rating) filter.rating = { $gte: rating };
  if (maxDuration) filter.maxDuration = { $lte: maxDuration };
  if (date) {
    filter['availableDates.date'] = date;
  }
  if (search) {
    filter.$text = { $search: search };
  }

  // Build sort object
  const sortObj: any = {};
  if (sortBy === 'price') sortObj.tourFee = sortOrder === 'asc' ? 1 : -1;
  else if (sortBy === 'rating') sortObj.rating = sortOrder === 'asc' ? 1 : -1;
  else if (sortBy === 'duration') sortObj.maxDuration = sortOrder === 'asc' ? 1 : -1;
  else sortObj.createdAt = sortOrder === 'asc' ? 1 : -1;

  const skip = (page - 1) * limit;

  const [tours, total] = await Promise.all([
    Tour.find(filter)
      .populate('guideId', 'name email image rating reviewCount')
      .sort(sortObj)
      .skip(skip)
      .limit(limit),
    Tour.countDocuments(filter)
  ]);

  return {
    tours,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    }
  };
};

const getTourBySlugService = async (slug: string) => {
  const tour = await Tour.findOne({ slug, active: true })
    .populate('guideId', 'name email image bio language rating reviewCount');
  
  if (!tour) {
    throw new Error("Tour not found");
  }
  
  return tour;
};

const getTourByIdService = async (tourId: string) => {
  if (!Types.ObjectId.isValid(tourId)) {
    throw new Error("Invalid tour ID");
  }

  const tour = await Tour.findById(tourId)
    .populate('guideId', 'name email image bio language rating reviewCount');
  
  if (!tour) {
    throw new Error("Tour not found");
  }
  
  return tour;
};

const updateTourService = async (tourId: string, updateData: Partial<ITourListing>, userId: string) => {
  if (!Types.ObjectId.isValid(tourId)) {
    throw new Error("Invalid tour ID");
  }

  const tour = await Tour.findById(tourId);
  if (!tour) {
    throw new Error("Tour not found");
  }

  // Check if user is the guide who created the tour
  if (tour.guideId.toString() !== userId.toString()) {
    throw new Error("You can only update your own tours");
  }

  // If title is being updated, generate new slug
  if (updateData.title && updateData.title !== tour.title) {
    const newSlug = createSlug(updateData.title);
    const existingTour = await Tour.findOne({ slug: newSlug, _id: { $ne: tourId } });
    if (existingTour) {
      throw new Error("A tour with this title already exists");
    }
    updateData.slug = newSlug;
  }

  const updatedTour = await Tour.findByIdAndUpdate(
    tourId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('guideId', 'name email image');

  return updatedTour;
};

const deleteTourService = async (tourId: string, userId: string) => {
  if (!Types.ObjectId.isValid(tourId)) {
    throw new Error("Invalid tour ID");
  }

  const tour = await Tour.findById(tourId);
  if (!tour) {
    throw new Error("Tour not found");
  }

  // Check if user is the guide who created the tour
  if (tour.guideId.toString() !== userId.toString()) {
    throw new Error("You can only delete your own tours");
  }

  // Soft delete by setting active to false
  await Tour.findByIdAndUpdate(tourId, { active: false });
  
  return { message: "Tour deleted successfully" };
};

const getMyToursService = async (userId: string) => {
  console.log(`\n=== getMyToursService called ===`);
  console.log(`Service: Searching for tours with guideId: ${userId}`);
  
  try {
    // First check what tours exist in the database
    const allTours = await Tour.find({}).select('guideId title status active');
    console.log(`Service: Total tours in DB: ${allTours.length}`);
    console.log(`Service: All tours:`, allTours.map(t => ({ 
      id: t._id, 
      guideId: t.guideId.toString(), 
      title: t.title,
      status: t.status,
      active: t.active
    })));
    
    // Try both string and ObjectId comparison
    const toursWithStringId = await Tour.find({ guideId: userId }).select('title guideId');
    console.log(`Service: Found ${toursWithStringId.length} tours with string comparison`);
    
    const toursWithObjectId = await Tour.find({ guideId: new Types.ObjectId(userId) }).select('title guideId');
    console.log(`Service: Found ${toursWithObjectId.length} tours with ObjectId comparison`);
    
    // Use ObjectId comparison and get full tour data
    const tours = await Tour.find({ guideId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
    
    console.log(`Service: Final result - Found ${tours.length} tours for guideId: ${userId}`);
    if (tours.length > 0) {
      console.log(`Service: Tours found:`, tours.map(t => ({ id: t._id, title: t.title })));
    }
    
    return tours;
  } catch (error) {
    console.error(`Service: Error in getMyToursService:`, error);
    throw error;
  }
};

const getAllToursForAdminService = async () => {
  const tours = await Tour.find()
    .populate('guideId', 'name email image')
    .sort({ createdAt: -1 });
  
  return tours;
};

const updateTourRatingService = async (tourId: string, newRating: number, reviewCount: number) => {
  if (!Types.ObjectId.isValid(tourId)) {
    throw new Error("Invalid tour ID");
  }

  await Tour.findByIdAndUpdate(tourId, {
    rating: newRating,
    reviewCount: reviewCount
  });
};

const incrementBookingCountService = async (tourId: string) => {
  if (!Types.ObjectId.isValid(tourId)) {
    throw new Error("Invalid tour ID");
  }

  await Tour.findByIdAndUpdate(tourId, {
    $inc: { bookingCount: 1 }
  });
};

export const tourServices = {
  createTourService,
  getAllToursService,
  searchToursService,
  getTourBySlugService,
  getTourByIdService,
  updateTourService,
  deleteTourService,
  getMyToursService,
  getAllToursForAdminService,
  updateTourRatingService,
  incrementBookingCountService
};
