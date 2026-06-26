/**
 * components/common/navbar.tsx — LUNORA Global Navigation
 *
 * Client Component — requires useState for mobile drawer + scroll detection.
 *
 * Layout (mobile-first):
 *   [LUNORA Logo]  ········  [🔍 ♡ 🛍 ☰]   ← mobile
 *   [LUNORA Logo]  [Shop | Categories | About | Contact]  [🔍 ♡ 🛍]  ← desktop
 *
 * Behaviours:
 *   - Transparent when at top of page; solid #1A1A1A after 50px scroll
 *   - Mobile drawer slides in from the right
 *   - Active link highlighted with accent underline
 *   - Cart badge shows item count (wired up to cart context in Phase 2)
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";

/* ─── Navigation Config ───────────────────────────────────────────────────── */
const NAV_LINKS: NavLink[] = [
  { label: "Shop All", href: "/shop" },
  { label: "Tote Bags", href: "/shop?category=tote-bags" },
  { label: "Handbags", href: "/shop?category=handbags" },
  { label: "Sling Bags", href: "/shop?category=sling-bags" },
  { label: "Laptop Bags", href: "/shop?category=laptop-bags" },
  { label: "Accessories", href: "/shop?category=accessories" },
];

const NAV_PAGES: NavLink[] = [
  { label: "Collections", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/* ─── Navbar Component ───────────────────────────────────────────────────── */
export function Navbar() {
  const pathname = usePathname();
  const { computed, state } = useCart();
  const { items: wishlistItems } = useWishlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* Scroll listener — switches background from transparent to solid */
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    setMounted(true);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* Close mobile menu on route change */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsShopDropdownOpen(false);
  }, [pathname]);

  /* Prevent body scroll when mobile menu is open */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  /* ─── Live counts with hydration safety ─── */
  const cartItemCount = mounted ? computed.itemCount : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  return (
    <>
      {/* ── Main Header ─────────────────────────────────────────────────── */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-[var(--color-primary)] shadow-lg"
            : "bg-transparent"
        )}
        role="banner"
      >
        <div className="container-lunora">
          <div className="flex h-16 items-center justify-between md:h-[70px]">

            {/* ── Logo ─────────────────────────────────────────────────── */}
            <Link
              href="/"
              className="group flex items-center gap-2"
              aria-label="LUNORA — Home"
            >
              <span
                className={cn(
                  "text-2xl font-bold tracking-[0.15em] uppercase transition-colors duration-200",
                  isScrolled
                    ? "text-[var(--color-secondary)]"
                    : "text-[var(--color-secondary)]"
                )}
              >
                LUN
                <span className="text-[var(--color-accent)] group-hover:text-[var(--color-accent-dark)] transition-colors duration-200">
                  ORA
                </span>
              </span>
            </Link>

            {/* ── Desktop Navigation ───────────────────────────────────── */}
            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label="Main navigation"
            >
              {/* Shop dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsShopDropdownOpen(true)}
                onMouseLeave={() => setIsShopDropdownOpen(false)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md",
                    "text-[var(--color-neutral-300)] hover:text-[var(--color-accent)]"
                  )}
                  aria-expanded={isShopDropdownOpen}
                  aria-haspopup="true"
                >
                  Collections
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-200",
                      isShopDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown menu */}
                {isShopDropdownOpen && (
                  <div
                    className={cn(
                      "absolute top-full left-1/2 -translate-x-1/2 pt-2",
                      "min-w-[200px]"
                    )}
                  >
                    <div className="rounded-lg border border-[var(--color-neutral-800)] bg-[var(--color-primary)] p-1.5 shadow-xl">
                      {NAV_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "block rounded px-3 py-2 text-sm transition-colors duration-150",
                            pathname === link.href
                              ? "bg-[var(--color-accent)] text-[var(--color-primary)] font-medium"
                              : "text-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-800)] hover:text-[var(--color-secondary)]"
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Page links */}
              {NAV_PAGES.filter((l) => l.label !== "Collections").map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md",
                    pathname === link.href
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-neutral-300)] hover:text-[var(--color-accent)]"
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute bottom-0 left-1/2 h-px w-4 -translate-x-1/2 bg-[var(--color-accent)]" />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Action Icons ─────────────────────────────────────────── */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <Link
                href="/search"
                aria-label="Search products"
                className={cn(
                  "flex size-9 items-center justify-center rounded-md transition-colors duration-200",
                  "text-[var(--color-neutral-300)] hover:text-[var(--color-accent)] hover:bg-[oklch(100%_0_0_/_0.08)]"
                )}
              >
                <Search size={18} strokeWidth={1.75} />
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label={`Wishlist (${wishlistCount} items)`}
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-md transition-colors duration-200",
                  "text-[var(--color-neutral-300)] hover:text-[var(--color-accent)] hover:bg-[oklch(100%_0_0_/_0.08)]"
                )}
              >
                <Heart size={18} strokeWidth={1.75} />
                {wishlistCount > 0 && (
                  <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-[9px] font-bold text-[var(--color-primary)]">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label={`Cart (${cartItemCount} items)`}
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-md transition-colors duration-200",
                  "text-[var(--color-neutral-300)] hover:text-[var(--color-accent)] hover:bg-[oklch(100%_0_0_/_0.08)]"
                )}
              >
                <ShoppingBag size={18} strokeWidth={1.75} />
                {cartItemCount > 0 && (
                  <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-[9px] font-bold text-[var(--color-primary)]">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                className={cn(
                  "flex size-9 items-center justify-center rounded-md transition-colors duration-200 md:hidden",
                  "text-[var(--color-neutral-300)] hover:text-[var(--color-accent)] hover:bg-[oklch(100%_0_0_/_0.08)]"
                )}
              >
                {isMobileMenuOpen ? (
                  <X size={20} strokeWidth={1.75} />
                ) : (
                  <Menu size={20} strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Menu Drawer ─────────────────────────────────────────── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[min(85vw,360px)] md:hidden",
          "bg-[var(--color-primary)] shadow-2xl",
          "transition-transform duration-300 ease-[var(--ease-out)]",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-neutral-800)] px-5">
          <span className="text-xl font-bold tracking-[0.15em] uppercase text-[var(--color-secondary)]">
            LUN<span className="text-[var(--color-accent)]">ORA</span>
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
            className="flex size-9 items-center justify-center rounded-md text-[var(--color-neutral-400)] hover:text-[var(--color-secondary)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex flex-col p-4" aria-label="Mobile navigation">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
            Shop
          </p>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-[var(--color-accent)] text-[var(--color-primary)]"
                  : "text-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-800)] hover:text-[var(--color-secondary)]"
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="my-4 h-px bg-[var(--color-neutral-800)]" />

          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
            Pages
          </p>
          {NAV_PAGES.filter((l) => l.label !== "Collections").map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-neutral-400)] hover:text-[var(--color-secondary)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Spacer — prevents content from going under fixed header ───── */}
      <div className="h-16 md:h-[70px]" aria-hidden="true" />
    </>
  );
}
