import { createSlug } from "../../utils/createSlug";
import { Booking } from "../booking/booking.model";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { ITourListing, ITourSearchQuery, TOUR_STATUS } from "./tour.interface";
import { Tour } from "./tour.model";
import { Types } from "mongoose";

const createTourService = async (tourData: Partial<ITourListing>) => {
  const slug = createSlug(tourData.title!);
  
  const existingTour = await Tour.findOne({ slug });
  if (existingTour) {
    throw new Error("A tour with this title already exists");
  }

  const tour = await Tour.create({ 
    ...tourData, 
    slug,
    status: tourData.status || TOUR_STATUS.ACTIVE
  });

  return tour;
};

const getAllToursService = async () => {
  const tours = await Tour.find({ 
    status: TOUR_STATUS.ACTIVE,
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
  const tour = await Tour.findOne({ 
    slug, 
    status: TOUR_STATUS.ACTIVE,
    active: true 
  })
    .populate('guideId', 'name email image bio language rating reviewCount');
  
  if (!tour) {
    throw new Error("Tour not found");
  }
  
  return tour;
};

const getGuideMyToursService = async (userId: string) => {
  const tours = await Tour.find({ guideId: new Types.ObjectId(userId) }).sort({
    createdAt: -1,
  });
  return tours;
};

const getTouristMyToursService = async (userId: string) => {
  const bookings = await Booking.find({
    userId: new Types.ObjectId(userId),
    status: BOOKING_STATUS.COMPLETED,
  })
    .populate({
      path: "tourId",
      select: "title images location tourFee slug",
    })
    .populate("guideId", "name email image")
    .sort({ createdAt: -1 });

    console.log(bookings);
  return bookings;
};

const updateTourService = async (tourId: string, updateData: Partial<ITourListing>, userId: string) => {
  if (!Types.ObjectId.isValid(tourId)) {
    throw new Error("Invalid tour ID");
  }

  const tour = await Tour.findById(tourId);
  if (!tour) {
    throw new Error("Tour not found");
  }

  if (tour.guideId.toString() !== userId.toString()) {
    throw new Error("You can only update your own tours");
  }

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

  if (tour.guideId.toString() !== userId.toString()) {
    throw new Error("You can only delete your own tours");
  }

  await Tour.findByIdAndUpdate(tourId, { active: false });
  
  return { message: "Tour deleted successfully" };
};

const getAllToursForAdminService = async () => {
  const tours = await Tour.find()
    .populate('guideId', 'name email image')
    .sort({ createdAt: -1 });
  return tours;
};

export const tourServices = {
  createTourService,
  getAllToursService,
  searchToursService,
  getTourBySlugService,
  updateTourService,
  deleteTourService,
  getGuideMyToursService,
  getTouristMyToursService,
  getAllToursForAdminService,
};
