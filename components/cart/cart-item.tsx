/**
 * components/cart/cart-item.tsx — Single cart item row
 *
 * Client Component for handling quantity updates, deletions, and link navigation.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";
import type { CartItem as CartItemType } from "@/types";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/mock-data";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity, selectedColor } = item;

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <div className="flex items-start gap-4 border-b border-neutral-100 py-4 last:border-0 dark:border-neutral-800">
      {/* Product Image */}
      <div className="relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href={`/shop/${product.slug}`}>
          <Image
            src={typeof product.images[0] === "string" ? product.images[0] : (product.images[0]?.url || "")}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </Link>
      </div>

      {/* Item info */}
      <div className="flex flex-1 flex-col sm:flex-row sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-neutral-900 hover:underline dark:text-white">
            <Link href={`/shop/${product.slug}`}>{product.name}</Link>
          </h4>
          {selectedColor && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Color: <span className="font-semibold">{selectedColor.name}</span>
            </p>
          )}
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Unit Price: {formatPrice(product.price)}
          </p>
        </div>

        {/* Quantity Controls & Delete */}
        <div className="mt-3 flex items-center justify-between sm:mt-0 sm:flex-col sm:items-end sm:gap-2">
          {/* Price display for quantity */}
          <span className="text-sm font-bold text-neutral-950 dark:text-white">
            {formatPrice(product.price * quantity)}
          </span>

          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex h-8 items-center justify-between rounded-lg border border-neutral-200 bg-white px-2 w-24 dark:border-neutral-800 dark:bg-neutral-900">
              <button
                onClick={handleDecrement}
                className="p-0.5 text-neutral-500 hover:text-neutral-800 disabled:opacity-30 dark:hover:text-white"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= product.stock}
                className="p-0.5 text-neutral-500 hover:text-neutral-800 disabled:opacity-30 dark:hover:text-white"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Trash Button */}
            <button
              onClick={() => removeFromCart(product.id)}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-50 hover:text-red-500 dark:hover:bg-neutral-800"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
