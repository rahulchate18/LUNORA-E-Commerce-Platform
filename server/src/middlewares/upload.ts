import multer from "multer";
import { AppError } from "../utils/app-error.js";

// 1. Memory storage configuration (buffers streamed directly to Cloudinary)
const storage = multer.memoryStorage();

// 2. File type filter (JPG, JPEG, PNG, WEBP)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Unsupported file type. Only JPG, JPEG, PNG, and WEBP formats are allowed.", 400));
  }
};

// 3. Multer upload instance with 5MB limits and maximum files
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10,                 // Max 10 files in multiple upload
  },
});
