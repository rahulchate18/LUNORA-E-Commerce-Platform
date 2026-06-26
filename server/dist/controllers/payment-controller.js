import { PaymentService } from "../services/payment-service.js";
import { catchAsync } from "../utils/catch-async.js";
import { AppError } from "../utils/app-error.js";
import { logger } from "../config/logger.js";
// Helper to check user context
function getUserId(req) {
    if (!req.user || !req.user.id) {
        throw new AppError("Authentication credentials not found.", 401);
    }
    return req.user.id;
}
// ─── Create Razorpay Payment Order ───────────────────────────────────────────
export const createPaymentOrder = catchAsync(async (req, res, _next) => {
    const userId = getUserId(req);
    const { couponCode } = req.body;
    logger.info(`PAYMENT_INITIATED: Payment order creation initiated. User: ${userId}, Coupon: ${couponCode || "None"}`);
    const orderData = await PaymentService.createPaymentOrder(userId, couponCode);
    res.status(200).json({
        success: true,
        message: "Razorpay payment order generated successfully.",
        data: orderData,
    });
});
// ─── Verify Signature & Create Order ──────────────────────────────────────────
export const verifyPaymentSignature = catchAsync(async (req, res, _next) => {
    const userId = getUserId(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress, couponCode, } = req.body;
    try {
        const order = await PaymentService.verifyPaymentSignature(userId, {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            shippingAddress,
            couponCode,
        });
        logger.info(`PAYMENT_VERIFIED: Signature successfully verified. MongoDB Order ID: ${order._id}, Razorpay Order ID: ${razorpay_order_id}`);
        res.status(201).json({
            success: true,
            message: "Payment successfully verified and order placed.",
            data: { order },
        });
    }
    catch (error) {
        // Structured logging for failure states
        if (error.message && error.message.includes("Signature check failed")) {
            logger.warn(`PAYMENT_SIGNATURE_MISMATCH: Signature verification failed. Razorpay Order ID: ${razorpay_order_id}`);
        }
        else if (error.message && error.message.includes("already been processed")) {
            logger.warn(`PAYMENT_DUPLICATE_VERIFICATION: Duplicate verification attempt detected. Razorpay Order ID: ${razorpay_order_id}`);
        }
        else {
            logger.error(`PAYMENT_FAILED: Payment verification failed. Razorpay Order ID: ${razorpay_order_id}. Error: ${error.message}`, error);
        }
        throw error;
    }
});
// ─── Get Payment History ──────────────────────────────────────────────────────
export const getPaymentHistory = catchAsync(async (req, res, _next) => {
    const userId = getUserId(req);
    const history = await PaymentService.getPaymentHistory(userId);
    res.status(200).json({
        success: true,
        count: history.length,
        data: { payments: history },
    });
});
//# sourceMappingURL=payment-controller.js.map