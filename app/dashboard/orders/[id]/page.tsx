/**
 * app/dashboard/orders/[id]/page.tsx — Detailed order invoice receipt & tracker
 *
 * Client Component because it accesses auth context state.
 */
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/mock-data";
import { ArrowLeft, ChevronRight, CheckCircle2, Truck, Box, PackageCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  // Await params promise using React.use() or await in useEffect.
  // In Next.js 16, client component can unwrap using React.use() hook directly!
  const resolvedParams = use(params);
  const { getOrderById } = useAuth();
  const order = getOrderById(resolvedParams.id);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">Order Not Found</h3>
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          The requested order receipt does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/dashboard/orders"
          className="mt-6 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          Return to History
        </Link>
      </div>
    );
  }

  // Tracking Timeline steps
  const steps = [
    { label: "Placed", desc: "Order confirmation sent", icon: Box, status: "Pending" },
    { label: "Processing", desc: "Quality checks in progress", icon: CheckCircle2, status: "Processing" },
    { label: "Shipped", desc: "Transit updates active", icon: Truck, status: "Shipped" },
    { label: "Delivered", desc: "Received by customer", icon: PackageCheck, status: "Delivered" },
  ];

  // Determine active timeline index depending on current status
  const getActiveStepIndex = (status: string) => {
    switch (status) {
      case "Pending":
        return 0;
      case "Processing":
        return 1;
      case "Shipped":
        return 2;
      case "Delivered":
        return 3;
      default:
        return -1;
    }
  };

  const activeIdx = getActiveStepIndex(order.status);

  return (
    <div className="space-y-8">
      {/* Back & Breadcrumb header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4 text-xs font-semibold text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Account
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/dashboard/orders" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Orders
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-neutral-900 dark:text-white font-bold">{order.orderNumber}</span>
        </div>

        <Link
          href="/dashboard/orders"
          className="flex items-center gap-1 text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to orders</span>
        </Link>
      </div>

      {/* ── Order Status Timeline Tracker ── */}
      <div className="rounded-xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Delivery Tracker</h3>
          <span className="text-xs text-neutral-400">
            Order Status:{" "}
            <span className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
              {order.status}
            </span>
          </span>
        </div>

        {order.status === "Cancelled" ? (
          <div className="rounded-lg bg-red-50 p-4 text-xs text-red-800 dark:bg-red-950/20 dark:text-red-400">
            This order was cancelled. If you believe this is an error, please contact customer support.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {steps.map((step, idx) => {
              const isCompleted = idx <= activeIdx;
              const isCurrent = idx === activeIdx;
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-3 transition-colors",
                    isCurrent
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : isCompleted
                      ? "bg-neutral-50 text-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-200"
                      : "text-neutral-400 bg-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      isCurrent
                        ? "bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : isCompleted
                        ? "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                        : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{step.label}</h4>
                    <p className="mt-0.5 text-[10px] opacity-75">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Product Items list + Receipt Breakdown ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Purchased Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-sm font-bold text-neutral-900 dark:text-white">Items in Shipment</h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {/* Image */}
                  <div className="relative aspect-square w-16 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50 dark:border-neutral-800">
                    <Image
                      src={typeof item.product.images[0] === "string" ? item.product.images[0] : (item.product.images[0]?.url || "")}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  {/* Description */}
                  <div className="flex-1 space-y-0.5">
                    <h4 className="text-xs font-bold text-neutral-900 hover:underline dark:text-white">
                      <Link href={`/shop/${item.product.slug}`}>{item.product.name}</Link>
                    </h4>
                    {item.selectedColor && (
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        Color: <span className="font-semibold text-neutral-600 dark:text-neutral-300">{item.selectedColor.name}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  {/* Subtotal */}
                  <span className="text-xs font-bold text-neutral-950 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice breakdown summary card */}
        <div className="lg:col-span-1 space-y-4">
          {/* Summary */}
          <div className="rounded-xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Payment Receipt</h3>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-850 dark:text-white">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>Shipping Charges</span>
                <span className="font-semibold text-neutral-850 dark:text-white">
                  {order.deliveryCharge === 0 ? "FREE" : formatPrice(order.deliveryCharge)}
                </span>
              </div>
              <div className="border-t border-neutral-50 pt-3 dark:border-neutral-800" />
              <div className="flex justify-between text-sm font-bold text-neutral-950 dark:text-white">
                <span>Total Paid</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-50 pt-4 dark:border-neutral-850 text-xs">
              <span className="font-bold text-neutral-400 block uppercase tracking-wider text-[10px]">
                Payment Method
              </span>
              <p className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200">
                {order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Delivery Address receipt card */}
          <div className="rounded-xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Ship To</h3>
            <div className="mt-4 space-y-1 text-xs text-neutral-600 leading-relaxed dark:text-neutral-400">
              <p className="font-bold text-neutral-950 dark:text-white">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
