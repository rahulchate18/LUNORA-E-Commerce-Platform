/**
 * components/providers/root-providers.tsx — Client providers wrapper
 *
 * Wraps children in CartProvider and WishlistProvider.
 * Keeping it in a separate Client Component allows app/layout.tsx to remain a Server Component.
 */
"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { AuthProvider } from "@/context/auth-context";
import { AdminProvider } from "@/context/admin-context";
import { ToastProvider } from "@/context/toast-context";

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <AuthProvider>
            <AdminProvider>{children}</AdminProvider>
          </AuthProvider>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}
