import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Wishlist document interface
 */
export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Wishlist Schema
const wishlistSchema = new Schema<IWishlist>(
  {
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
  },
  {
    timestamps: true,
  }
);

// Mongoose Indexes
wishlistSchema.index({ user: 1 });

// Export model
export const Wishlist: Model<IWishlist> = mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", wishlistSchema);
