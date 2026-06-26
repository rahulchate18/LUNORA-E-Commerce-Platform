import mongoose, { Schema } from "mongoose";
// 1. Color Subschema
const productColorSchema = new Schema({
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
}, { _id: false });
function getTransformedUrl(secureUrl, transformations) {
    if (!secureUrl)
        return "";
    if (!secureUrl.includes("res.cloudinary.com")) {
        return secureUrl;
    }
    return secureUrl.replace("/upload/", `/upload/${transformations}/`);
}
// 1b. Image Subschema
const productImageSchema = new Schema({
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
}, {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
productImageSchema.virtual("thumbnail").get(function () {
    return getTransformedUrl(this.secure_url || this.url, "f_auto,q_auto,dpr_auto,w_150,h_150,c_fill");
});
productImageSchema.virtual("medium").get(function () {
    return getTransformedUrl(this.secure_url || this.url, "f_auto,q_auto,dpr_auto,w_400,h_500,c_fill");
});
productImageSchema.virtual("large").get(function () {
    return getTransformedUrl(this.secure_url || this.url, "f_auto,q_auto,dpr_auto,w_800,h_1000,c_fill");
});
productImageSchema.virtual("original").get(function () {
    return getTransformedUrl(this.secure_url || this.url, "f_auto,q_auto,dpr_auto");
});
// 2. Product Schema
const productSchema = new Schema({
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
            validator: function (value) {
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
            validator: function (val) {
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
        set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal place
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
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.isNew = ret.isNewArrival;
            delete ret.isNewArrival;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.isNew = ret.isNewArrival;
            delete ret.isNewArrival;
            return ret;
        }
    }
});
// Mongoose Indexes
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ isFeatured: 1, isNewArrival: 1, isBestseller: 1 });
// Helper to slugify text
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
// Pre-save hook: Generate slug and SKU automatically
productSchema.pre("save", function (next) {
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
        this.images = this.images.map((img, idx) => {
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
export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
//# sourceMappingURL=product.js.map