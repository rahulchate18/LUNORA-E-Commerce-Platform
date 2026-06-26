/**
 * components/cart/empty-cart.tsx — Beautiful empty state for cart page
 */
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 animate-bounce">
        <ShoppingBag className="h-9 w-9 text-neutral-400" />
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
        Your shopping cart is empty
      </h2>
      <p className="mt-2 text-sm text-neutral-500 max-w-sm dark:text-neutral-400">
        Before you can check out, you must add some premium items to your shopping cart. You'll find lots of interesting products on our shop page.
      </p>
      <div className="mt-8">
        <Link
          href="/shop"
          className="rounded-lg bg-neutral-950 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}
