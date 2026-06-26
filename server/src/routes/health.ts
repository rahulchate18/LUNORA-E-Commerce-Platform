import { Router } from "express";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { execSync } from "child_process";
import { transporter, isMockMode as isMailMock } from "../config/mail.js";
import { razorpayConfig } from "../config/payment.js";
import { ApiResponse } from "../utils/api-response.js";

const router = Router();

// Git version cache
let gitCommit = "unknown";
try {
  gitCommit = execSync("git rev-parse HEAD").toString().trim();
} catch (err) {
  // Silent fallback
}

/**
 * GET /api/health
 * Lightweight health check for load-balancers / ping monitoring
 */
router.get("/health", (req, res) => {
  new ApiResponse(
    res,
    200,
    {
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    "LUNORA API is healthy."
  );
});

/**
 * GET /api/ready
 * Deep check verifying active connection dependencies (DB, Storage, Mail Relay)
 */
router.get("/ready", async (req, res) => {
  const readyChecks: Record<string, any> = {
    database: "failed",
    cloudinary: "failed",
    smtp: "failed",
  };

  let allReady = true;

  // 1. Verify Database
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      readyChecks.database = "ready";
    } else {
      allReady = false;
      readyChecks.database = `disconnected (state: ${mongoose.connection.readyState})`;
    }
  } catch (err: any) {
    allReady = false;
    readyChecks.database = `error: ${err.message}`;
  }

  // 2. Verify Cloudinary
  try {
    const isCloudinaryConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    if (!isCloudinaryConfigured) {
      readyChecks.cloudinary = "sandbox (simulated mode)";
    } else {
      await cloudinary.api.ping();
      readyChecks.cloudinary = "ready";
    }
  } catch (err: any) {
    allReady = false;
    readyChecks.cloudinary = `error: ${err.message}`;
  }

  // 3. Verify SMTP Relay
  try {
    if (isMailMock) {
      readyChecks.smtp = "sandbox (simulated mode)";
    } else if (transporter) {
      await transporter.verify();
      readyChecks.smtp = "ready";
    } else {
      allReady = false;
      readyChecks.smtp = "not initialized";
    }
  } catch (err: any) {
    allReady = false;
    readyChecks.smtp = `error: ${err.message}`;
  }

  const statusCode = allReady ? 200 : 503;
  new ApiResponse(
    res,
    statusCode,
    {
      status: allReady ? "ready" : "unready",
      checks: readyChecks,
      timestamp: new Date().toISOString(),
    },
    allReady ? "LUNORA is fully ready to accept client traffic." : "LUNORA backend ready checks failed."
  );
});

/**
 * GET /api/version
 * Debug endpoint returning runtime build and system statistics
 */
router.get("/version", (req, res) => {
  const memoryUsage = process.memoryUsage();
  new ApiResponse(
    res,
    200,
    {
      version: "1.0.0",
      gitCommit,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      paymentMode: razorpayConfig.isMockMode ? "sandbox (simulated)" : "production (live)",
    },
    "Version metrics retrieved successfully."
  );
});

// Deprecated root router GET alias (for backwards compatibility)
router.get("/", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = dbStates[mongoose.connection.readyState] || "unknown";

  new ApiResponse(
    res,
    200,
    {
      uptime: process.uptime(),
      status: "OK",
      database: dbState,
      timestamp: new Date().toISOString(),
    },
    "LUNORA Backend API is fully operational."
  );
});

export default router;
