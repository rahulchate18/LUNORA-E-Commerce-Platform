/**
 * components/product/product-card.tsx — Reusable premium bag product card
 *
 * Client Component for interactive wishlist/cart operations.
 * Uses Framer Motion for smooth transitions.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star, ShoppingBag, Eye } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();

  const wishlisted = isWishlisted(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Default to first color if available
    const defaultColor = product.colors.length > 0 ? product.colors[0] : undefined;
    addToCart(product, 1, defaultColor);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-xs transition-all duration-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* Image Gallery / Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <Link href={`/shop/${product.slug}`} className="block h-full w-full">
          {product.images && product.images.length > 0 ? (
            <Image
              src={typeof product.images[0] === "string" ? product.images[0] : (product.images[0]?.url || "")}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
              No Image
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discount && product.discount > 0 && (
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-white">
              -{product.discount}%
            </span>
          )}
          {product.isBestseller && (
            <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-white">
              Bestseller
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-white">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-100 bg-white/90 shadow-sm backdrop-blur-xs transition-all duration-300 hover:scale-110 hover:bg-white active:scale-95 dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:bg-neutral-800"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors duration-300",
              wishlisted ? "fill-red-500 text-red-500" : "text-neutral-600 dark:text-neutral-300"
            )}
          />
        </button>

        {/* Quick Add / Action Bar Hover Overlays */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full px-3 pb-3 transition-transform duration-300 group-hover:translate-y-0">
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Quick Add
            </button>
            <Link
              href={`/shop/${product.slug}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Rating */}
        <div className="mb-1 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span className="capitalize tracking-wider">
            {product.category.replace("-", " ")}
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {product.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="mb-2 line-clamp-1 font-medium text-neutral-800 transition-colors duration-200 hover:text-black dark:text-neutral-200 dark:hover:text-white">
          <Link href={`/shop/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Price & Colors */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-neutral-950 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through dark:text-neutral-500">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Color Dots */}
          <div className="flex gap-1">
            {product.colors.slice(0, 3).map((col) => (
              <span
                key={col.name}
                style={{ backgroundColor: col.hex }}
                title={col.name}
                className="h-2.5 w-2.5 rounded-full border border-neutral-300/50 shadow-2xs"
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[9px] font-semibold text-neutral-500 leading-none self-center">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
