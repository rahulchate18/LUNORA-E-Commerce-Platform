import type { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart-service.js";
import { catchAsync } from "../utils/catch-async.js";
import { AppError } from "../utils/app-error.js";

// Helper to check user context
function getUserId(req: Request): string {
  if (!req.user || !req.user.id) {
    throw new AppError("Authentication credentials not found.", 401);
  }
  return req.user.id;
}

// ─── Get Current Cart ────────────────────────────────────────────────────────
export const getCart = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = getUserId(req);
    const cart = await CartService.getOrCreateCart(userId);

    res.status(200).json({
      success: true,
      data: { cart },
    });
  }
);

// ─── Add Product To Cart ─────────────────────────────────────────────────────
export const addToCart = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = getUserId(req);
    const { productId, quantity, selectedColor } = req.body as {
      productId: string;
      quantity: number;
      selectedColor?: { name: string; hex: string };
    };

    const cart = await CartService.addToCart(
      userId,
      productId,
      quantity,
      selectedColor
    );

    res.status(200).json({
      success: true,
      message: "Product successfully added to cart.",
      data: { cart },
    });
  }
);

// ─── Update Cart Item Quantity ────────────────────────────────────────────────
export const updateQuantity = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = getUserId(req);
    const productId = req.params.productId as string;
    const { quantity } = req.body as { quantity: number };

    const cart = await CartService.updateQuantity(userId, productId, quantity);

    res.status(200).json({
      success: true,
      message: "Cart item quantity updated.",
      data: { cart },
    });
  }
);

// ─── Remove Item From Cart ───────────────────────────────────────────────────
export const removeFromCart = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = getUserId(req);
    const productId = req.params.productId as string;

    const cart = await CartService.removeFromCart(userId, productId);

    res.status(200).json({
      success: true,
      message: "Item removed from cart.",
      data: { cart },
    });
  }
);

// ─── Clear Shopping Cart ─────────────────────────────────────────────────────
export const clearCart = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = getUserId(req);
    await CartService.clearCart(userId);

    res.status(200).json({
      success: true,
      message: "Shopping cart cleared successfully.",
      data: null,
    });
  }
);
