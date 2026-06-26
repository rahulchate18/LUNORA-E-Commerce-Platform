/**
 * app/dashboard/orders/page.tsx — Order History logs listing
 *
 * Client Component that consumes AuthContext.
 */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/mock-data";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrderHistoryPage() {
  const { orders } = useAuth();

  const statusColors = {
    Pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
    Processing: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
    Shipped: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400",
    Delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
    Cancelled: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400",
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 py-16 text-center dark:border-neutral-800">
        <ShoppingBag className="h-10 w-10 text-neutral-300 dark:text-neutral-700 animate-pulse" />
        <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">
          No Orders Placed
        </h3>
        <p className="mt-2 text-xs text-neutral-500 max-w-xs dark:text-neutral-400">
          You haven't purchased any premium products yet. Discover LUNORA bags to begin.
        </p>
        <Link
          href="/shop"
          className="mt-6 rounded-lg bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          View Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Order History</h2>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          Track, check, and review your previous orders.
        </p>
      </div>

      {/* Orders List cards */}
      <div className="space-y-4">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="rounded-xl border border-neutral-100 bg-white p-5 shadow-2xs transition-all hover:shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
          >
            {/* Top Bar Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-50 pb-4 dark:border-neutral-800/60">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Order Number
                  </span>
                  <p className="text-sm font-bold text-neutral-950 dark:text-white">
                    {ord.orderNumber}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Date Placed
                  </span>
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300" suppressHydrationWarning>
                    {new Date(ord.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Total Amount
                  </span>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">
                    {formatPrice(ord.total)}
                  </p>
                </div>
              </div>

              {/* Status & Receipt Actions */}
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold leading-none capitalize",
                    statusColors[ord.status]
                  )}
                >
                  {ord.status}
                </span>
                <Link
                  href={`/dashboard/orders/${ord.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 underline hover:no-underline dark:text-white"
                >
                  <span>Details</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Thumbnail previews grid */}
            <div className="mt-4 flex items-center gap-3 overflow-x-auto">
              {ord.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 flex-shrink-0"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square w-12 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50 dark:border-neutral-800">
                    <Image
                      src={typeof item.product.images[0] === "string" ? item.product.images[0] : (item.product.images[0]?.url || "")}
                      alt={item.product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  {/* Name info */}
                  <div className="max-w-[120px] text-[10px] leading-tight">
                    <p className="line-clamp-1 font-semibold text-neutral-800 dark:text-neutral-200">
                      {item.product.name}
                    </p>
                    <p className="text-neutral-400">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
