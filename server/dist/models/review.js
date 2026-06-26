import mongoose, { Schema } from "mongoose";
import { Product } from "./product.js";
// Review Schema
const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Review must be authored by a user."],
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Review must belong to a product."],
    },
    rating: {
        type: Number,
        required: [true, "Please provide a rating score."],
        min: [1, "Rating must be at least 1."],
        max: [5, "Rating cannot exceed 5."],
        validate: {
            validator: Number.isInteger,
            message: "Rating score '{VALUE}' must be an integer between 1 and 5.",
        },
    },
    comment: {
        type: String,
        required: [true, "Please provide review feedback text."],
        trim: true,
        minlength: [10, "Review commentary must be at least 10 characters."],
        maxlength: [1000, "Review commentary cannot exceed 1000 characters."],
    },
}, {
    timestamps: true,
});
// Mongoose Indexes
reviewSchema.index({ product: 1, createdAt: -1 });
// Enforce unique review constraint per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
// Static Method to recalculate average ratings and reviews count on Product
reviewSchema.statics.calculateAverageRatings = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId },
        },
        {
            $group: {
                _id: "$product",
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" },
            },
        },
    ]);
    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rating: stats[0].avgRating,
            reviewCount: stats[0].nRating,
        });
    }
    else {
        // Reset to defaults if no reviews remain
        await Product.findByIdAndUpdate(productId, {
            rating: 0.0,
            reviewCount: 0,
        });
    }
};
// Post-save hook to calculate ratings on new submissions
reviewSchema.post("save", async function (doc) {
    // Call the static method on the constructor
    const reviewModel = doc.constructor;
    await reviewModel.calculateAverageRatings(doc.product);
});
// Post-remove query hooks to recalculate ratings after deletions or edits
reviewSchema.post(/^findOneAnd/, async function (doc) {
    if (doc) {
        const reviewModel = mongoose.model("Review");
        await reviewModel.calculateAverageRatings(doc.product);
    }
});
// Export model
export const Review = (mongoose.models.Review ||
    mongoose.model("Review", reviewSchema));
//# sourceMappingURL=review.js.map