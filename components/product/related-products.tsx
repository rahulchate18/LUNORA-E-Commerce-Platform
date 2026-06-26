/**
 * components/product/related-products.tsx — Related products recommendations
 *
 * Server Component or client component (synchronous) displaying related products.
 */
import { ProductCard } from "./product-card";
import { getRelatedProducts } from "@/lib/mock-data";
import type { Category } from "@/types";

interface RelatedProductsProps {
  currentProductId: string;
  category: Category;
}

export function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  const related = getRelatedProducts(currentProductId, category, 4);

  if (related.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="border-t border-neutral-100 pt-10 dark:border-neutral-800" />
      <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
        You May Also Like
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
