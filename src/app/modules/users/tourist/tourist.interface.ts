import { Types } from "mongoose";

export enum ActivityType {
  Adventure = "Adventure",
  BeachRelaxation = "Beach Relaxation",
  Camping = "Camping",
  FoodTours = "Food Tours",
  Hiking = "Hiking",
  HistoricalTours = "Historical Tours",
  Museums = "Museums",
  SkiingSnowboarding = "Skiing/Snowboarding",
  WildlifeWatching = "Wildlife Watching",
  EcoTourism = "Eco-tourism",
  FestivalsEvents = "Festivals/Events",
  CitySightseeing = "City Sightseeing",
  RuralExperience = "Rural Experience",
  BoatTrips = "Boat Trips",
}

export enum FoodPreference {
  Vegetarian = "Vegetarian",
  NonVegetarian = "Non-Vegetarian",
  GlutenFree = "Gluten-Free",
  DairyFree = "Dairy-Free",
  Halal = "Halal",
  StreetFood = "Street Food",
  FineDining = "Fine Dining",
  LocalCuisine = "Local Cuisine",
  Seafood = "Seafood",
  FastFood = "Fast Food",
  OrganicFood = "Organic Food",
  SpicyFood = "Spicy Food",
  SweetDesserts = "Sweet/Desserts",
  HealthyFood = "Healthy Food",
}

export interface ITravelPreferences {
  activityTypes?: ActivityType[];
  budgetLevel?: "low" | "mid" | "high";
  groupStyle?: "solo" | "couple" | "family" | "friends";
  foodPreferences?: FoodPreference[];
  languagePreferences?: string[];
}

export interface ITourist {
  userId: Types.ObjectId;
  travelPreferences: ITravelPreferences;
}
