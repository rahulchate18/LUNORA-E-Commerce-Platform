import crypto from "crypto";
import { razorpay, razorpayConfig } from "../config/payment.js";
import { Cart } from "../models/cart.js";
import { Coupon } from "../models/coupon.js";
import { Order } from "../models/order.js";
import { OrderService } from "./order-service.js";
import { AppError } from "../utils/app-error.js";
import { logger } from "../config/logger.js";
export class PaymentService {
    /**
     * Generates a Razorpay Order based on the user's current cart and discount coupon checks.
     */
    static async createPaymentOrder(userId, couponCode) {
        // 1. Fetch user's cart
        const cart = await Cart.findOne({ user: userId }).populate({
            path: "items.product",
            select: "price stock",
        });
        if (!cart || cart.items.length === 0) {
            throw new AppError("Your shopping cart is empty.", 400);
        }
        // 2. Validate stock levels & calculate subtotal
        let subtotal = 0;
        for (const item of cart.items) {
            const product = item.product;
            if (!product) {
                throw new AppError("A product in your cart no longer exists.", 404);
            }
            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for "${product.name || 'item'}".`, 400);
            }
            subtotal += product.price * item.quantity;
        }
        // 3. Process Coupon Discount
        let discount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (!coupon) {
                throw new AppError("Invalid coupon code.", 400);
            }
            if (!coupon.isValid(subtotal)) {
                throw new AppError("Coupon code is inactive, expired, or minimum spend requirements are not met.", 400);
            }
            if (coupon.discountType === "flat") {
                discount = coupon.discountValue;
            }
            else if (coupon.discountType === "percent") {
                discount = Math.round(subtotal * (coupon.discountValue / 100));
            }
            discount = Math.min(discount, subtotal);
        }
        // 4. Calculate Shipping, Tax and Final Total
        const taxableAmount = subtotal - discount;
        const shipping = taxableAmount >= 2000 ? 0 : 99;
        const tax = Math.round(taxableAmount * 0.18); // 18% GST
        const total = taxableAmount + shipping + tax;
        const amountInPaise = total * 100;
        // 5. Generate Razorpay Order
        let razorpayOrderId = "";
        try {
            if (razorpayConfig.isMockMode) {
                // Mock fallback for sandbox/local testing
                const randomDigits = Math.floor(100000 + Math.random() * 900000);
                razorpayOrderId = `order_mock_${randomDigits}`;
                logger.info(`Generated Mock Razorpay Order ID: ${razorpayOrderId} for amount: ₹${total}`);
            }
            else {
                const order = await razorpay.orders.create({
                    amount: amountInPaise,
                    currency: "INR",
                    receipt: `receipt_${userId.substring(18)}_${Date.now().toString().substring(8)}`,
                });
                razorpayOrderId = order.id;
            }
        }
        catch (err) {
            logger.error("Razorpay order generation failure:", err);
            throw new AppError("Failed to initiate transaction with payment gateway.", 500);
        }
        return {
            orderId: razorpayOrderId,
            amount: amountInPaise,
            currency: "INR",
            key: razorpayConfig.keyId,
        };
    }
    /**
     * Cryptographically verifies Razorpay signatures and creates the database order record.
     */
    static async verifyPaymentSignature(userId, input) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, } = input;
        // 1. Signature check
        const signText = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generatedSignature = crypto
            .createHmac("sha256", razorpayConfig.keySecret)
            .update(signText)
            .digest("hex");
        if (!razorpay_signature || generatedSignature.length !== razorpay_signature.length) {
            throw new AppError("Cryptographic signature check failed. Payment could not be verified.", 400);
        }
        const isVerified = crypto.timingSafeEqual(Buffer.from(generatedSignature, "utf-8"), Buffer.from(razorpay_signature, "utf-8"));
        if (!isVerified) {
            throw new AppError("Cryptographic signature check failed. Payment could not be verified.", 400);
        }
        // 2. Prevent duplicate MongoDB order creations (replay attack protection)
        const existingOrder = await Order.findOne({ paymentOrderId: razorpay_order_id });
        if (existingOrder) {
            throw new AppError("Order has already been processed for this transaction.", 400);
        }
        // 3. Reuse order-service.createOrder to handle stock validation/reduction, checkout, and cart clearing.
        const order = await OrderService.createOrder(userId, {
            shippingAddress: input.shippingAddress,
            paymentMethod: "Razorpay",
            couponCode: input.couponCode,
            paymentStatus: "Paid",
            paymentId: razorpay_payment_id,
            paymentOrderId: razorpay_order_id,
            paymentSignature: razorpay_signature,
            paidAt: new Date(),
        });
        return order;
    }
    /**
     * Returns all payment transactions for the user.
     */
    static async getPaymentHistory(userId) {
        return Order.find({
            user: userId,
            paymentMethod: "Razorpay",
            paymentStatus: "Paid",
        })
            .sort({ createdAt: -1 })
            .select("orderNumber subtotal discount shipping tax total paymentId paymentOrderId paidAt orderStatus")
            .lean();
    }
}
//# sourceMappingURL=payment-service.js.map