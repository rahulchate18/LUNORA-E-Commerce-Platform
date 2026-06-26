import mongoose, { Schema } from "mongoose";
// 1. Cart Item Color Subschema
const cartItemColorSchema = new Schema({
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
}, { _id: false });
// 2. Cart Item Subschema
const cartItemSchema = new Schema({
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
}, { _id: false });
// 3. Cart Schema
const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Cart must belong to a user."],
        unique: true, // One cart per user
    },
    items: [cartItemSchema],
}, {
    timestamps: true,
});
// Mongoose Indexes
cartSchema.index({ user: 1 });
// Export model
export const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
//# sourceMappingURL=cart.js.map