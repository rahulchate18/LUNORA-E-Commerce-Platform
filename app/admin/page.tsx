/**
 * app/admin/page.tsx — Admin Dashboard Overview Home
 *
 * Client Component that consumes AdminContext.
 */
"use client";

import Link from "next/link";
import { useAdmin } from "@/context/admin-context";
import { formatPrice } from "@/lib/mock-data";
import {
  DollarSign,
  ShoppingCart,
  Users,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { products, orders, customers } = useAdmin();

  // Calculations
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  ).length;

  const recentOrders = orders.slice(0, 4);

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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          Real-time summary of LUNORA e-commerce store metrics.
        </p>
      </div>

      {/* ── Metrics Cards Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Revenue */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Total Revenue
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
              {formatPrice(totalRevenue)}
            </h3>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              +14%
            </span>
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Total Orders
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
              {orders.length}
            </h3>
            <span className="text-[10px] font-medium text-neutral-400">
              {activeOrdersCount} processing
            </span>
          </div>
        </div>

        {/* Metric 3: Customers */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Total Customers
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
              {customers.length}
            </h3>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
              +4 new
            </span>
          </div>
        </div>

        {/* Metric 4: Products */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Active Inventory
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
              {products.length}
            </h3>
            <span className="text-[10px] font-medium text-neutral-400">
              6 categories
            </span>
          </div>
        </div>
      </div>

      {/* ── Recent Orders Logs Table ── */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Recent Store Transactions</h3>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <span>Manage Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 dark:border-neutral-800">
                <th className="py-3 font-semibold uppercase tracking-wider">Order ID</th>
                <th className="py-3 font-semibold uppercase tracking-wider">Date</th>
                <th className="py-3 font-semibold uppercase tracking-wider">Customer</th>
                <th className="py-3 font-semibold uppercase tracking-wider">Total Amount</th>
                <th className="py-3 font-semibold uppercase tracking-wider">Status</th>
                <th className="py-3 text-right">View details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="text-neutral-700 dark:text-neutral-300">
                  <td className="py-4 font-semibold text-neutral-900 dark:text-white">
                    {ord.orderNumber}
                  </td>
                  <td className="py-4" suppressHydrationWarning>
                    {new Date(ord.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-4 font-medium text-neutral-900 dark:text-white">
                    {ord.shippingAddress.name}
                  </td>
                  <td className="py-4 font-bold">{formatPrice(ord.total)}</td>
                  <td className="py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold leading-none capitalize",
                        statusColors[ord.status]
                      )}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      href="/admin/orders"
                      className="text-xs font-semibold text-neutral-900 underline hover:no-underline dark:text-white"
                    >
                      Process Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
