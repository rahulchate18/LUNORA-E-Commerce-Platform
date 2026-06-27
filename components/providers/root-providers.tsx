/**
 * components/providers/root-providers.tsx — Client providers wrapper
 *
 * Wraps children in CartProvider and WishlistProvider.
 * Keeping it in a separate Client Component allows app/layout.tsx to remain a Server Component.
 */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { AdminProvider } from "@/context/admin-context";
import { ToastProvider } from "@/context/toast-context";

// Global client-side route guard to force new/unauthenticated users to authenticate
function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      const publicPaths = [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ];
      const isPublicPath = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(path)
      );

      if (!isAuthenticated && !isPublicPath) {
        router.push("/login");
      }
    }
  }, [mounted, loading, isAuthenticated, pathname, router]);

  const publicPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  // Show a premium loading screen on protected pages while checking session
  if (mounted && (loading || (!isAuthenticated && !isPublicPath))) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1917] text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-800 border-t-amber-500 mx-auto"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <AuthProvider>
            <AuthGuard>
              <AdminProvider>{children}</AdminProvider>
            </AuthGuard>
          </AuthProvider>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}
