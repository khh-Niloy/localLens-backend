import { Types } from "mongoose";

export enum TOUR_STATUS {
  ACTIVE = "ACTIVE",
  DEACTIVATE = "DEACTIVATE"
}

export enum TOUR_CATEGORY {
  FOOD = "FOOD",
  HISTORICAL = "HISTORICAL",
  ART = "ART",
  NATURE = "NATURE",
  ADVENTURE = "ADVENTURE",
  CULTURAL = "CULTURAL"
}

export interface IItineraryItem {
  time: string;
  title: string;
  description: string;
  location?: string;
}

export interface IAvailableDate {
  date: string;
  times: string[];
}

export interface ITourListing {
  _id?: Types.ObjectId;
  slug?: string;
  guideId: Types.ObjectId;
  title: string;
  description: string;
  longDescription?: string;
  itinerary: IItineraryItem[];
  tourFee: number;
  originalPrice?: number;
  maxDuration: number;
  meetingPoint: string;
  maxGroupSize: number;
  category: TOUR_CATEGORY;
  location: string;
  images: string[];
  highlights: string[];
  included: string[];
  notIncluded: string[];
  importantInfo: string[];
  cancellationPolicy?: string;
  availableDates: IAvailableDate[];
  status: TOUR_STATUS;
  rating?: number;
  reviewCount?: number;
  bookingCount?: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITourSearchQuery {
  category?: TOUR_CATEGORY;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  maxDuration?: number;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'rating' | 'duration' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
