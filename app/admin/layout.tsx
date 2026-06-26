/**
 * app/admin/layout.tsx — Admin Dashboard Frame Layout
 *
 * Client Component for handling responsive sidebar menus and toggles.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Ticket,
  BarChart3,
  Menu,
  X,
  ExternalLink,
  Bell,
  Search,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Products", href: "/admin/products", icon: ShoppingBag, exact: false },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart, exact: false },
    { label: "Customers", href: "/admin/customers", icon: Users, exact: false },
    { label: "Coupons", href: "/admin/coupons", icon: Ticket, exact: false },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, exact: false },
    { label: "Email Logs", href: "/admin/emails", icon: Mail, exact: false },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* ── Desktop Sidebar (Left) ── */}
      <aside className="hidden w-64 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:flex lg:flex-col">
        {/* Brand Header */}
        <div className="flex h-16 items-center border-b border-neutral-200 px-6 dark:border-neutral-800">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-[0.15em] uppercase text-neutral-950 dark:text-white">
              LUN<span className="text-[var(--color-accent)]">ORA</span>
            </span>
            <span className="rounded bg-neutral-950 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white dark:bg-white dark:text-neutral-950">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1 p-4" aria-label="Admin navigation">
          {menuItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== "/admin";
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer links */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <span>View Storefront</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative flex h-full w-64 flex-col bg-white shadow-xl dark:bg-neutral-900 animate-slide-in-left">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-16 items-center px-6 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-lg font-bold tracking-[0.15em] uppercase text-neutral-950 dark:text-white">
                LUN<span className="text-[var(--color-accent)]">ORA</span>
              </span>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {menuItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href) && item.href !== "/admin";
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                      isActive
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-neutral-100 p-4 dark:border-neutral-800">
              <Link
                href="/"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span>View Storefront</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 lg:hidden dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search Placeholder */}
            <div className="relative hidden w-64 md:block">
              <input
                type="text"
                placeholder="Search analytics, logs..."
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 py-1.5 pr-3 pl-8 text-xs text-neutral-950 placeholder-neutral-400 outline-hidden focus:border-neutral-900 focus:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
              />
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification trigger */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />

            {/* Profile badge snippet */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-xs font-bold text-white dark:bg-white dark:text-neutral-950">
                AD
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-bold text-neutral-900 dark:text-white">Admin Console</p>
                <p className="text-[10px] text-neutral-400">admin@lunora.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
