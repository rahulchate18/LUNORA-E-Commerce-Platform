/**
 * components/shop/filter-sidebar.tsx — Category & Price filters
 *
 * Client Component that read and write URL query parameters to apply filters.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Category, CATEGORY_LABELS, ALL_CATEGORIES } from "@/types";
import { formatPrice } from "@/lib/mock-data";
import { X, SlidersHorizontal } from "lucide-react";

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Selected Category
  const activeCategory = searchParams.get("category") as Category | null;

  // Price range state
  const [minPrice, setMinPrice] = useState<string>(searchParams.get("priceMin") ?? "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("priceMax") ?? "");

  // Update states if searchParams change externally (e.g. on Reset)
  useEffect(() => {
    setMinPrice(searchParams.get("priceMin") ?? "");
    setMaxPrice(searchParams.get("priceMax") ?? "");
  }, [searchParams]);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1 on filter change
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategorySelect = (category: Category | null) => {
    if (activeCategory === category) {
      updateFilters("category", null); // toggle off
    } else {
      updateFilters("category", category);
    }
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (minPrice) params.set("priceMin", minPrice);
    else params.delete("priceMin");

    if (maxPrice) params.set("priceMax", maxPrice);
    else params.delete("priceMax");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    // Keep search query if any
    const q = searchParams.get("q");
    const sort = searchParams.get("sort");
    
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
        <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <SlidersHorizontal className="h-4.5 w-4.5" />
          <span>Filters</span>
        </div>
        {(activeCategory || searchParams.get("priceMin") || searchParams.get("priceMax")) && (
          <button
            onClick={handleClearAll}
            className="text-xs font-medium text-red-600 hover:text-red-500 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Categories
        </h4>
        <div className="flex flex-wrap gap-2 md:flex-col md:items-start md:gap-1.5">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all md:px-0 md:py-1 md:rounded-none md:bg-transparent ${
              activeCategory === null
                ? "bg-neutral-950 text-white md:text-neutral-950 md:font-semibold dark:md:text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 md:bg-transparent md:text-neutral-500 md:hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:md:hover:text-white"
            }`}
          >
            All Products
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all md:px-0 md:py-1 md:rounded-none md:bg-transparent ${
                activeCategory === cat
                  ? "bg-neutral-950 text-white md:text-neutral-950 md:font-semibold dark:md:text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 md:bg-transparent md:text-neutral-500 md:hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:md:hover:text-white"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-3 border-t border-neutral-100 pt-6 dark:border-neutral-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Price Range
        </h4>
        <form onSubmit={handleApplyPrice} className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                ₹
              </span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pr-2 pl-6 text-xs text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
              />
            </div>
            <span className="text-xs text-neutral-400">—</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                ₹
              </span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pr-2 pl-6 text-xs text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Applied Filters Summary */}
      {(activeCategory || searchParams.get("priceMin") || searchParams.get("priceMax")) && (
        <div className="space-y-2 border-t border-neutral-100 pt-6 dark:border-neutral-800">
          <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            Active Filters
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {activeCategory && (
              <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {CATEGORY_LABELS[activeCategory]}
                <button
                  onClick={() => updateFilters("category", null)}
                  className="rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(searchParams.get("priceMin") || searchParams.get("priceMax")) && (
              <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {searchParams.get("priceMin") ? `₹${searchParams.get("priceMin")}` : "₹0"}{" "}
                -{" "}
                {searchParams.get("priceMax") ? `₹${searchParams.get("priceMax")}` : "₹5000+"}
                <button
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("priceMin");
                    params.delete("priceMax");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
