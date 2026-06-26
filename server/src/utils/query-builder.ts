import type { FilterQuery, SortOrder } from "mongoose";
import type { IProduct } from "../models/product.js";

export interface ProductQueryParams {
  search?: string;
  category?: string;       // resolved ObjectId string
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc" | "rating" | "popular";
  page?: number;
  limit?: number;
  featured?: "true" | "false";
  isNew?: "true" | "false";
  bestseller?: "true" | "false";
}

export interface QueryResult {
  filter: FilterQuery<IProduct>;
  sort: Record<string, SortOrder>;
  skip: number;
  limit: number;
  page: number;
}

/**
 * Builds a Mongoose-compatible filter, sort, and pagination object
 * from raw query parameters.
 */
export function buildProductQuery(params: ProductQueryParams): QueryResult {
  const filter: FilterQuery<IProduct> = {};
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const skip = (page - 1) * limit;

  // ── Text Search ────────────────────────────────────────────────────────────
  if (params.search && params.search.trim()) {
    const regex = new RegExp(params.search.trim(), "i");
    filter.$or = [{ name: regex }, { tags: regex }, { shortDescription: regex }];
  }

  // ── Category Filter ────────────────────────────────────────────────────────
  if (params.category) {
    filter.category = params.category;
  }

  // ── Price Range ────────────────────────────────────────────────────────────
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filter.price = {};
    if (params.minPrice !== undefined) filter.price.$gte = params.minPrice;
    if (params.maxPrice !== undefined) filter.price.$lte = params.maxPrice;
  }

  // ── Boolean Flags ──────────────────────────────────────────────────────────
  if (params.featured === "true") filter.isFeatured = true;
  if (params.isNew === "true") filter.isNewArrival = true;
  if (params.bestseller === "true") filter.isBestseller = true;

  // ── Sort ───────────────────────────────────────────────────────────────────
  const sortMap: Record<string, Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    popular: { reviewCount: -1 },
  };

  const sort = sortMap[params.sort ?? "newest"] ?? sortMap.newest;

  return { filter, sort, skip, limit, page };
}
