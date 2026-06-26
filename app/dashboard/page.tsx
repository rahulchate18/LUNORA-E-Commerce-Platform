/**
 * app/dashboard/page.tsx — Dashboard Overview Page
 *
 * Client Component that consumes AuthContext and WishlistContext.
 */
"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/mock-data";
import {
  CreditCard,
  ShoppingBag,
  Heart,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { user, addresses, orders } = useAuth();
  const { items: wishlistItems } = useWishlist();

  // Compute stats
  const totalSpent = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + o.total, 0);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const recentOrders = orders.slice(0, 2);

  // Status colors
  const statusColors = {
    Pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
    Processing: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
    Shipped: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400",
    Delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
    Cancelled: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400",
  };

  return (
    <div className="space-y-8">
      {/* ── Stats Metric Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Metric 1 */}
        <div className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-50 text-neutral-800 dark:bg-neutral-800 dark:text-white">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Total Spent
            </p>
            <h3 className="mt-1 text-lg font-bold text-neutral-950 dark:text-white">
              {formatPrice(totalSpent)}
            </h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-50 text-neutral-800 dark:bg-neutral-800 dark:text-white">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Orders Placed
            </p>
            <h3 className="mt-1 text-lg font-bold text-neutral-950 dark:text-white">
              {orders.length}
            </h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-50 text-neutral-800 dark:bg-neutral-800 dark:text-white">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Wishlist Items
            </p>
            <h3 className="mt-1 text-lg font-bold text-neutral-950 dark:text-white">
              {wishlistItems.length}
            </h3>
          </div>
        </div>
      </div>

      {/* ── Profile & Shipping Section ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Personal Profile</h3>
            <Link
              href="/dashboard/profile"
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 underline dark:text-neutral-400 dark:hover:text-white"
            >
              Edit
            </Link>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-bold text-neutral-950 dark:text-white">{user?.name}</p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Mail className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary Address */}
        <div className="rounded-xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Primary Address</h3>
            <Link
              href="/dashboard/addresses"
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 underline dark:text-neutral-400 dark:hover:text-white"
            >
              Manage Addresses
            </Link>
          </div>
          {defaultAddress ? (
            <div className="space-y-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              <p className="font-bold text-neutral-950 dark:text-white">{defaultAddress.name}</p>
              <p>{defaultAddress.street}</p>
              <p>
                {defaultAddress.city}, {defaultAddress.state} — {defaultAddress.postalCode}
              </p>
              <p>Phone: {defaultAddress.phone}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <MapPin className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
              <p className="mt-2 text-xs text-neutral-400">No saved addresses</p>
              <Link
                href="/dashboard/addresses"
                className="mt-4 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                Add Address
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="rounded-xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Recent Orders</h3>
          {orders.length > 2 && (
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingBag className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
            <p className="mt-2 text-xs text-neutral-400">You haven't placed any orders yet.</p>
            <Link
              href="/shop"
              className="mt-4 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              Shop LUNORA
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 dark:border-neutral-800">
                  <th className="py-3 font-semibold uppercase tracking-wider">Order ID</th>
                  <th className="py-3 font-semibold uppercase tracking-wider">Date</th>
                  <th className="py-3 font-semibold uppercase tracking-wider">Amount</th>
                  <th className="py-3 font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="text-neutral-700 dark:text-neutral-300">
                    <td className="py-4 font-semibold text-neutral-900 dark:text-white">{ord.orderNumber}</td>
                    <td className="py-4" suppressHydrationWarning>
                      {new Date(ord.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 font-bold">{formatPrice(ord.total)}</td>
                    <td className="py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold leading-none capitalize",
                          statusColors[ord.status]
                        )}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/dashboard/orders/${ord.id}`}
                        className="text-xs font-semibold text-neutral-900 underline hover:no-underline dark:text-white"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
