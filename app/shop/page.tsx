/**
 * app/shop/page.tsx — Shop Listing Page (Server Component)
 *
 * Next.js 16 App Router Server Component. Awaits searchParams Promise
 * and queries the products from the mock database, rendering ShopPageClient.
 */
import { Suspense } from "react";
import { queryProducts } from "@/lib/mock-data";
import { ShopPageClient } from "@/components/shop/shop-page-client";
import type { Category, SortOption } from "@/types";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    priceMin?: string;
    priceMax?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Shop Collection",
  description: "Browse our premium range of handcrafted tote bags, handbags, slings, and accessories.",
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Await searchParams in Next.js 16
  const resolvedParams = await searchParams;

  const category = resolvedParams.category as Category | undefined;
  const q = resolvedParams.q;
  const sort = resolvedParams.sort as SortOption | undefined;
  const priceMin = resolvedParams.priceMin ? parseFloat(resolvedParams.priceMin) : undefined;
  const priceMax = resolvedParams.priceMax ? parseFloat(resolvedParams.priceMax) : undefined;
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;

  const { products, pagination } = queryProducts({
    category,
    q,
    sort,
    priceMin,
    priceMax,
    page,
  });

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm font-medium text-neutral-500 animate-pulse">Loading LUNORA collection...</p>
      </div>
    }>
      <ShopPageClient products={products} pagination={pagination} />
    </Suspense>
  );
}
