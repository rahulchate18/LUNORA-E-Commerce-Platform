/**
 * app/dashboard/layout.tsx — User Dashboard Main Layout
 *
 * Client Component because it tracks route changes, checks session authorization,
 * handles logouts, and shifts between horizontal tab strips (mobile) and sidebar (desktop).
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  ShoppingBag,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Protect route
  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, loading, isAuthenticated, router]);

  // Loading skeleton state
  if (!mounted || loading || !isAuthenticated) {
    return (
      <Section className="py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="space-y-4 w-full max-w-sm">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Section>
    );
  }

  const menuItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Order History",
      href: "/dashboard/orders",
      icon: ShoppingBag,
      exact: false,
    },
    {
      label: "Saved Addresses",
      href: "/dashboard/addresses",
      icon: MapPin,
      exact: true,
    },
    {
      label: "Profile Settings",
      href: "/dashboard/profile",
      icon: Settings,
      exact: true,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Section className="py-8 md:py-12">
      {/* Title */}
      <div className="mb-6 flex flex-col gap-1.5 border-b border-neutral-100 pb-6 dark:border-neutral-800">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-white">
          My Account
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Welcome back, <span className="font-semibold text-neutral-800 dark:text-neutral-200">{user?.name}</span>
        </p>
      </div>

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Navigation - Mobile Tab Strip / Desktop Sidebar */}
        <aside className="md:col-span-1">
          {/* Mobile Tab Strip (Horizontal Scroll) */}
          <div className="flex gap-2 overflow-x-auto pb-3 border-b border-neutral-100 md:hidden dark:border-neutral-800 no-scrollbar">
            {menuItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all focus:outline-hidden",
                    isActive
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 focus:outline-hidden dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden space-y-1.5 md:block">
            {menuItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition-all group",
                    isActive
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </div>
                  {!isActive && (
                    <ChevronRight className="h-4 w-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity dark:text-neutral-600" />
                  )}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all dark:text-red-400 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Dynamic subpage content panel */}
        <main className="md:col-span-3 min-h-[400px]">
          {children}
        </main>
      </div>
    </Section>
  );
}
