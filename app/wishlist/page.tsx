/**
 * app/wishlist/page.tsx — Customer Wishlist Page
 *
 * Client Component that consumes WishlistContext and handles hydration
 * safety when reading initial states from localStorage.
 */
"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/context/wishlist-context";
import { EmptyWishlist } from "@/components/wishlist/empty-wishlist";
import { WishlistGrid } from "@/components/wishlist/wishlist-grid";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function WishlistPage() {
  const { items } = useWishlist();
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="aspect-[4/5] w-full" />
          </div>
        </div>
      </Section>
    );
  }

  const isEmpty = items.length === 0;

  return (
    <Section className="py-8 md:py-12">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-900 dark:text-white font-bold">Wishlist</span>
      </div>

      {isEmpty ? (
        <EmptyWishlist />
      ) : (
        <div className="space-y-6">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-white">
              My Wishlist
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {items.length} saved {items.length === 1 ? "style" : "styles"}
            </p>
          </div>

          {/* Wishlist Grid */}
          <WishlistGrid />
        </div>
      )}
    </Section>
  );
}
