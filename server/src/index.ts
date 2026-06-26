import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env, connectDB } from "./config/db.js";
import { logger } from "./config/logger.js";
import { globalLimiter } from "./middlewares/rate-limiter.js";
import { errorHandler } from "./middlewares/error.js";
import { AppError } from "./utils/app-error.js";
import { csrfProtection } from "./middlewares/csrf.js";
import apiRouter from "./routes/index.js";
import { EmailService } from "./services/email-service.js";

/**
 * server/src/index.ts — Primary Express Application Bootstrapper
 */

const app = express();

// Trust reverse proxy (Vercel, Render, Railway, Cloudflare, etc.)
app.set("trust proxy", 1);

// 1. HTTP Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const clientIp = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const logMsg = `${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms) - IP: ${clientIp} - UA: ${req.headers["user-agent"]}`;
    if (res.statusCode >= 400) {
      logger.warn(logMsg);
    } else {
      logger.info(logMsg);
    }
  });
  next();
});

// 2. Global Security & Utility Middlewares
app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true, // Allow JWT token cookies
  })
);

app.use(express.json({ limit: "10kb" })); // Body parser with size limits
app.use(cookieParser()); // Cookie parser for auth tokens
app.use(csrfProtection);

// 2. Global Rate Limiting
app.use("/api", globalLimiter);

// 3. API Router mount
app.use("/api/v1", apiRouter);
app.use("/api", apiRouter); // Fallback alias

// 4. Fallback 404 handler for unmatched routes
app.all("*", (req, res, next) => {
  next(new AppError(`Requested path '${req.originalUrl}' not found on this server.`, 404));
});

// 5. Global Centralized Error Handler
app.use(errorHandler);

// 6. Connect Database & Start listening
const startServer = async () => {
  logger.info("Initializing LUNORA backend service...");
  
  // Connect to database (non-blocking)
  connectDB();
  
  // Initialize email background queue monitor
  EmailService.initBackgroundQueue();
  
  const server = app.listen(env.PORT, () => {
    logger.info(`LUNORA Server successfully started on port ${env.PORT} in ${env.NODE_ENV} mode.`);
  });

  // Handle unhandled promise rejections outside Express context
  process.on("unhandledRejection", (err: any) => {
    logger.error("SYSTEM_UNHANDLED_REJECTION: Shutting down server...", err);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (err: any) => {
    logger.error("SYSTEM_UNCAUGHT_EXCEPTION: Shutting down server...", err);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
// Reload trigger

