import { z } from "zod";
// ─── Category Schemas ─────────────────────────────────────────────────────────
export const createCategorySchema = {
    body: z.object({
        name: z
            .string({ required_error: "Category name is required." })
            .min(2, "Name must be at least 2 characters.")
            .max(50, "Name cannot exceed 50 characters.")
            .trim(),
        description: z.string().max(500).optional(),
        image: z.string().url("Image must be a valid URL.").optional(),
    }),
};
export const updateCategorySchema = {
    body: z.object({
        name: z.string().min(2).max(50).trim().optional(),
        description: z.string().max(500).optional(),
        image: z.string().url("Image must be a valid URL.").optional(),
    }),
    params: z.object({
        id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ID."),
    }),
};
export const categoryParamSchema = {
    params: z.object({
        id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ID."),
    }),
};
// ─── Product Schemas ──────────────────────────────────────────────────────────
const colorSchema = z.object({
    name: z.string().min(1, "Color name is required."),
    hex: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Hex must be a valid color code."),
});
const zodProductImageSchema = z.union([
    z.string().url("Each image must be a valid URL."),
    z.object({
        url: z.string().url("Image must be a valid URL."),
        secure_url: z.string().url("Secure image URL must be a valid URL.").optional(),
        publicId: z.string().min(1, "Cloudinary public ID is required."),
        width: z.number().int().positive().optional().default(800),
        height: z.number().int().positive().optional().default(1000),
        format: z.string().optional().default("jpg"),
        bytes: z.number().optional().default(0),
        alt: z.string().optional().default(""),
        isPrimary: z.boolean().optional().default(false),
        uploadedAt: z.union([z.string(), z.date()]).optional(),
    })
]);
export const createProductSchema = {
    body: z.object({
        name: z
            .string({ required_error: "Product name is required." })
            .min(3, "Name must be at least 3 characters.")
            .max(100, "Name cannot exceed 100 characters.")
            .trim(),
        description: z
            .string({ required_error: "Description is required." })
            .min(20, "Description must be at least 20 characters."),
        shortDescription: z
            .string({ required_error: "Short description is required." })
            .max(250, "Short description cannot exceed 250 characters."),
        category: z
            .string({ required_error: "Category ID is required." })
            .regex(/^[a-f\d]{24}$/i, "Invalid category ID."),
        price: z
            .number({ required_error: "Selling price is required." })
            .positive("Price must be a positive number."),
        originalPrice: z
            .number()
            .positive("Original price must be a positive number.")
            .optional(),
        stock: z
            .number()
            .int("Stock must be a whole number.")
            .min(0, "Stock cannot be negative.")
            .default(0),
        sku: z.string().trim().optional(),
        images: z
            .array(zodProductImageSchema)
            .min(1, "At least one image is required."),
        colors: z.array(colorSchema).optional().default([]),
        tags: z.array(z.string().trim()).optional().default([]),
        isFeatured: z.boolean().optional().default(false),
        isNewArrival: z.boolean().optional().default(true),
        isBestseller: z.boolean().optional().default(false),
    }),
};
export const updateProductSchema = {
    body: z.object({
        name: z.string().min(3).max(100).trim().optional(),
        description: z.string().min(20).optional(),
        shortDescription: z.string().max(250).optional(),
        category: z
            .string()
            .regex(/^[a-f\d]{24}$/i, "Invalid category ID.")
            .optional(),
        price: z.number().positive().optional(),
        originalPrice: z.number().positive().optional(),
        stock: z.number().int().min(0).optional(),
        sku: z.string().trim().optional(),
        images: z
            .array(zodProductImageSchema)
            .min(1)
            .optional(),
        colors: z.array(colorSchema).optional(),
        tags: z.array(z.string().trim()).optional(),
        isFeatured: z.boolean().optional(),
        isNewArrival: z.boolean().optional(),
        isBestseller: z.boolean().optional(),
    }),
    params: z.object({
        id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID."),
    }),
};
export const productParamSchema = {
    params: z.object({
        id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID."),
    }),
};
// ─── Product Query Schema ─────────────────────────────────────────────────────
export const productQuerySchema = {
    query: z.object({
        search: z.string().optional(),
        category: z.string().optional(), // category slug
        minPrice: z.coerce.number().min(0).optional(),
        maxPrice: z.coerce.number().min(0).optional(),
        sort: z
            .enum(["newest", "oldest", "price_asc", "price_desc", "rating", "popular"])
            .optional()
            .default("newest"),
        page: z.coerce.number().int().min(1).optional().default(1),
        limit: z.coerce.number().int().min(1).max(100).optional().default(12),
        featured: z.enum(["true", "false"]).optional(),
        isNew: z.enum(["true", "false"]).optional(),
        bestseller: z.enum(["true", "false"]).optional(),
    }),
};
//# sourceMappingURL=product-validator.js.map