import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { logger } from "./logger.js";
dotenv.config();
// Determine configuration method
if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
    logger.info("Cloudinary Service: Configured successfully using CLOUDINARY_URL environment variable.");
}
else if (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    logger.info("Cloudinary Service: Configured successfully using individual environment credentials.");
}
else {
    logger.warn("Cloudinary config missing (CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/KEY/SECRET). File uploads will operate in sandbox fallback simulation.");
}
export { cloudinary };
//# sourceMappingURL=cloudinary.js.map