import mongoose from "mongoose";
import { Cart } from "../models/cart.js";
import { Product } from "../models/product.js";
import { AppError } from "../utils/app-error.js";

export class CartService {
  /**
   * Retrieves the user's cart. Creates a new one if it doesn't exist.
   */
  static async getOrCreateCart(userId: string) {
    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price originalPrice images stock colors SKU isNewArrival isBestseller slug",
    });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    return cart;
  }

  /**
   * Adds an item to the user's cart.
   */
  static async addToCart(
    userId: string,
    productId: string,
    quantity: number,
    selectedColor?: { name: string; hex: string }
  ) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    if (product.stock < quantity) {
      throw new AppError(
        `Insufficient stock. Only ${product.stock} units are available.`,
        400
      );
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Find if the item already exists with the same color choice
    const itemIndex = cart.items.findIndex((item) => {
      const sameProduct = item.product.toString() === productId;
      if (!sameProduct) return false;

      // Color check
      if (!selectedColor && !item.selectedColor) return true;
      if (selectedColor && item.selectedColor) {
        return item.selectedColor.hex === selectedColor.hex;
      }
      return false;
    });

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (product.stock < newQty) {
        throw new AppError(
          `Insufficient stock. Adding ${quantity} items would exceed available stock (${product.stock}).`,
          400
        );
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        quantity,
        selectedColor,
      });
    }

    await cart.save();
    return this.getOrCreateCart(userId);
  }

  /**
   * Updates the quantity of a cart item.
   */
  static async updateQuantity(userId: string, productId: string, quantity: number) {
    const product = await Product.findById(productId).lean();
    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    if (product.stock < quantity) {
      throw new AppError(
        `Insufficient stock. Only ${product.stock} units are available.`,
        400
      );
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new AppError("Cart not found.", 404);
    }

    // Find the item
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      throw new AppError("Item not found in cart.", 404);
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return this.getOrCreateCart(userId);
  }

  /**
   * Removes a product item from the user's cart.
   */
  static async removeFromCart(userId: string, productId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new AppError("Cart not found.", 404);
    }

    // Filter items out
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    return this.getOrCreateCart(userId);
  }

  /**
   * Clears all items in the user's cart.
   */
  static async clearCart(userId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new AppError("Cart not found.", 404);
    }

    cart.items = [];
    await cart.save();
    return cart;
  }
}
