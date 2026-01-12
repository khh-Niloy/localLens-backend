import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import { tourRoutes } from "./modules/tour/tour.route";
import { userRoutes } from "./modules/users/user.route";
import { wishlistRoutes } from "./modules/wishlist/wishlist.route";
import { bookingRoutes } from "./modules/booking/booking.routes";
import { reviewRoutes } from "./modules/review/review.routes";
import { paymentRoutes } from "./modules/payment/payment.routes";
import { messageRoutes } from "./modules/web-socket/message.route";

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
  {
    path: "/wishlist",
    route: wishlistRoutes,
  },
  {
    path: "/booking",
    route: bookingRoutes,
  },
  {
    path: "/review",
    route: reviewRoutes,
  },
  {
    path: "/payment",
    route: paymentRoutes,
  },
  {
    path: "/conversation",
    route: messageRoutes,
  },
];

allRoutes.forEach(({ path, route }) => routes.use(path, route));
