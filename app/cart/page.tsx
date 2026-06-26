/**
 * app/cart/page.tsx — Shopping Cart Page
 *
 * Client Component that consumes CartContext and handles loading states
 * to prevent SSR hydration mismatches when reading from localStorage.
 */
"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { EmptyCart } from "@/components/cart/empty-cart";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function CartPage() {
  const { state } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration skeleton
  if (!mounted) {
    return (
      <Section className="py-8 md:py-12">
        <div className="space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-60 w-full" />
            </div>
          </div>
        </div>
      </Section>
    );
  }

  const isEmpty = state.items.length === 0;

  return (
    <Section className="py-8 md:py-12">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-900 dark:text-white font-bold">Shopping Cart</span>
      </div>

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-white">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* List of Cart Items */}
            <div className="lg:col-span-2 rounded-xl border border-neutral-100 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {state.items.map((item) => (
                  <CartItem key={`${item.product.id}-${item.selectedColor?.name}`} item={item} />
                ))}
              </div>
            </div>

            {/* Order Summary Summary Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CartSummary />
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
