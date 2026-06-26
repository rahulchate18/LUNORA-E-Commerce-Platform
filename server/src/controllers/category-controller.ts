import type { Request, Response, NextFunction } from "express";
import slugify from "slugify";
import { Category } from "../models/category.js";
import { Product } from "../models/product.js";
import { AppError } from "../utils/app-error.js";
import { catchAsync } from "../utils/catch-async.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSlug(name: string): string {
  return slugify(name, { lower: true, strict: true, trim: true });
}

// ─── Create Category ──────────────────────────────────────────────────────────

export const createCategory = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { name, description, image } = req.body as {
      name: string;
      description?: string;
      image?: string;
    };

    const slug = makeSlug(name);

    const existing = await Category.findOne({ slug });
    if (existing) {
      throw new AppError(`Category with name "${name}" already exists.`, 409);
    }

    const category = await Category.create({ name, slug, description, image });

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: { category },
    });
  }
);

// ─── Get All Categories ───────────────────────────────────────────────────────

export const getAllCategories = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const categories = await Category.find().sort({ name: 1 }).lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: { categories },
    });
  }
);

// ─── Get Category By Slug ─────────────────────────────────────────────────────

export const getCategoryBySlug = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { slug } = req.params;

    const category = await Category.findOne({ slug }).lean();
    if (!category) {
      throw new AppError(`No category found with slug "${slug}".`, 404);
    }

    res.status(200).json({
      success: true,
      data: { category },
    });
  }
);

// ─── Update Category ──────────────────────────────────────────────────────────

export const updateCategory = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { name, description, image } = req.body as {
      name?: string;
      description?: string;
      image?: string;
    };

    const updateData: Record<string, unknown> = {};
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;

    if (name) {
      const slug = makeSlug(name);
      const conflict = await Category.findOne({ slug, _id: { $ne: id } });
      if (conflict) {
        throw new AppError(`A category named "${name}" already exists.`, 409);
      }
      updateData.name = name;
      updateData.slug = slug;
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: { category },
    });
  }
);

// ─── Delete Category ──────────────────────────────────────────────────────────

export const deleteCategory = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    // Safety: prevent deleting category that has associated products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete category. It has ${productCount} associated product(s). Remove or reassign them first.`,
        400
      );
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
      data: null,
    });
  }
);
