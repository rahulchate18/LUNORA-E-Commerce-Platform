/**
 * components/wishlist/empty-wishlist.tsx — Wishlist empty state illustration
 */
import Link from "next/link";
import { Heart } from "lucide-react";

export function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        <Heart className="h-9 w-9 text-neutral-400" />
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
        Your wishlist is empty
      </h2>
      <p className="mt-2 text-sm text-neutral-500 max-w-sm dark:text-neutral-400">
        Keep track of items you love. Click the heart icon on any bag to save it here for later purchasing or comparison.
      </p>
      <div className="mt-8">
        <Link
          href="/shop"
          className="rounded-lg bg-neutral-950 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          View Shop
        </Link>
      </div>
    </div>
  );
}
