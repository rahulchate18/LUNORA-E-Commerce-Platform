/**
 * components/product/product-card-skeleton.tsx — ProductCard loading state
 */
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/5] w-full">
        <Skeleton className="h-full w-full rounded-b-none" />
      </div>

      {/* Info Skeleton */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Rating */}
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-10" />
        </div>

        {/* Title */}
        <Skeleton className="mb-4 h-5 w-3/4" />

        {/* Price & Colors */}
        <div className="mt-auto flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <div className="flex gap-1">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
