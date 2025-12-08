/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";

export const globalErrorHandler = async(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  res.status(500).json({
    success: false,
    message: `something went wrong : ${err.message}`,
    err,
    stack: envVars.NODE_ENV == "development" ? err.stack : null,
  });
};
