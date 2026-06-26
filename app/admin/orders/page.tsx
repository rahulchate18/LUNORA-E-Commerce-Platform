/**
 * app/admin/orders/page.tsx — Admin Order Fulfillment Panel
 *
 * Client Component that consumes AdminContext.
 */
"use client";

import { useState } from "react";
import { useAdmin } from "@/context/admin-context";
import { formatPrice } from "@/lib/mock-data";
import { OrderDrawer } from "@/components/admin/order-drawer";
import { Search, ShoppingBag, Eye, Inbox } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

export default function AdminOrdersPage() {
  const { orders } = useAdmin();

  // Search & filter states
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");

  // Selected order details drawer state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status colors
  const statusColors = {
    Pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
    Processing: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
    Shipped: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400",
    Delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
    Cancelled: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400",
  };

  // Filter products list
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.shippingAddress.name.toLowerCase().includes(query.toLowerCase());
    const matchesTab = activeTab === "All" || o.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabs = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Fulfillment Orders</h2>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          Track customer deliveries, update tracking status, and inspect transaction receipts.
        </p>
      </div>

      {/* Tabs list controls */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-100 dark:border-neutral-800 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const count =
            tab === "All"
              ? orders.length
              : orders.filter((o) => o.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all focus:outline-hidden",
                isActive
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              )}
            >
              <span>{tab}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                  isActive
                    ? "bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950"
                    : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-450"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:max-w-xs">
        <input
          type="text"
          placeholder="Search by Order ID or Customer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pr-3 pl-8 text-xs text-neutral-950 placeholder-neutral-400 outline-hidden focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
        />
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
      </div>

      {/* Orders log table */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 py-16 text-center dark:border-neutral-800">
          <Inbox className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">
            No Orders Found
          </h3>
          <p className="mt-2 text-xs text-neutral-500 max-w-xs dark:text-neutral-400">
            No customer order transactions match your current filters.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50">
                  <th className="py-3 px-6 font-semibold uppercase tracking-wider">Order ID</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Customer</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Amount</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="text-neutral-700 dark:text-neutral-300">
                    <td className="py-4 px-6 font-bold text-neutral-900 dark:text-white">
                      {ord.orderNumber}
                    </td>
                    <td className="py-4 px-4" suppressHydrationWarning>
                      {new Date(ord.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4 font-semibold text-neutral-900 dark:text-white">
                      {ord.shippingAddress.name}
                    </td>
                    <td className="py-4 px-4 font-bold text-neutral-900 dark:text-white">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold leading-none capitalize",
                          statusColors[ord.status]
                        )}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 font-semibold text-neutral-900 underline hover:no-underline dark:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Fulfill</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-out Fulfillment details drawer */}
      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
