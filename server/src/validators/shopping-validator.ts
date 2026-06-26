import { z } from "zod";

// ─── Cart Validators ──────────────────────────────────────────────────────────

export const addToCartSchema = {
  body: z.object({
    productId: z
      .string({ required_error: "Product ID is required." })
      .regex(/^[a-f\d]{24}$/i, "Invalid product ID format."),
    quantity: z
      .number({ required_error: "Quantity is required." })
      .int("Quantity must be a whole number.")
      .min(1, "Quantity must be at least 1."),
    selectedColor: z
      .object({
        name: z.string().min(1, "Color name is required."),
        hex: z
          .string()
          .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color hex code."),
      })
      .optional(),
  }),
};

export const updateCartQuantitySchema = {
  body: z.object({
    quantity: z
      .number({ required_error: "Quantity is required." })
      .int("Quantity must be a whole number.")
      .min(1, "Quantity must be at least 1."),
  }),
  params: z.object({
    productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID format."),
  }),
};

export const cartParamSchema = {
  params: z.object({
    productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID format."),
  }),
};

// ─── Wishlist Validators ──────────────────────────────────────────────────────

export const addToWishlistSchema = {
  body: z.object({
    productId: z
      .string({ required_error: "Product ID is required." })
      .regex(/^[a-f\d]{24}$/i, "Invalid product ID format."),
  }),
};

export const moveWishlistItemToCartSchema = {
  body: z.object({
    quantity: z
      .number({ required_error: "Quantity is required." })
      .int()
      .min(1)
      .default(1),
    selectedColor: z
      .object({
        name: z.string().min(1),
        hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
      })
      .optional(),
  }),
  params: z.object({
    productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID format."),
  }),
};

export const wishlistParamSchema = {
  params: z.object({
    productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID format."),
  }),
};

// ─── Order Validators ─────────────────────────────────────────────────────────

export const createOrderSchema = {
  body: z.object({
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
    paymentMethod: z
      .string({ required_error: "Payment method is required." })
      .min(2, "Payment method name is required.")
      .trim(),
    couponCode: z
      .string()
      .trim()
      .toUpperCase()
      .optional(),
  }),
};

export const updateOrderStatusSchema = {
  body: z.object({
    orderStatus: z.enum(
      ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      { required_error: "Order status must be Pending, Processing, Shipped, Delivered, or Cancelled." }
    ),
  }),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid order ID."),
  }),
};

export const orderParamSchema = {
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid order ID."),
  }),
};
