import { Router } from "express";
import { paymentController } from "./payment.controller";

export const paymentRoutes = Router()

paymentRoutes.post("/success", paymentController.successPayment)
paymentRoutes.post("/fail", paymentController.failPayment)
paymentRoutes.post("/cancel", paymentController.cancelPayment)