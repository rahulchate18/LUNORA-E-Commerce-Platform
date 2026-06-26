import mongoose, { Schema } from "mongoose";
// Coupon Schema
const couponSchema = new Schema({
    code: {
        type: String,
        required: [true, "Coupon code is required."],
        unique: true,
        trim: true,
        minlength: [3, "Coupon code must be at least 3 characters."],
        maxlength: [15, "Coupon code cannot exceed 15 characters."],
        match: [/^[A-Z0-9]+$/, "Coupon code must contain only uppercase letters and numbers."],
    },
    discountType: {
        type: String,
        required: [true, "Discount type is required."],
        enum: {
            values: ["flat", "percent"],
            message: "Discount type must be either 'flat' or 'percent'.",
        },
    },
    discountValue: {
        type: Number,
        required: [true, "Discount value is required."],
        min: [1, "Discount value must be at least 1."],
        validate: {
            validator: function (value) {
                if (this.discountType === "percent" && value > 100) {
                    return false;
                }
                return true;
            },
            message: "Percentage discounts cannot exceed 100%. Given: {VALUE}%",
        },
    },
    minSpend: {
        type: Number,
        default: 0,
        min: [0, "Minimum spend amount cannot be negative."],
    },
    expiryDate: {
        type: Date,
        validate: {
            validator: function (value) {
                // If defined, expiry must be in the future
                return !value || value > new Date();
            },
            message: "Coupon expiry date must be set in the future.",
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Mongoose Indexes
couponSchema.index({ code: 1 });
// Mongoose Pre-save hook: uppercase coupon code
couponSchema.pre("save", function (next) {
    if (this.isModified("code")) {
        this.code = this.code.toUpperCase();
    }
    next();
});
// Mongoose Instance Method: check validity
couponSchema.methods.isValid = function (subtotal) {
    if (!this.isActive)
        return false;
    if (this.expiryDate && new Date(this.expiryDate) < new Date())
        return false;
    if (subtotal < this.minSpend)
        return false;
    return true;
};
// Export model
export const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
//# sourceMappingURL=coupon.js.map