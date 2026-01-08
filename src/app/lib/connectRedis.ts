import Redis from "ioredis";
import { envVars } from "../config/env";

export const redis = new Redis(envVars.REDIS_URL);