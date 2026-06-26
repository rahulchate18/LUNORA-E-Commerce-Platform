import mongoose, { Schema } from "mongoose";
// Wishlist Schema
const wishlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Wishlist must belong to a user."],
        unique: true, // One wishlist per user
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product",
        },
    ],
}, {
    timestamps: true,
});
// Mongoose Indexes
wishlistSchema.index({ user: 1 });
// Export model
export const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
//# sourceMappingURL=wishlist.js.map