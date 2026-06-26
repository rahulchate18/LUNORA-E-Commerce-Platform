import { WishlistService } from "../services/wishlist-service.js";
import { catchAsync } from "../utils/catch-async.js";
import { AppError } from "../utils/app-error.js";
// Helper to check user context
function getUserId(req) {
    if (!req.user || !req.user.id) {
        throw new AppError("Authentication credentials not found.", 401);
    }
    return req.user.id;
}
// ─── Get User Wishlist ───────────────────────────────────────────────────────
export const getWishlist = catchAsync(async (req, res, _next) => {
    const userId = getUserId(req);
    const wishlist = await WishlistService.getOrCreateWishlist(userId);
    res.status(200).json({
        success: true,
        data: { wishlist },
    });
});
// ─── Add Product To Wishlist ──────────────────────────────────────────────────
export const addToWishlist = catchAsync(async (req, res, _next) => {
    const userId = getUserId(req);
    const { productId } = req.body;
    const wishlist = await WishlistService.addToWishlist(userId, productId);
    res.status(200).json({
        success: true,
        message: "Product added to wishlist.",
        data: { wishlist },
    });
});
// ─── Remove Product From Wishlist ─────────────────────────────────────────────
export const removeFromWishlist = catchAsync(async (req, res, _next) => {
    const userId = getUserId(req);
    const productId = req.params.productId;
    const wishlist = await WishlistService.removeFromWishlist(userId, productId);
    res.status(200).json({
        success: true,
        message: "Product removed from wishlist.",
        data: { wishlist },
    });
});
// ─── Move Wishlist Item To Cart ───────────────────────────────────────────────
export const moveWishlistItemToCart = catchAsync(async (req, res, _next) => {
    const userId = getUserId(req);
    const productId = req.params.productId;
    const { quantity, selectedColor } = req.body;
    const results = await WishlistService.moveWishlistItemToCart(userId, productId, quantity ?? 1, selectedColor);
    res.status(200).json({
        success: true,
        message: "Wishlist item successfully moved to cart.",
        data: results,
    });
});
//# sourceMappingURL=wishlist-controller.js.map