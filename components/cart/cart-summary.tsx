/**
 * components/cart/cart-summary.tsx — Order summary with coupon application
 *
 * Client Component for entering coupons and showing price totals.
 */
"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/mock-data";
import { Percent, Ticket, Trash2, ArrowRight, Check } from "lucide-react";

export function CartSummary() {
  const { computed, state, applyCoupon, removeCoupon, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const res = applyCoupon(couponCode.trim());
    setFeedback(res);
    if (res.success) {
      setCouponCode("");
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setFeedback(null);
  };

  const handleCheckout = () => {
    // Mock checkout flow
    setCheckoutComplete(true);
    setTimeout(() => {
      clearCart();
      setCheckoutComplete(false);
    }, 3000);
  };

  if (checkoutComplete) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-6 text-center dark:border-emerald-950/30 dark:bg-emerald-950/10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">Order Placed Successfully!</h3>
        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
          Thank you for shopping at LUNORA. We have received your order and are processing it.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-base font-bold text-neutral-900 dark:text-white">Order Summary</h3>

      {/* Pricing Lines */}
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Subtotal</span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            {formatPrice(computed.subtotal)}
          </span>
        </div>

        {/* Coupon Discount */}
        {state.coupon && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5" />
              <span>Discount ({state.coupon.code})</span>
            </span>
            <span className="font-semibold">
              -{formatPrice(computed.discountAmount)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
          <span>Delivery Charges</span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            {computed.deliveryCharge === 0 ? (
              <span className="text-emerald-600 font-bold dark:text-emerald-400">FREE</span>
            ) : (
              formatPrice(computed.deliveryCharge)
            )}
          </span>
        </div>

        {computed.subtotal < 999 && (
          <p className="text-[10px] text-neutral-400 leading-none dark:text-neutral-500">
            Add {formatPrice(999 - computed.subtotal)} more to unlock free delivery!
          </p>
        )}

        {/* Total divider */}
        <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800" />

        <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-white">
          <span>Total</span>
          <span>{formatPrice(computed.total)}</span>
        </div>
      </div>

      {/* Coupon Application Block */}
      <div className="mt-6 border-t border-neutral-100 pt-6 dark:border-neutral-800">
        {!state.coupon ? (
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <Ticket className="h-4 w-4" />
              <span>Apply Coupon</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. LUNORA10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-950 placeholder-neutral-400 uppercase focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-neutral-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                Apply
              </button>
            </div>
            {feedback && (
              <p
                className={`text-[11px] font-medium ${
                  feedback.success ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"
                }`}
              >
                {feedback.message}
              </p>
            )}
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
              Try: <span className="font-semibold">LUNORA10</span>, <span className="font-semibold">WELCOME200</span>, <span className="font-semibold">FESTIVE15</span>
            </p>
          </form>
        ) : (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3.5 py-2.5 dark:bg-emerald-950/20">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Applied Coupon
              </span>
              <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {state.coupon.code}
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-white hover:text-red-500 dark:hover:bg-neutral-900"
              title="Remove coupon"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Checkout CTA */}
      <button
        onClick={handleCheckout}
        className="mt-6 flex w-full h-11 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-6 font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 active:scale-98 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
