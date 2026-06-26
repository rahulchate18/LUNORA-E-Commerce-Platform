import mongoose from "mongoose";
import * as z from "zod";
import dotenv from "dotenv";
import { logger } from "./logger.js";
// Load dotenv
dotenv.config();
// 1. Environment Variable Validation Schema
const envSchema = z.object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    MONGO_URI: z.string({
        required_error: "MONGO_URI is required. Please set it in your .env file.",
    }).refine((val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"), {
        message: "MONGO_URI must be a valid MongoDB connection string starting with mongodb:// or mongodb+srv://",
    }),
    JWT_SECRET: z.string({
        required_error: "JWT_SECRET is required for session security encryption.",
    }).min(16, "JWT_SECRET must be at least 16 characters for cryptographic strength."),
    JWT_EXPIRES_IN: z.string().default("7d"),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    // Payments
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    // Storage
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    // Emails
    EMAIL_PROVIDER: z.enum(["gmail", "smtp", "mailtrap", "resend", "mock"]).default("mock"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM: z.string().default('"LUNORA" <support@lunora.com>'),
    ADMIN_NOTIFICATION_EMAIL: z.string().default("admin@lunora.com"),
});
// Post-parse refinement to enforce strict rules in production
const productionEnvSchema = envSchema.superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
        if (!data.RAZORPAY_KEY_ID || data.RAZORPAY_KEY_ID.startsWith("rzp_test_mock")) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["RAZORPAY_KEY_ID"],
                message: "RAZORPAY_KEY_ID must be a production key in production mode.",
            });
        }
        if (!data.RAZORPAY_KEY_SECRET || data.RAZORPAY_KEY_SECRET === "mockSecretKey456") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["RAZORPAY_KEY_SECRET"],
                message: "RAZORPAY_KEY_SECRET must be a production key secret in production mode.",
            });
        }
        if (!data.CLOUDINARY_CLOUD_NAME || data.CLOUDINARY_CLOUD_NAME === "mock_cloud_name") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["CLOUDINARY_CLOUD_NAME"],
                message: "CLOUDINARY_CLOUD_NAME must be configured in production mode.",
            });
        }
        if (!data.CLOUDINARY_API_KEY || data.CLOUDINARY_API_KEY === "mock_api_key") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["CLOUDINARY_API_KEY"],
                message: "CLOUDINARY_API_KEY must be configured in production mode.",
            });
        }
        if (!data.CLOUDINARY_API_SECRET || data.CLOUDINARY_API_SECRET === "mock_api_secret") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["CLOUDINARY_API_SECRET"],
                message: "CLOUDINARY_API_SECRET must be configured in production mode.",
            });
        }
        if (data.EMAIL_PROVIDER === "mock") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["EMAIL_PROVIDER"],
                message: "EMAIL_PROVIDER cannot be 'mock' in production mode.",
            });
        }
        if (["smtp", "mailtrap", "resend"].includes(data.EMAIL_PROVIDER)) {
            if (!data.SMTP_HOST) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SMTP_HOST"], message: "SMTP_HOST is required for external mail dispatch." });
            }
            if (!data.SMTP_USER) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SMTP_USER"], message: "SMTP_USER is required for external mail dispatch." });
            }
            if (!data.SMTP_PASS) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SMTP_PASS"], message: "SMTP_PASS is required for external mail dispatch." });
            }
        }
    }
});
// Validate environment configurations
let validatedEnv;
try {
    // Run parsing first, then refinements
    envSchema.parse(process.env);
    validatedEnv = envSchema.parse(process.env);
    productionEnvSchema.parse(process.env);
    logger.info("Environment variable configurations successfully validated.");
}
catch (error) {
    if (error instanceof z.ZodError) {
        logger.error("Environment Validation Failures:", error.format());
    }
    else {
        logger.error("Unexpected error parsing configurations:", error);
    }
    process.exit(1);
}
export const env = validatedEnv;
// 2. Mongoose MongoDB Connection
export const connectDB = async () => {
    try {
        // Establish connection pool
        mongoose.connection.on("connected", () => {
            logger.info("Database Connection: Established successfully to MongoDB.");
        });
        mongoose.connection.on("error", (err) => {
            logger.error(`Database Connection Error: ${err.message}`, err);
        });
        mongoose.connection.on("disconnected", () => {
            logger.warn("Database Connection: Lost/Disconnected.");
        });
        await mongoose.connect(env.MONGO_URI);
    }
    catch (error) {
        logger.error(`Failed to initiate MongoDB connection: ${error.message}`);
    }
};
//# sourceMappingURL=db.js.map