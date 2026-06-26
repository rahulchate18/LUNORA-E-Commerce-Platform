/**
 * components/admin/order-drawer.tsx — Slide-out order receipt & fulfillment controller
 *
 * Client Component that consumes AdminContext.
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdmin } from "@/context/admin-context";
import { formatPrice } from "@/lib/mock-data";
import { X, Check, ShoppingBag, MapPin, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order, OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

interface OrderDrawerProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDrawer({ order, onClose }: OrderDrawerProps) {
  const { updateOrderStatus } = useAdmin();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("Pending");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync selected status state if order changes
  useState(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  });

  // Since React useState doesn't re-run on prop updates once initialized, we trigger this update safely
  const currentStatus = order?.status;
  const [lastId, setLastId] = useState("");
  if (order && order.id !== lastId) {
    setSelectedStatus(order.status);
    setLastId(order.id);
  }

  if (!order) return null;

  const handleStatusUpdate = async () => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await updateOrderStatus(order.id, selectedStatus);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(null), 2500);
      }
    } finally {
      setLoading(false);
    }
  };

  const statusOptions: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900 animate-slide-in-right">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-100 px-6 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Order: {order.orderNumber}
            </h3>
            <p className="text-[10px] text-neutral-400">
              Placed on {new Date(order.date).toLocaleDateString("en-IN", { hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ── Status Fulfillment Controls ── */}
          <div className="rounded-xl border border-neutral-150 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Order Fulfillment Status
            </h4>
            
            <div className="mt-3 flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                disabled={loading}
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-950 outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleStatusUpdate}
                isLoading={loading}
                loadingText="Updating..."
                className="px-4 py-1.5 text-xs h-9"
              >
                Update
              </Button>
            </div>
            {successMsg && (
              <p className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {successMsg}
              </p>
            )}
          </div>

          {/* ── Shipment Details list ── */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Items in Shipment
            </h4>
            <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-100 bg-white p-4 dark:divide-neutral-800 dark:border-neutral-850 dark:bg-neutral-900">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative aspect-square w-12 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50 dark:border-neutral-800">
                    <Image
                      src={typeof item.product.images[0] === "string" ? item.product.images[0] : (item.product.images[0]?.url || "")}
                      alt={item.product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-0.5 text-xs">
                    <h5 className="font-bold text-neutral-900 dark:text-white">
                      {item.product.name}
                    </h5>
                    {item.selectedColor && (
                      <p className="text-[10px] text-neutral-400">
                        Color: <span className="font-semibold text-neutral-600 dark:text-neutral-300">{item.selectedColor.name}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-neutral-400">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-white text-xs">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Ship To & Payment Summary ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Delivery address */}
            <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-850 dark:bg-neutral-900">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                <MapPin className="h-3.5 w-3.5" />
                <span>Shipping Address</span>
              </span>
              <div className="mt-3 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                <p className="font-bold text-neutral-950 dark:text-white">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Price invoice summary */}
            <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-850 dark:bg-neutral-900">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                <CreditCard className="h-3.5 w-3.5" />
                <span>Invoice Breakdown</span>
              </span>
              <div className="mt-3 space-y-2 text-[11px] text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-950 dark:text-white">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-neutral-950 dark:text-white">
                    {order.deliveryCharge === 0 ? "FREE" : formatPrice(order.deliveryCharge)}
                  </span>
                </div>
                <div className="border-t border-neutral-50 pt-2 dark:border-neutral-800" />
                <div className="flex justify-between text-xs font-bold text-neutral-950 dark:text-white">
                  <span>Total Paid</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
