import rateLimit from "express-rate-limit";
import { AppError } from "../utils/app-error.js";

/**
 * server/src/middlewares/rate-limiter.ts — Request Rate Limiting guards.
 */

// 1. Global API rate limiter (100 requests / 15 minutes)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    next(new AppError("Too many requests from this IP. Please try again after 15 minutes.", 429));
  },
});

// 2. Strict Auth paths rate limiter (15 requests / 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError("Too many authentication attempts. Please try again after 15 minutes.", 429));
  },
});
