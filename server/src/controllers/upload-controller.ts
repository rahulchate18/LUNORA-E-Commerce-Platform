import type { Request, Response } from "express";
import { Product } from "../models/product.js";
import { UploadService } from "../services/upload-service.js";
import { AppError } from "../utils/app-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { catchAsync } from "../utils/catch-async.js";

/**
 * Upload multiple files to Cloudinary and append to product images
 */
export const uploadProductImages = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError("Please select at least one image file to upload.", 400);
  }

  // 1. Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  // Check gallery constraints
  const currentCount = product.images.length;
  if (currentCount + files.length > 10) {
    throw new AppError(`A product cannot have more than 10 gallery images. Current: ${currentCount}, Uploading: ${files.length}.`, 400);
  }

  // 2. Upload buffers to Cloudinary in parallel
  const uploadPromises = files.map((file) =>
    UploadService.uploadBuffer(file.buffer, "products")
  );
  const uploadResults = await Promise.all(uploadPromises);

  // 3. Format the image subdocuments
  const newImages = uploadResults.map((result, index) => {
    // If the product currently has no images, make the first uploaded image primary
    const isPrimary = currentCount === 0 && index === 0;
    return {
      url: result.url,
      secure_url: result.secure_url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      alt: `${product.name} view`,
      isPrimary,
      uploadedAt: new Date(),
    };
  });

  // Append new images to the product's gallery
  product.images.push(...newImages);

  // Ensure at least one image is primary if there wasn't one
  const hasPrimary = product.images.some((img) => img.isPrimary);
  if (!hasPrimary && product.images.length > 0) {
    product.images[0].isPrimary = true;
  }

  await product.save();

  new ApiResponse(res, 200, { product }, "Images successfully uploaded and registered.");
});

/**
 * Delete a product image from Cloudinary and product schema
 */
export const deleteProductImage = catchAsync(async (req: Request, res: Response) => {
  const { id: productId, publicId } = req.params;

  // 1. Find product
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  // 2. Locate the targeted image
  const imageIndex = product.images.findIndex((img) => img.publicId === publicId);
  if (imageIndex === -1) {
    throw new AppError("Image not found on this product gallery.", 404);
  }

  const wasPrimary = product.images[imageIndex].isPrimary;

  // 3. Delete from Cloudinary
  await UploadService.deleteAsset(publicId as string);

  // 4. Pull from schema images array
  product.images.splice(imageIndex, 1);

  // 5. If we deleted the primary image, reassign primary status to the first remaining image
  if (wasPrimary && product.images.length > 0) {
    product.images[0].isPrimary = true;
  }

  await product.save();

  new ApiResponse(res, 200, { product }, "Product image successfully deleted.");
});

/**
 * Reorder product images list
 */
export const reorderProductImages = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const { images } = req.body; // Array of image objects validated by Zod

  // 1. Find product
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  // 2. Validate all submitted images match current images size & identifiers
  const submittedIds = new Set<string>(images.map((img: any) => img.publicId as string));
  const currentIds = new Set<string>(product.images.map((img) => img.publicId));

  if (submittedIds.size !== currentIds.size || [...submittedIds].some((id: string) => !currentIds.has(id))) {
    throw new AppError("Submitted image reorder collection does not match active product gallery.", 400);
  }

  // 3. Assign reordered list
  product.images = images;
  await product.save();

  new ApiResponse(res, 200, { product }, "Product images successfully reordered.");
});

/**
 * Change primary image selection
 */
export const setPrimaryProductImage = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const { publicId } = req.body;

  // 1. Find product
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  // 2. Check if targeted image exists
  const targetExists = product.images.some((img) => img.publicId === publicId);
  if (!targetExists) {
    throw new AppError("Image public ID not found in product gallery.", 404);
  }

  // 3. Reset and update primary status flags
  product.images.forEach((img) => {
    img.isPrimary = img.publicId === publicId;
  });

  await product.save();

  new ApiResponse(res, 200, { product }, "Primary product image updated successfully.");
});

/**
 * Upload multiple files to Cloudinary without product binding (generic uploader for creation step)
 */
export const uploadImagesGeneric = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError("Please select at least one image file to upload.", 400);
  }

  // Upload buffers to Cloudinary in parallel
  const uploadPromises = files.map((file) =>
    UploadService.uploadBuffer(file.buffer, "products")
  );
  const uploadResults = await Promise.all(uploadPromises);

  const images = uploadResults.map((result, index) => ({
    url: result.url,
    secure_url: result.secure_url,
    publicId: result.publicId,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    alt: "Product image view",
    isPrimary: index === 0, // default first image to primary
    uploadedAt: new Date(),
  }));

  new ApiResponse(res, 200, { images }, "Images successfully uploaded to CDN.");
});
