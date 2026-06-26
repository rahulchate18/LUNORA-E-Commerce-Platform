import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Product Color interface
 */
export interface IProductColor {
  name: string;
  hex: string;
}

/**
 * Product Image interface
 */
export interface IProductImage {
  url: string;
  secure_url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  alt: string;
  isPrimary: boolean;
  uploadedAt?: Date;
  thumbnail?: string;
  medium?: string;
  large?: string;
  original?: string;
}

/**
 * Product document interface
 */
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: mongoose.Types.ObjectId;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  images: IProductImage[];
  colors: IProductColor[];
  tags: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 1. Color Subschema
const productColorSchema = new Schema<IProductColor>(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
  },
  { _id: false }
);

function getTransformedUrl(secureUrl: string, transformations: string): string {
  if (!secureUrl) return "";
  if (!secureUrl.includes("res.cloudinary.com")) {
    return secureUrl;
  }
  return secureUrl.replace("/upload/", `/upload/${transformations}/`);
}

// 1b. Image Subschema
const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: [true, "Image URL is required."] },
    secure_url: { type: String, required: [true, "Secure image URL is required."] },
    publicId: { type: String, required: [true, "Cloudinary public ID is required."] },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    format: { type: String, required: true },
    bytes: { type: Number, required: true },
    alt: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productImageSchema.virtual("thumbnail").get(function(this: IProductImage) {
  return getTransformedUrl(this.secure_url || this.url, "f_auto,q_auto,dpr_auto,w_150,h_150,c_fill");
});

productImageSchema.virtual("medium").get(function(this: IProductImage) {
  return getTransformedUrl(this.secure_url || this.url, "f_auto,q_auto,dpr_auto,w_400,h_500,c_fill");
});

productImageSchema.virtual("large").get(function(this: IProductImage) {
  return getTransformedUrl(this.secure_url || this.url, "f_auto,q_auto,dpr_auto,w_800,h_1000,c_fill");
});

productImageSchema.virtual("original").get(function(this: IProductImage) {
  return getTransformedUrl(this.secure_url || this.url, "f_auto,q_auto,dpr_auto");
});

// 2. Product Schema
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
      unique: true,
      maxlength: [100, "Product name cannot exceed 100 characters."],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Full product description is required."],
      minlength: [20, "Description must be at least 20 characters."],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description highlight is required."],
      maxlength: [250, "Short description cannot exceed 250 characters."],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category."],
    },
    price: {
      type: Number,
      required: [true, "Selling price is required."],
      min: [0, "Price cannot be negative."],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative."],
      validate: {
        validator: function (this: IProduct, value: number) {
          // Only validate originalPrice if it exists
          return !value || value >= this.price;
        },
        message: "Original price ({VALUE}) must be greater than or equal to the selling price.",
      },
    },
    stock: {
      type: Number,
      required: [true, "Inventory stock level is required."],
      min: [0, "Stock cannot be negative."],
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    images: {
      type: [productImageSchema],
      required: [true, "At least one product image URL is required."],
      validate: {
        validator: function (val: any[]) {
          return val.length > 0;
        },
        message: "A product must have at least one image.",
      },
    },
    colors: [productColorSchema],
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0.0,
      min: [0, "Rating cannot be below 0."],
      max: [5, "Rating cannot exceed 5."],
      set: (val: number) => Math.round(val * 10) / 10, // Round to 1 decimal place
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative."],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.isNew = ret.isNewArrival;
        delete ret.isNewArrival;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.isNew = ret.isNewArrival;
        delete ret.isNewArrival;
        return ret;
      }
    }
  }
);

// Mongoose Indexes
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ isFeatured: 1, isNewArrival: 1, isBestseller: 1 });

// Helper to slugify text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Pre-save hook: Generate slug and SKU automatically
productSchema.pre<IProduct>("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name);
  }

  if (!this.sku) {
    // Generate a random alphanumeric SKU suffix
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sku = `LUN-${randomSuffix}`;
  }

  // Convert plain string images to object structure if needed for backward-compatibility
  if (this.isModified("images") && this.images && this.images.length > 0) {
    this.images = this.images.map((img: any, idx: number) => {
      if (typeof img === "string") {
        return {
          url: img,
          secure_url: img,
          publicId: `legacy_url_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          width: 800,
          height: 1000,
          format: "jpg",
          bytes: 1024,
          alt: this.name,
          isPrimary: idx === 0,
          uploadedAt: new Date(),
        };
      }
      return img;
    });
  }

  next();
});

// Export model
export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
