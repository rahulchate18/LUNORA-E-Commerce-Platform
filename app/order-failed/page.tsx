"use client";

import { useEffect, useState } from "react";
import { XCircle, ShoppingBag, ShoppingCart, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function OrderFailedPage() {
  const [failedReason, setFailedReason] = useState("");

  useEffect(() => {
    const reason = localStorage.getItem("payment_failed_reason");
    if (reason) {
      setFailedReason(reason);
    } else {
      setFailedReason("Transaction verification check failed or payment window closed.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] flex flex-col justify-between">
      {/* Header */}
      <header className="py-5 border-b bg-white border-stone-200">
        <div className="max-w-6xl mx-auto px-4 flex justify-center">
          <Link href="/" className="font-serif text-2xl tracking-widest uppercase hover:opacity-80 transition-opacity">
            LUNORA
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-12 text-center space-y-8 flex-grow flex flex-col justify-center">
        {/* Animated Red Circle Cross */}
        <div className="flex justify-center">
          <div className="bg-red-50 p-5 rounded-full border border-red-100 shadow-xs">
            <XCircle className="w-16 h-16 text-red-600 animate-pulse" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-serif font-semibold tracking-wide text-stone-900">
            Payment Verification Failed
          </h1>
          <p className="text-stone-500 max-w-sm mx-auto text-sm leading-relaxed">
            We were unable to securely verify your payment with the gateway. If any funds were deducted, they will be auto-refunded to your original payment method in 3–5 business days.
          </p>
        </div>

        {/* Reason Card */}
        <div className="bg-white p-6 rounded-2xl border border-red-150 shadow-2xs text-left space-y-3">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-red-600 border-b pb-2">
            Decline Reason / Error Code
          </h2>
          <p className="text-sm font-mono text-stone-700 whitespace-pre-wrap break-words leading-relaxed">
            {failedReason}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Retry Payment (which goes to checkout) */}
          <Link 
            href="/checkout" 
            className="px-6 py-3.5 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" /> Retry Payment
          </Link>

          {/* Return to Checkout (also /checkout, but styled differently) */}
          <Link 
            href="/cart" 
            className="px-6 py-3.5 border border-stone-300 text-stone-700 bg-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" /> Back to Cart
          </Link>

          {/* Continue Shopping */}
          <Link 
            href="/shop" 
            className="px-6 py-3.5 border border-stone-300 text-stone-700 bg-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
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
