import { Request, Response } from "express";
import { envVars } from "../../config/env";
import { paymentServices } from "./payment.service";

const successPayment = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const updatePaymentStatus = await paymentServices.successPaymentService(
      query as Record<string, string>
    );
    if (updatePaymentStatus.success) {
      res.redirect(
        `${envVars.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=success`
      );
    }
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
    });
  }
};

const failPayment = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const updatePaymentStatus = await paymentServices.failPaymentService(
      query as Record<string, string>
    );
    if (!updatePaymentStatus.success) {
      res.redirect(
        `${envVars.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=fail`
      );
    }
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
    });
  }
};

const cancelPayment = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const updatePaymentStatus = await paymentServices.cancelPaymentService(
      query as Record<string, string>
    );
    if (!updatePaymentStatus.success) {
      res.redirect(
        `${envVars.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=cancel`
      );
    }
  } catch (error) {
    res.status(400).json({
      message: (error as Error).message,
    });
  }
};

export const paymentController = {
  successPayment,
  failPayment,
  cancelPayment,
};
