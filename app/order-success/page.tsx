"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Calendar, CreditCard, ShoppingBag, ArrowRight, Download, Receipt } from "lucide-react";
import { useToast } from "@/context/toast-context";
import Link from "next/link";

export default function OrderSuccessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const details = localStorage.getItem("last_order_details");
    if (details) {
      setOrderDetails(JSON.parse(details));
    } else {
      router.push("/");
    }
  }, [router]);

  if (!orderDetails) {
    return null;
  }

  // Formatting Date
  const orderDate = orderDetails.date ? new Date(orderDetails.date) : new Date();
  const formattedOrderDate = orderDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Estimated delivery calculation (4 days from order date)
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownloadInvoice = () => {
    toast.info("Preparing digital invoice download...");
    setTimeout(() => {
      // Simulate download trigger
      toast.success("Invoice PDF downloaded successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] flex flex-col justify-between">
      {/* Premium Header */}
      <header className="py-5 border-b bg-white border-stone-200">
        <div className="max-w-6xl mx-auto px-4 flex justify-center">
          <Link href="/" className="font-serif text-2xl tracking-widest uppercase hover:opacity-80 transition-opacity">
            LUNORA
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <main className="max-w-xl mx-auto px-4 py-12 text-center space-y-8 flex-grow flex flex-col justify-center">
        {/* Animated Green Circle Checkmark */}
        <div className="flex justify-center">
          <div className="bg-emerald-50 p-5 rounded-full border border-emerald-100 animate-bounce shadow-sm">
            <CheckCircle className="w-16 h-16 text-emerald-600" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-serif font-semibold tracking-wide text-stone-900">
            ✓ Payment Successful
          </h1>
          <p className="text-stone-500 max-w-sm mx-auto text-sm leading-relaxed">
            Thank you for shopping with LUNORA. Your payment has been securely verified, and your premium package is being prepared for transit.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs text-left space-y-6">
          <div className="flex items-center gap-2 border-b pb-3 border-stone-100">
            <Receipt className="w-4 h-4 text-stone-500" />
            <h2 className="text-xs font-semibold tracking-wider uppercase text-stone-400">
              Transaction Details
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="text-stone-500 font-medium">Order Number:</div>
            <div className="text-stone-900 font-semibold text-right">{orderDetails.orderNumber}</div>

            <div className="text-stone-500 font-medium">Razorpay Payment ID:</div>
            <div className="text-stone-900 font-mono text-xs text-right break-all">{orderDetails.paymentId}</div>

            <div className="text-stone-500 font-medium">Total Paid:</div>
            <div className="text-stone-900 font-bold text-right text-base text-stone-900 font-serif">₹{orderDetails.amount}</div>

            <div className="text-stone-500 font-medium">Payment Method:</div>
            <div className="text-stone-900 font-semibold text-right">{orderDetails.paymentMethod}</div>

            <div className="text-stone-500 font-medium">Order Date:</div>
            <div className="text-stone-900 font-medium text-right" suppressHydrationWarning>{formattedOrderDate}</div>
          </div>

          {/* Delivery Note */}
          <div className="bg-stone-50 p-4.5 rounded-xl border border-stone-150 flex items-start gap-3.5">
            <Calendar className="w-5 h-5 text-stone-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Estimated Delivery</p>
              <p className="text-sm font-semibold text-stone-850" suppressHydrationWarning>{formattedDeliveryDate}</p>
            </div>
          </div>

          {/* Invoice PDF download action */}
          <button
            onClick={handleDownloadInvoice}
            className="w-full flex items-center justify-center gap-2 py-3 border border-stone-200 text-stone-700 bg-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-50 hover:text-stone-900 transition-all cursor-pointer shadow-2xs"
            aria-label="Download PDF Invoice"
          >
            <Download className="w-4 h-4" /> Download Invoice
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/shop" 
            className="px-6 py-3.5 bg-[#1c1917] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
          <Link 
            href="/dashboard/orders" 
            className="px-6 py-3.5 border border-stone-300 text-stone-755 bg-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            View My Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t bg-stone-100 border-stone-200 text-center text-xs text-stone-400">
        &copy; {new Date().getFullYear()} LUNORA Premium. All rights reserved.
      </footer>
    </div>
  );
}
