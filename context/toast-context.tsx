"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type: Toast["type"]) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
    warning: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = React.useMemo(() => ({
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    info: (msg: string) => addToast(msg, "info"),
    warning: (msg: string) => addToast(msg, "warning"),
  }), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

/* ─── Toast Container UI ─────────────────────────────────────────────────── */
function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm sm:max-w-md px-4 sm:px-0"
      aria-live="assertive"
      aria-atomic="true"
    >
      {toasts.map((t) => {
        let icon = <Info className="w-5 h-5 text-stone-400" />;
        let borderClass = "border-stone-200";
        let titleColor = "text-stone-800";
        let barColor = "bg-stone-300";

        if (t.type === "success") {
          icon = <CheckCircle className="w-5 h-5 text-green-600" />;
          borderClass = "border-green-150 bg-green-50/90";
          titleColor = "text-green-900";
          barColor = "bg-green-600";
        } else if (t.type === "error") {
          icon = <XCircle className="w-5 h-5 text-red-600" />;
          borderClass = "border-red-150 bg-red-50/90";
          titleColor = "text-red-900";
          barColor = "bg-red-600";
        } else if (t.type === "warning") {
          icon = <AlertCircle className="w-5 h-5 text-amber-600" />;
          borderClass = "border-amber-150 bg-amber-50/90";
          titleColor = "text-amber-900";
          barColor = "bg-amber-600";
        } else if (t.type === "info") {
          icon = <Info className="w-5 h-5 text-blue-600" />;
          borderClass = "border-blue-150 bg-blue-50/90";
          titleColor = "text-blue-900";
          barColor = "bg-blue-600";
        }

        return (
          <div
            key={t.id}
            role="alert"
            className={`relative flex items-start gap-3 p-4 rounded-xl border bg-white shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${borderClass}`}
          >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-grow pr-4">
              <p className={`text-sm font-semibold tracking-wide ${titleColor}`}>
                {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
              </p>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => onClose(t.id)}
              className="flex-shrink-0 text-stone-400 hover:text-stone-700 transition-colors p-0.5 rounded-full hover:bg-stone-100/50"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {/* Simple CSS animated bar representing time ticking down */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-100/50 rounded-b-xl overflow-hidden">
              <div 
                className={`h-full ${barColor} transition-all duration-[4000ms] ease-linear w-0`}
                style={{ width: "100%", transitionDuration: "4000ms", animationName: "shrink", animationTimingFunction: "linear" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
