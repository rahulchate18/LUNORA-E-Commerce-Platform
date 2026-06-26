/**
 * types/index.ts — LUNORA Shared Type Definitions
 *
 * Phase 2 expansion: Product, Cart, Wishlist, Review, Filter types.
 * All types are pure interfaces — no runtime cost.
 */

// ─── Layout / UI ─────────────────────────────────────────────────────────────

export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface BaseComponentProps extends WithClassName, WithChildren {}

export interface NavLink {
  label: string;
  href: string;
  exact?: boolean;
}

// ─── Product Domain ───────────────────────────────────────────────────────────

export type Category =
  | "tote-bags"
  | "handbags"
  | "sling-bags"
  | "laptop-bags"
  | "travel-bags"
  | "accessories";

export const CATEGORY_LABELS: Record<Category, string> = {
  "tote-bags": "Tote Bags",
  handbags: "Handbags",
  "sling-bags": "Sling Bags",
  "laptop-bags": "Laptop Bags",
  "travel-bags": "Travel Bags",
  accessories: "Accessories",
};

export const ALL_CATEGORIES: Category[] = [
  "tote-bags",
  "handbags",
  "sling-bags",
  "laptop-bags",
  "travel-bags",
  "accessories",
];

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string; // initials fallback
  rating: number; // 1–5
  title: string;
  body: string;
  date: string; // ISO date string
  verified: boolean;
}

export interface ProductImage {
  url: string;
  secure_url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  alt?: string;
  isPrimary?: boolean;
  uploadedAt?: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
  original?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: Category;
  price: number; // INR paise-free integer e.g. 1299
  originalPrice?: number; // if discounted
  discount?: number; // percentage
  images: Array<string | ProductImage>;
  colors: ProductColor[];
  rating: number; // 0.0 – 5.0
  reviewCount: number;
  stock: number;
  sku: string;
  tags: string[];
  material?: string;
  dimensions?: string;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  reviews: Review[];
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: ProductColor;
}

export interface AppliedCoupon {
  code: string;
  discount: number; // flat INR amount
  type: "flat" | "percent";
}

export interface CartState {
  items: CartItem[];
  coupon: AppliedCoupon | null;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export type WishlistItem = Product;

// ─── Shop Filters ─────────────────────────────────────────────────────────────

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

export const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  newest: "Newest First",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
};

export interface ShopFilters {
  category?: Category;
  q?: string;
  sort?: SortOption;
  priceMin?: number;
  priceMax?: number;
  page?: number;
}

export const PRODUCTS_PER_PAGE = 9;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Authentication & User Profile ──────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Address {
  id: string;
  name: string; // Recipient Name
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number; // Price at purchase (INR)
  selectedColor?: ProductColor;
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  date: string; // ISO date string
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
}

