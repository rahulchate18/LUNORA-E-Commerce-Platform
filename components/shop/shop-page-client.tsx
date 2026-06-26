/**
 * components/shop/shop-page-client.tsx — Main Shop Page Shell
 *
 * Client Component that coordinates the layout, search bar, sort select,
 * filter sidebar, and product grid.
 * Wraps everything in a Suspense-friendly boundary.
 */
"use client";

import { useState } from "react";
import { FilterSidebar } from "./filter-sidebar";
import { SearchBar } from "./search-bar";
import { SortSelect } from "./sort-select";
import { ProductGrid } from "./product-grid";
import type { Product, PaginationInfo } from "@/types";
import { SlidersHorizontal, X } from "lucide-react";
import { Section } from "@/components/ui/section";

interface ShopPageClientProps {
  products: Product[];
  pagination: PaginationInfo;
}

export function ShopPageClient({ products, pagination }: ShopPageClientProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <Section className="py-8 md:py-12">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-neutral-100 pb-6 md:mb-8 md:flex-row md:items-center md:justify-between md:gap-8 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-white">
            Shop Bags
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Showing {products.length} of {pagination.totalItems} premium styles
          </p>
        </div>

        {/* Search & Mobile Filter Toggle */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          <div className="flex-1 md:w-80 md:flex-none">
            <SearchBar />
          </div>
          <div className="flex items-center justify-between gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 md:hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <SortSelect />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden md:block md:col-span-1">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Product Grid (Right) */}
        <main className="md:col-span-3">
          <ProductGrid products={products} pagination={pagination} />
        </main>
      </div>

      {/* Mobile Sidebar Overlay (Drawer) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-6 shadow-xl dark:bg-neutral-950 animate-slide-in-right">
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mt-8 flex-1 overflow-y-auto pr-1">
              <FilterSidebar />
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
