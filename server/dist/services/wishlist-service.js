import mongoose from "mongoose";
import { Wishlist } from "../models/wishlist.js";
import { Product } from "../models/product.js";
import { CartService } from "./cart-service.js";
import { AppError } from "../utils/app-error.js";
export class WishlistService {
    /**
     * Retrieves the user's wishlist. Creates a new one if it doesn't exist.
     */
    static async getOrCreateWishlist(userId) {
        let wishlist = await Wishlist.findOne({ user: userId }).populate({
            path: "products",
            select: "name price originalPrice images stock slug isBestseller isNewArrival",
        });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userId, products: [] });
        }
        return wishlist;
    }
    /**
     * Adds a product to the user's wishlist.
     */
    static async addToWishlist(userId, productId) {
        const product = await Product.findById(productId).lean();
        if (!product) {
            throw new AppError("Product not found.", 404);
        }
        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, products: [] });
        }
        const prodId = new mongoose.Types.ObjectId(productId);
        // Prevent duplicate entries
        if (!wishlist.products.some((p) => p.toString() === productId)) {
            wishlist.products.push(prodId);
            await wishlist.save();
        }
        return this.getOrCreateWishlist(userId);
    }
    /**
     * Removes a product from the user's wishlist.
     */
    static async removeFromWishlist(userId, productId) {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            throw new AppError("Wishlist not found.", 404);
        }
        wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
        await wishlist.save();
        return this.getOrCreateWishlist(userId);
    }
    /**
     * Moves a product from the wishlist to the cart.
     */
    static async moveWishlistItemToCart(userId, productId, quantity, selectedColor) {
        // 1. Verify item exists in wishlist
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist || !wishlist.products.some((p) => p.toString() === productId)) {
            throw new AppError("Item not found in wishlist.", 404);
        }
        // 2. Add to cart (will validate product stock availability internally)
        await CartService.addToCart(userId, productId, quantity, selectedColor);
        // 3. Remove from wishlist
        wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
        await wishlist.save();
        return {
            wishlist: await this.getOrCreateWishlist(userId),
            cart: await CartService.getOrCreateCart(userId),
        };
    }
}
//# sourceMappingURL=wishlist-service.js.map