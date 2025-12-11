import { createSlug } from "../../utils/createSlug";
import { ITourListing } from "./tour.interface";
import { Tour } from "./tour.model";

const createTourService = async (tourData: ITourListing) => {
  const slug = createSlug(tourData.title);
  const tour = await Tour.create({ ...tourData, slug });
  return tour;
};

const getAllToursService = async () => {
  const tours = await Tour.find();
  return tours;
};

const getTourBySlugService = async (slug: string) => {
  const tour = await Tour.findOne({ slug });
  return tour;
};

const myTourListService = async (userId: string) => {
  const tours = await Tour.find({ guideId: userId });
  return tours;
};

export const tourServices = {
  createTourService,
  getAllToursService,
  getTourBySlugService,
  myTourListService
};
