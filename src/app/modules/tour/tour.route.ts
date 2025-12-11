import { Router } from "express";
import { TourController } from "./tour.controller";

export const tourRoutes = Router();

tourRoutes.post("/", TourController.createTour);
tourRoutes.get("/", TourController.getAllTours);
tourRoutes.get("/:slug", TourController.getTourBySlug);