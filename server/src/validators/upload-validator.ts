import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;

const imageItemSchema = z.object({
  url: z.string().url("Valid image URL is required."),
  secure_url: z.string().url("Valid secure image URL is required.").optional(),
  publicId: z.string().min(1, "Cloudinary public ID is required."),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.string().optional().default("jpg"),
  bytes: z.number().optional().default(0),
  alt: z.string().optional().default(""),
  isPrimary: z.boolean().optional().default(false),
  uploadedAt: z.union([z.string(), z.date()]).optional(),
});

export const reorderImagesSchema = {
  body: z.object({
    images: z.array(imageItemSchema).min(1, "At least one image is required in reorder payload."),
  }),
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid product ID."),
  }),
};

export const setPrimaryImageSchema = {
  body: z.object({
    publicId: z.string().min(1, "publicId of the target primary image is required."),
  }),
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid product ID."),
  }),
};

export const deleteImageParamSchema = {
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid product ID."),
    publicId: z.string().min(1, "Cloudinary publicId is required."),
  }),
};

export const uploadParamSchema = {
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid product ID."),
  }),
};
