import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Cart Item color interface
 */
export interface ICartItemColor {
  name: string;
  hex: string;
}

/**
 * Cart Item interface
 */
export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  selectedColor?: ICartItemColor;
}

/**
 * Cart document interface
 */
export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// 1. Cart Item Color Subschema
const cartItemColorSchema = new Schema<ICartItemColor>(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// 2. Cart Item Subschema
const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Cart item must refer to a product."],
    },
    quantity: {
      type: Number,
      required: [true, "Select quantity count."],
      min: [1, "Quantity must be at least 1."],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a positive integer.",
      },
    },
    selectedColor: cartItemColorSchema,
  },
  { _id: false }
);

// 3. Cart Schema
const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cart must belong to a user."],
      unique: true, // One cart per user
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

// Mongoose Indexes
cartSchema.index({ user: 1 });

// Export model
export const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);
