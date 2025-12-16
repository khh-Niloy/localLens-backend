import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes";


export const routes = Router();

const allRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
];

allRoutes.forEach(({ path, route }) => routes.use(path, route));
