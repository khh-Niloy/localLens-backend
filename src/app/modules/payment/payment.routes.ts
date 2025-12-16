import { Router } from "express";
import { paymentController } from "./payment.controller";

export const paymentRoutes = Router()

// SSL Commerz sends GET requests for redirects, but we also support POST
paymentRoutes.get("/success", paymentController.successPayment)
paymentRoutes.post("/success", paymentController.successPayment)
paymentRoutes.get("/fail", paymentController.failPayment)
paymentRoutes.post("/fail", paymentController.failPayment)
paymentRoutes.get("/cancel", paymentController.cancelPayment)
paymentRoutes.post("/cancel", paymentController.cancelPayment)