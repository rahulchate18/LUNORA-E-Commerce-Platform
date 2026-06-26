import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetEnvPath = path.join(__dirname, ".env");

console.log("=== LUNORA PRODUCTION CONFIGURATION DRY-RUN VALIDATOR ===");
console.log("Checking environment file at:", targetEnvPath);

if (!fs.existsSync(targetEnvPath)) {
  console.error("Error: server/.env file does not exist. Create it first.");
  process.exit(1);
}

// Load env variables
const parsedConfig = dotenv.parse(fs.readFileSync(targetEnvPath));

// Force production mode to test production constraints
parsedConfig.NODE_ENV = "production";

console.log("\nSimulating boot checks in PRODUCTION mode...");

// Dynamically import the Zod validators schema
import { env } from "./dist/config/db.js";
// Wait, to bypass active process.exit in db.ts, we validate separately using standard rules:
import * as z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGO_URI: z.string().refine((val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://")),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  EMAIL_PROVIDER: z.enum(["gmail", "smtp", "mailtrap", "resend", "mock"]).default("mock"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

const productionEnvSchema = envSchema.superRefine((data, ctx) => {
  if (!data.RAZORPAY_KEY_ID || data.RAZORPAY_KEY_ID.startsWith("rzp_test_mock")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["RAZORPAY_KEY_ID"], message: "RAZORPAY_KEY_ID must be a live production key." });
  }
  if (!data.RAZORPAY_KEY_SECRET || data.RAZORPAY_KEY_SECRET === "mockSecretKey456") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["RAZORPAY_KEY_SECRET"], message: "RAZORPAY_KEY_SECRET must be a live secret key." });
  }
  if (!data.CLOUDINARY_CLOUD_NAME || data.CLOUDINARY_CLOUD_NAME === "mock_cloud_name") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["CLOUDINARY_CLOUD_NAME"], message: "CLOUDINARY_CLOUD_NAME must be configured." });
  }
  if (!data.CLOUDINARY_API_KEY || data.CLOUDINARY_API_KEY === "mock_api_key") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["CLOUDINARY_API_KEY"], message: "CLOUDINARY_API_KEY must be configured." });
  }
  if (!data.CLOUDINARY_API_SECRET || data.CLOUDINARY_API_SECRET === "mock_api_secret") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["CLOUDINARY_API_SECRET"], message: "CLOUDINARY_API_SECRET must be configured." });
  }
  if (data.EMAIL_PROVIDER === "mock") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["EMAIL_PROVIDER"], message: "EMAIL_PROVIDER cannot be 'mock' in production." });
  }
  if (["smtp", "mailtrap", "resend"].includes(data.EMAIL_PROVIDER)) {
    if (!data.SMTP_HOST) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SMTP_HOST"], message: "SMTP_HOST is required." });
    if (!data.SMTP_USER) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SMTP_USER"], message: "SMTP_USER is required." });
    if (!data.SMTP_PASS) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SMTP_PASS"], message: "SMTP_PASS is required." });
  }
});

const result = productionEnvSchema.safeParse(parsedConfig);

if (result.success) {
  console.log("\n✅ SUCCESS: Configuration variables are valid for production deployment!");
} else {
  console.error("\n❌ FAILED: Production variables failed schema checks:");
  const formatted = result.error.format();
  for (const [key, value] of Object.entries(formatted)) {
    if (key !== "_errors" && value && value._errors) {
      console.error(`  - ${key}: ${value._errors.join(", ")}`);
    }
  }
  console.log("\nModify your keys to match live credentials before deploying to Render/Vercel.");
}
