import type { Request, Response, NextFunction } from "express";
import slugify from "slugify";
import { Product } from "../models/product.js";
import { Category } from "../models/category.js";
import { AppError } from "../utils/app-error.js";
import { catchAsync } from "../utils/catch-async.js";
import { buildProductQuery } from "../utils/query-builder.js";
import type { ProductQueryParams } from "../utils/query-builder.js";
import { UploadService } from "../services/upload-service.js";

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeSlug(name: string): string {
  return slugify(name, { lower: true, strict: true, trim: true });
}

function formatProduct(product: any) {
  if (!product) return product;
  const formatted = { ...product };
  // If product is mongoose document, convert to object first
  const doc = typeof formatted.toObject === "function" ? formatted.toObject() : formatted;
  doc.isNew = doc.isNewArrival;
  delete doc.isNewArrival;
  if (doc._id && !doc.id) {
    doc.id = doc._id.toString();
  }
  return doc;
}

// ─── Create Product ───────────────────────────────────────────────────────────

export const createProduct = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const body = req.body as {
      name: string;
      description: string;
      shortDescription: string;
      category: string;
      price: number;
      originalPrice?: number;
      stock: number;
      sku?: string;
      images: string[];
      colors?: Array<{ name: string; hex: string }>;
      tags?: string[];
      isFeatured?: boolean;
      isNewArrival?: boolean;
      isBestseller?: boolean;
    };

    // Validate category exists
    const category = await Category.findById(body.category);
    if (!category) {
      throw new AppError("Category not found. Provide a valid category ID.", 404);
    }

    // Check duplicate product name
    const slug = makeSlug(body.name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      throw new AppError(`A product named "${body.name}" already exists.`, 409);
    }

    const product = await Product.create({
      ...body,
      slug,
    });

    // Populate category for response
    await product.populate("category", "name slug");

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: { product },
    });
  }
);

// ─── Get All Products (with filtering, search, sort, pagination) ──────────────

export const getAllProducts = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const rawQuery = req.query as Record<string, string>;

    // Resolve category slug → ObjectId if provided
    let categoryId: string | undefined;
    if (rawQuery.category) {
      const cat = await Category.findOne({ slug: rawQuery.category }).lean();
      if (!cat) {
        // Unknown category slug → return empty result set immediately
        return res.status(200).json({
          success: true,
          data: { products: [] },
          pagination: { total: 0, page: 1, limit: 12, pages: 0 },
        });
      }
      categoryId = String(cat._id);
    }

    const params: ProductQueryParams = {
      search: rawQuery.search,
      category: categoryId,
      minPrice: rawQuery.minPrice ? Number(rawQuery.minPrice) : undefined,
      maxPrice: rawQuery.maxPrice ? Number(rawQuery.maxPrice) : undefined,
      sort: rawQuery.sort as ProductQueryParams["sort"],
      page: rawQuery.page ? Number(rawQuery.page) : 1,
      limit: rawQuery.limit ? Number(rawQuery.limit) : 12,
      featured: rawQuery.featured as ProductQueryParams["featured"],
      isNew: rawQuery.isNew as ProductQueryParams["isNew"],
      bestseller: rawQuery.bestseller as ProductQueryParams["bestseller"],
    };

    const { filter, sort, skip, limit, page } = buildProductQuery(params);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);
    const formattedProducts = products.map(formatProduct);

    res.status(200).json({
      success: true,
      data: { products: formattedProducts },
      pagination: { total, page, limit, pages },
    });
  }
);

// ─── Get Product By Slug ──────────────────────────────────────────────────────

export const getProductBySlug = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { slug } = req.params;

    const product = await Product.findOne({ slug })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      throw new AppError(`No product found with slug "${slug}".`, 404);
    }

    res.status(200).json({
      success: true,
      data: { product: formatProduct(product) },
    });
  }
);

// ─── Get Product By ID ────────────────────────────────────────────────────────

export const getProductById = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("category", "name slug")
      .lean();

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    res.status(200).json({
      success: true,
      data: { product: formatProduct(product) },
    });
  }
);

// ─── Update Product ───────────────────────────────────────────────────────────

export const updateProduct = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;

    // If name changes, regenerate slug and check uniqueness
    if (body.name && typeof body.name === "string") {
      const newSlug = makeSlug(body.name);
      const conflict = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
      if (conflict) {
        throw new AppError(`A product named "${body.name}" already exists.`, 409);
      }
      body.slug = newSlug;
    }

    // If category changes, verify it exists
    if (body.category) {
      const cat = await Category.findById(body.category);
      if (!cat) {
        throw new AppError("Category not found. Provide a valid category ID.", 404);
      }
    }

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: { product },
    });
  }
);

// ─── Delete Product ───────────────────────────────────────────────────────────

export const deleteProduct = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    // Delete associated images from Cloudinary first
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map((img) => UploadService.deleteAsset(img.publicId))
      );
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      data: null,
    });
  }
);

// ─── Featured Products ────────────────────────────────────────────────────────

export const getFeaturedProducts = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const products = await Product.find({ isFeatured: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products: products.map(formatProduct) },
    });
  }
);

// ─── New Arrivals ─────────────────────────────────────────────────────────────

export const getNewArrivals = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const products = await Product.find({ isNewArrival: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products: products.map(formatProduct) },
    });
  }
);

// ─── Bestsellers ──────────────────────────────────────────────────────────────

export const getBestsellers = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const products = await Product.find({ isBestseller: true })
      .populate("category", "name slug")
      .sort({ reviewCount: -1 })
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products: products.map(formatProduct) },
    });
  }
);

// ─── Related Products (same category, exclude self) ───────────────────────────

export const getRelatedProducts = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const product = await Product.findById(id).lean();
    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: id },
    })
      .populate("category", "name slug")
      .sort({ rating: -1 })
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      count: related.length,
      data: { products: related.map(formatProduct) },
    });
  }
);
