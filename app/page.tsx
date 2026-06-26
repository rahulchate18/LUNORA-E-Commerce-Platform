/**
 * app/page.tsx — LUNORA Homepage
 *
 * Server Component — composes all homepage sections.
 * Each section handles its own loading/interactivity boundaries.
 *
 * Route: / (root)
 * Metadata inherited from app/layout.tsx root metadata.
 * Page-specific overrides can be added via generateMetadata() if needed.
 */
import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { NewsletterSection } from "@/components/home/newsletter-section";

/* Page-specific metadata overrides the root layout's template */
export const metadata: Metadata = {
  title: "LUNORA — Premium Women's Bags & Fashion Accessories",
  description:
    "Discover LUNORA's curated collection of premium women's bags — totes, handbags, sling bags, laptop bags, and fashion accessories. Luxury design, honest prices.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "LUNORA",
    "url": "https://lunora.com",
    "description": "Premium Women's Bags & Fashion Accessories",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://lunora.com/shop?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "LUNORA Premium Atelier",
    "url": "https://lunora.com",
    "logo": "https://lunora.com/favicon.ico",
    "image": "https://images.unsplash.com/photo-1547949003-9792a18a2601",
    "description": "Shop LUNORA's curated collection of premium women's bags and totes.",
    "email": "support@lunora.com",
    "priceRange": "$$"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      {/* 1. Hero — full-viewport editorial hero */}
      <HeroSection />

      {/* 2. Value props strip */}
      <ValuePropsStrip />

      {/* 3. Featured category grid */}
      <FeaturedCollection />

      {/* 4. Newsletter / promo banner */}
      <NewsletterSection />
    </>
  );
}

/* ─── Value Props Strip ──────────────────────────────────────────────────── */
/**
 * Thin strip below hero — highlights key brand values.
 * Server Component, no imports needed.
 */
function ValuePropsStrip() {
  const props = [
    {
      emoji: "🚚",
      title: "Free Shipping",
      desc: "On all orders above ₹999",
    },
    {
      emoji: "✨",
      title: "Premium Quality",
      desc: "Handpicked materials, crafted with care",
    },
    {
      emoji: "↩️",
      title: "Easy Returns",
      desc: "15-day hassle-free returns",
    },
    {
      emoji: "🔒",
      title: "Secure Payments",
      desc: "Razorpay & Cash on Delivery",
    },
  ];

  return (
    <div className="border-y border-[var(--color-neutral-200)] bg-white">
      <div className="container-lunora">
        <div className="grid grid-cols-2 divide-x divide-y divide-[var(--color-neutral-200)] md:grid-cols-4 md:divide-y-0">
          {props.map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-2 px-6 py-6 text-center md:py-8"
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {emoji}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  {title}
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
