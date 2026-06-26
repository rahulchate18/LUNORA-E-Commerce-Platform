import { cloudinary } from "../config/cloudinary.js";
import { AppError } from "../utils/app-error.js";
import { logger } from "../config/logger.js";

// Check if operating in sandbox mock mode
const isMockMode =
  !process.env.CLOUDINARY_URL &&
  (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET);

export class UploadService {
  /**
   * Uploads a file buffer directly to Cloudinary using streaming.
   * If in mock mode, simulates the upload.
   */
  static async uploadBuffer(
    fileBuffer: Buffer,
    folder: string
  ): Promise<{ url: string; secure_url: string; publicId: string; width: number; height: number; format: string; bytes: number }> {
    if (isMockMode) {
      const mockId = `mock_cl_img_${Math.floor(100000 + Math.random() * 900000)}`;
      logger.info(`Upload Service (Mock Mode): Uploaded buffer to mock folder "${folder}" with ID: ${mockId}`);

      return {
        url: `https://res.cloudinary.com/demo/image/upload/v1700000000/${mockId}.jpg`,
        secure_url: `https://res.cloudinary.com/demo/image/upload/v1700000000/${mockId}.jpg`,
        publicId: mockId,
        width: 800,
        height: 1000,
        format: "jpg",
        bytes: 145000,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `lunora/${folder}`,
          quality: "auto",
          fetch_format: "auto",
          transformation: [
            { width: 800, height: 1000, crop: "pad", background: "rgb:fafaf9" }
          ],
        },
        (error, result) => {
          if (error) {
            logger.error("Cloudinary Upload Stream Error:", error);
            return reject(new AppError("Cloudinary asset upload failure.", 500));
          }
          if (!result) {
            return reject(new AppError("Received empty payload response from Cloudinary.", 500));
          }
          resolve({
            url: result.secure_url,
            secure_url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format || "jpg",
            bytes: result.bytes || 0,
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Evicts an asset from Cloudinary CDN storage.
   */
  static async deleteAsset(publicId: string): Promise<void> {
    if (isMockMode || publicId.startsWith("mock_") || publicId.startsWith("legacy_")) {
      logger.info(`Upload Service (Mock Mode): Deleted asset with public ID: ${publicId}`);
      return;
    }

    try {
      const response = await cloudinary.uploader.destroy(publicId);
      if (response.result !== "ok" && response.result !== "not found") {
        logger.warn(`Cloudinary deletion warning for "${publicId}": response result = "${response.result}"`);
      }
    } catch (err: any) {
      logger.error(`Failed to delete asset "${publicId}" from Cloudinary:`, err);
      throw new AppError("Failed to delete image from payment storage provider.", 500);
    }
  }
}
