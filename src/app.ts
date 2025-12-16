import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { envVars } from "./app/config/env";
import { routes } from "./app/routes";

export const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: envVars.CORS_FRONTEND_URL,
    credentials: true
}))

app.use("/api/v1", routes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "welcome to localLens backend",
  });
});

app.use(globalErrorHandler);
app.use(notFound);
