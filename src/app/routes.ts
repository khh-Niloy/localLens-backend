import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import { tourRoutes } from "./modules/tour/tour.route";
import { userRoutes } from "./modules/users/user.route";

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
  {
    path: "/user",
    route: userRoutes,
  },
];

allRoutes.forEach(({ path, route }) => routes.use(path, route));
