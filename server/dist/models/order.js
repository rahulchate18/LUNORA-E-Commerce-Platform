import mongoose, { Schema } from "mongoose";
// 1. Order Item Snapshot Schema
const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Order item must refer to a product."],
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    selectedColor: {
        name: { type: String, default: "" },
        hex: { type: String, default: "" },
    },
    sku: { type: String, required: true, uppercase: true },
}, { _id: false });
// 2. Order Shipping Address Schema
const orderAddressSchema = new Schema({
    name: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
}, { _id: false });
// 3. Order Schema
const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Order must belong to a user."],
    },
    orderNumber: {
        type: String,
        unique: true,
        trim: true,
        uppercase: true,
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: function (val) {
                return val.length > 0;
            },
            message: "An order must contain at least one item.",
        },
    },
    subtotal: {
        type: Number,
        required: [true, "Subtotal amount is required."],
        min: 0,
    },
    shipping: {
        type: Number,
        required: [true, "Shipping amount is required."],
        min: 0,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
    },
    tax: {
        type: Number,
        required: [true, "Tax amount is required."],
        min: 0,
        default: 0,
    },
    total: {
        type: Number,
        required: [true, "Total checkout amount is required."],
        min: 0,
    },
    paymentStatus: {
        type: String,
        enum: {
            values: ["Pending", "Paid", "Failed", "Refunded"],
            message: "Payment status must be Pending, Paid, Failed, or Refunded.",
        },
        default: "Pending",
    },
    orderStatus: {
        type: String,
        enum: {
            values: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
            message: "Order status must be Pending, Processing, Shipped, Delivered, or Cancelled.",
        },
        default: "Pending",
    },
    shippingAddress: {
        type: orderAddressSchema,
        required: [true, "Shipping destination address is required."],
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment method is required."],
        trim: true,
    },
    paymentId: {
        type: String,
        default: "",
    },
    paymentOrderId: {
        type: String,
        default: "",
    },
    paymentSignature: {
        type: String,
        default: "",
    },
    paidAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Mongoose Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });
// Pre-save hook: Generate dynamic, secure order number if missing
orderSchema.pre("save", function (next) {
    if (!this.orderNumber) {
        const year = new Date().getFullYear();
        const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
        this.orderNumber = `LUN-${year}-${randomDigits}`;
    }
    next();
});
// Export model
export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
//# sourceMappingURL=order.js.map