import type { Request, Response, NextFunction } from "express";
import { WishlistService } from "../services/wishlist-service.js";
import { catchAsync } from "../utils/catch-async.js";
import { AppError } from "../utils/app-error.js";

// Helper to check user context
function getUserId(req: Request): string {
  if (!req.user || !req.user.id) {
    throw new AppError("Authentication credentials not found.", 401);
  }
  return req.user.id;
}

// ─── Get User Wishlist ───────────────────────────────────────────────────────
export const getWishlist = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = getUserId(req);
    const wishlist = await WishlistService.getOrCreateWishlist(userId);

    res.status(200).json({
      success: true,
      data: { wishlist },
    });
  }
);

// ─── Add Product To Wishlist ──────────────────────────────────────────────────
export const addToWishlist = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = getUserId(req);
    const { productId } = req.body as { productId: string };

    const wishlist = await WishlistService.addToWishlist(userId, productId);

    res.status(200).json({
      success: true,
      message: "Product added to wishlist.",
      data: { wishlist },
    });
  }
);

// ─── Remove Product From Wishlist ─────────────────────────────────────────────
export const removeFromWishlist = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = getUserId(req);
    const productId = req.params.productId as string;

    const wishlist = await WishlistService.removeFromWishlist(userId, productId);

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist.",
      data: { wishlist },
    });
  }
);

// ─── Move Wishlist Item To Cart ───────────────────────────────────────────────
export const moveWishlistItemToCart = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = getUserId(req);
    const productId = req.params.productId as string;
    const { quantity, selectedColor } = req.body as {
      quantity?: number;
      selectedColor?: { name: string; hex: string };
    };

    const results = await WishlistService.moveWishlistItemToCart(
      userId,
      productId,
      quantity ?? 1,
      selectedColor
    );

    res.status(200).json({
      success: true,
      message: "Wishlist item successfully moved to cart.",
      data: results,
    });
  }
);
