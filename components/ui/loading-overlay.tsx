"use client";

import { ShieldCheck, Loader2, Check } from "lucide-react";

interface LoadingOverlayProps {
  currentStepIndex: number; // 0: create order, 1: Razorpay widget, 2: verify signature, 3: completed
  isOpen: boolean;
}

const STEPS = [
  "Creating secure payment order...",
  "Opening secure checkout window...",
  "Verifying payment credentials...",
  "Finalizing your premium order...",
];

export function LoadingOverlay({ currentStepIndex, isOpen }: LoadingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Secure payment transaction processing"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300"
    >
      <div className="max-w-md w-full mx-4 p-8 rounded-2xl border border-stone-800 bg-stone-900 text-stone-100 shadow-2xl flex flex-col items-center space-y-6 text-center">
        {/* Loading Indicator */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#D4A373]/10 animate-ping duration-1000" />
          <div className="bg-stone-850 p-5 rounded-full border border-stone-800 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#D4A373] animate-spin" aria-hidden="true" />
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-serif tracking-wider uppercase text-stone-200">
            Secure Payment Processing
          </h2>
          <p className="text-xs text-stone-500 tracking-wide flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Do not refresh this page or close the browser window.
          </p>
        </div>

        {/* Steps Track */}
        <div className="w-full text-left space-y-4 pt-4 border-t border-stone-800/80">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const isUpcoming = idx > currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3.5 transition-colors duration-200 ${
                  isActive ? "text-stone-100 font-medium" : isCompleted ? "text-[#D4A373]" : "text-stone-600"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {/* Step Circle */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${
                    isCompleted
                      ? "bg-[#D4A373] border-[#D4A373] text-stone-950"
                      : isActive
                      ? "border-[#D4A373] text-[#D4A373] animate-pulse"
                      : "border-stone-700 text-stone-600"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                {/* Step Text */}
                <span className="text-sm tracking-wide">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Screen Reader Announcements */}
        <div className="sr-only" aria-live="polite">
          Current status: {STEPS[currentStepIndex]}
        </div>
      </div>
    </div>
  );
}
