import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Coupon } from "../models/coupon.js";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://rahulchate021_db_user:w7pskFVXeLdIRfiE@ac-dqow4dt-shard-00-00.gj5caax.mongodb.net:27017,ac-dqow4dt-shard-00-01.gj5caax.mongodb.net:27017,ac-dqow4dt-shard-00-02.gj5caax.mongodb.net:27017/lunora?ssl=true&authSource=admin&retryWrites=true&w=majority";

const couponsData = [
  {
    code: "WELCOME200",
    discountType: "flat" as const,
    discountValue: 200,
    minSpend: 1500,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
    isActive: true,
  },
  {
    code: "LUNORA10",
    discountType: "percent" as const,
    discountValue: 10,
    minSpend: 1000,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
    isActive: true,
  },
];

const seedCoupons = async () => {
  try {
    console.log("Connecting to MongoDB for coupon seeding...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    console.log("Clearing existing coupons...");
    await Coupon.deleteMany({});

    console.log("Seeding coupons...");
    const createdCoupons = await Coupon.insertMany(couponsData);
    console.log(`Successfully seeded ${createdCoupons.length} coupons:`);
    console.log(createdCoupons.map((c) => `${c.code} (${c.discountType}: ${c.discountValue})`));

    console.log("Coupon seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding coupons:", error);
    process.exit(1);
  }
};

seedCoupons();
