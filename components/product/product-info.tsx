/**
 * components/product/product-info.tsx — Interactive Product detail controls
 *
 * Client Component for color selection, quantity counting, cart additions,
 * and wishlist toggling.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Heart, ShoppingBag, Plus, Minus, Check, AlertTriangle, CreditCard } from "lucide-react";
import type { Product, ProductColor } from "@/types";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();

  // State management
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors.length > 0 ? product.colors[0] : { name: "Default", hex: "#000" }
  );
  const [quantity, setQuantity] = useState(1);

  const wishlisted = isWishlisted(product.id);

  const handleWishlistToggle = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor);
    // Optionally trigger feedback/reset quantity
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor);
    router.push("/checkout");
  };

  const incrementQty = () => {
    setQuantity((prev) => Math.min(prev + 1, Math.min(10, product.stock)));
  };

  const decrementQty = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="space-y-6">
      {/* Meta tags & title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {product.category.replace("-", " ")}
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
          {product.name}
        </h1>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">SKU: {product.sku}</p>
      </div>

      {/* Ratings summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4.5 w-4.5",
                i < Math.floor(product.rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-neutral-200 dark:text-neutral-700"
              )}
            />
          ))}
          <span className="ml-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {product.rating.toFixed(1)}
          </span>
        </div>
        <span className="text-xs text-neutral-300 dark:text-neutral-700">|</span>
        <a
          href="#reviews"
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 underline transition-colors dark:text-neutral-400 dark:hover:text-white"
        >
          {product.reviewCount} Verified Customer Reviews
        </a>
      </div>

      {/* Price block */}
      <div className="border-t border-b border-neutral-100 py-4 dark:border-neutral-800">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-neutral-950 dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-sm text-neutral-400 line-through dark:text-neutral-500">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">
                Save {product.discount}%
              </span>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          Price inclusive of all taxes. Free delivery on orders above ₹999.
        </p>
      </div>

      {/* Short Description */}
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {product.shortDescription}
      </p>

      {/* Color swatches */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
            <span className="uppercase tracking-wider">Select Color</span>
            <span className="text-neutral-400 font-medium">{selectedColor.name}</span>
          </div>
          <div className="flex gap-2">
            {product.colors.map((color) => {
              const isActive = selectedColor.name === color.name;
              return (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color.hex }}
                  className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300/50 shadow-2xs transition-all hover:scale-105 active:scale-95 focus:outline-hidden",
                    isActive && "ring-2 ring-neutral-950 ring-offset-2 dark:ring-white dark:ring-offset-neutral-900"
                  )}
                  title={color.name}
                >
                  {isActive && (
                    <Check
                      className={cn(
                        "h-4 w-4",
                        // Dynamic check color depending on brightness of color
                        color.name.toLowerCase().includes("ivory") || color.name.toLowerCase().includes("white") || color.name.toLowerCase().includes("natural")
                          ? "text-neutral-900"
                          : "text-white"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock warning */}
      {isLowStock && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Hurry! Only {product.stock} items left in stock.</span>
        </div>
      )}

      {isOutOfStock && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800 dark:bg-red-950/20 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Currently Out of Stock. Sign up to get notified when restocked.</span>
        </div>
      )}

      {/* Quantity & Cart/Wishlist actions */}
      {!isOutOfStock && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Quantity selector */}
          <div className="flex h-11 items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 sm:w-28 dark:border-neutral-800 dark:bg-neutral-900">
            <button
              onClick={decrementQty}
              disabled={quantity <= 1}
              className="p-1 text-neutral-500 transition-colors hover:text-neutral-800 disabled:opacity-30 dark:hover:text-white"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
              {quantity}
            </span>
            <button
              onClick={incrementQty}
              disabled={quantity >= product.stock}
              className="p-1 text-neutral-500 transition-colors hover:text-neutral-800 disabled:opacity-30 dark:hover:text-white"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 font-semibold text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-850 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            Add to Cart
          </button>

          {/* Buy Now button */}
          <button
            onClick={handleBuyNow}
            className="flex-1 flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 active:scale-98 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <CreditCard className="h-4.5 w-4.5" />
            Buy Now
          </button>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg border transition-all active:scale-95 focus:outline-hidden",
              wishlisted
                ? "border-red-200 bg-red-50 text-red-600 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-4.5 w-4.5", wishlisted && "fill-current")} />
          </button>
        </div>
      )}

      {/* Specifications / Dimensions / Material Details */}
      <div className="border-t border-neutral-100 pt-6 dark:border-neutral-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Product Details
        </h4>
        <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
          {product.material && (
            <div className="flex justify-between border-b border-neutral-50 pb-1.5 sm:border-0 dark:border-neutral-800">
              <dt className="font-medium text-neutral-400">Material</dt>
              <dd className="font-semibold text-neutral-800 dark:text-neutral-200">{product.material}</dd>
            </div>
          )}
          {product.dimensions && (
            <div className="flex justify-between border-b border-neutral-50 pb-1.5 sm:border-0 dark:border-neutral-800">
              <dt className="font-medium text-neutral-400">Dimensions</dt>
              <dd className="font-semibold text-neutral-800 dark:text-neutral-200">{product.dimensions}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
