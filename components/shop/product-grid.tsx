/**
 * components/shop/product-grid.tsx — Responsive grid of products with pagination controls
 */
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import type { Product, PaginationInfo } from "@/types";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  pagination: PaginationInfo;
}

export function ProductGrid({ products, pagination }: ProductGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // If no products match the query
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <Inbox className="h-7 w-7 text-neutral-400" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-white">
          No products found
        </h3>
        <p className="mt-2 text-sm text-neutral-500 max-w-xs dark:text-neutral-400">
          We couldn't find any products matching your current filters. Try resetting them or searching for something else.
        </p>
        <button
          onClick={() => router.push(pathname)}
          className="mt-6 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  // Generate page numbers
  const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);

  return (
    <div className="space-y-10">
      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-neutral-100 pt-8 dark:border-neutral-800">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 shadow-2xs hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:disabled:hover:bg-neutral-900"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {pages.map((p) => {
            const isCurrent = p === pagination.currentPage;
            return (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                    : "border border-neutral-200 bg-white text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 shadow-2xs hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:disabled:hover:bg-neutral-900"
            aria-label="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
