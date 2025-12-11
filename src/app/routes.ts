import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import { tourRoutes } from "./modules/tour/tour.route";


export const routes = Router();

const allRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/tour",
    route: tourRoutes,
  },
];

allRoutes.forEach(({ path, route }) => routes.use(path, route));
