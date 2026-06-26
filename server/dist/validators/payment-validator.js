import { z } from "zod";
// ─── Create Razorpay Order Validator ──────────────────────────────────────────
export const createPaymentOrderSchema = {
    body: z.object({
        couponCode: z.string().trim().toUpperCase().optional(),
    }),
};
// ─── Verify Signature & Create Order Validator ─────────────────────────────────
export const verifyPaymentSchema = {
    body: z.object({
        razorpay_order_id: z
            .string({ required_error: "Razorpay Order ID is required." })
            .min(1),
        razorpay_payment_id: z
            .string({ required_error: "Razorpay Payment ID is required." })
            .min(1),
        razorpay_signature: z
            .string({ required_error: "Razorpay Signature is required." })
            .min(1),
        shippingAddress: z.object({
            name: z
                .string({ required_error: "Recipient name is required." })
                .min(2, "Name must be at least 2 characters.")
                .max(50, "Name cannot exceed 50 characters.")
                .trim(),
            street: z
                .string({ required_error: "Street address is required." })
                .min(5, "Street address must be at least 5 characters.")
                .trim(),
            city: z
                .string({ required_error: "City is required." })
                .min(2, "City name is required.")
                .trim(),
            state: z
                .string({ required_error: "State is required." })
                .min(2, "State name is required.")
                .trim(),
            postalCode: z
                .string({ required_error: "Postal code is required." })
                .regex(/^[0-9]{5,6}$/, "Postal code must be 5 or 6 digits."),
            phone: z
                .string({ required_error: "Contact number is required." })
                .regex(/^[0-9]{10,12}$/, "Contact number must be 10 to 12 digits."),
        }),
        couponCode: z
            .string()
            .trim()
            .toUpperCase()
            .optional(),
    }),
};
//# sourceMappingURL=payment-validator.js.map