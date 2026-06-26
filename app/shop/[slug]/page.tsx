/**
 * app/shop/[slug]/page.tsx — Product Details Page (Server Component)
 *
 * Next.js 16 App Router Page. Awaits params Promise, loads product details,
 * and assembles the product layout.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { getProductBySlug } from "@/lib/mock-data";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductReviews } from "@/components/product/product-reviews";
import { RelatedProducts } from "@/components/product/related-products";
import { Section } from "@/components/ui/section";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | LUNORA`,
      description: product.shortDescription,
      images: product.images.map((img) => ({ url: typeof img === "string" ? img : img.url })),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images.map((img: any) => typeof img === "string" ? img : img.url),
    "description": product.shortDescription || product.description,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "LUNORA"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://lunora.com/shop/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": "2027-12-31"
    }
  };

  return (
    <Section className="py-6 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumbs & Back Link */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4 text-xs font-semibold text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="capitalize text-neutral-400">{product.category.replace("-", " ")}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-[120px] sm:max-w-none text-neutral-900 dark:text-white">
            {product.name}
          </span>
        </div>

        <Link
          href="/shop"
          className="flex items-center gap-1 text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to shop</span>
        </Link>
      </div>

      {/* Main product gallery + info details grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Side: Image Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Right Side: Product Buy Details */}
        <div className="lg:col-span-5">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Product Description Tabs / Accordion detail sections */}
      <div className="mt-12 space-y-6 border-t border-neutral-100 pt-10 dark:border-neutral-800">
        <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Description
        </h3>
        <p className="text-sm leading-relaxed text-neutral-600 max-w-4xl dark:text-neutral-400">
          {product.description}
        </p>
      </div>

      {/* Product Reviews */}
      <div className="mt-12 border-t border-neutral-100 pt-10 dark:border-neutral-800">
        <ProductReviews reviews={product.reviews} rating={product.rating} />
      </div>

      {/* Related Products strip */}
      <div className="mt-16">
        <RelatedProducts currentProductId={product.id} category={product.category} />
      </div>
    </Section>
  );
}
