/**
 * components/wishlist/wishlist-grid.tsx — Grid of wishlisted bags with quick actions
 *
 * Client Component for wishlist actions: removing, moving to cart.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, Star } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";

export function WishlistGrid() {
  const { items, removeFromWishlist, moveToCart } = useWishlist();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
      <AnimatePresence>
        {items.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
          >
            {/* Image container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <Link href={`/shop/${product.slug}`} className="block h-full w-full">
                <Image
                  src={typeof product.images[0] === "string" ? product.images[0] : (product.images[0]?.url || "")}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </Link>

              {/* Remove button (top right) */}
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-100 bg-white/95 shadow-xs transition-transform hover:scale-110 active:scale-95 dark:border-neutral-800 dark:bg-neutral-900/95"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4 text-neutral-500 hover:text-red-500 transition-colors" />
              </button>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-1 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span className="capitalize tracking-wider">
                  {product.category.replace("-", " ")}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <h3 className="mb-2 line-clamp-1 text-sm font-semibold text-neutral-900 hover:underline dark:text-white">
                <Link href={`/shop/${product.slug}`}>{product.name}</Link>
              </h3>

              <div className="mb-4 mt-auto">
                <span className="font-bold text-neutral-950 dark:text-white">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Move to Cart CTA */}
              <button
                onClick={() => moveToCart(product)}
                disabled={product.stock === 0}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-neutral-950 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Move to Cart</span>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
