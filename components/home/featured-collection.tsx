/**
 * components/home/featured-collection.tsx — Featured Products Grid
 *
 * Server Component — no interactivity (phase 2 will add cart/wishlist).
 * Phase 1: Design skeleton with placeholder product cards.
 * Skeleton loaders will be added when real product data is wired up.
 *
 * Uses the Section component for layout consistency.
 */
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { Section } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

/* ─── Placeholder Data ───────────────────────────────────────────────────── */
const FEATURED_CATEGORIES = [
  {
    id: "tote-bags",
    title: "Tote Bags",
    subtitle: "Carry everything beautifully",
    href: "/shop?category=tote-bags",
    tag: "Best Seller",
    // Phase 2: Replace with Cloudinary image URLs
    gradient: "from-[oklch(20%_0_0)] to-[oklch(28%_0.01_72)]",
    accentGradient: "from-[var(--color-accent)] to-[var(--color-accent-dark)]",
  },
  {
    id: "handbags",
    title: "Handbags",
    subtitle: "Timeless elegance, everyday",
    href: "/shop?category=handbags",
    tag: "New Arrival",
    gradient: "from-[oklch(18%_0_0)] to-[oklch(25%_0.005_72)]",
    accentGradient: "from-[var(--color-accent-light)] to-[var(--color-accent)]",
  },
  {
    id: "sling-bags",
    title: "Sling Bags",
    subtitle: "Hands-free, style-forward",
    href: "/shop?category=sling-bags",
    tag: "Trending",
    gradient: "from-[oklch(15%_0_0)] to-[oklch(22%_0.008_72)]",
    accentGradient: "from-[var(--color-accent)] to-[var(--color-accent-light)]",
  },
  {
    id: "laptop-bags",
    title: "Laptop Bags",
    subtitle: "Work with purpose",
    href: "/shop?category=laptop-bags",
    tag: "Office Pick",
    gradient: "from-[oklch(20%_0_0)] to-[oklch(30%_0.005_72)]",
    accentGradient: "from-[var(--color-accent-dark)] to-[var(--color-accent)]",
  },
] as const;

/* ─── Product Card Placeholder ───────────────────────────────────────────── */
function CategoryCard({
  title,
  subtitle,
  href,
  tag,
  gradient,
  accentGradient,
}: (typeof FEATURED_CATEGORIES)[number]) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-2xl",
        "aspect-[3/4]",
        "bg-gradient-to-br",
        gradient,
        "hover-lift",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      )}
    >
      {/* ── Image placeholder — replaced with <Image> in Phase 2 ─────── */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Decorative bag silhouette placeholder */}
        <div
          className={cn(
            "size-32 rounded-2xl bg-gradient-to-br opacity-20 transition-transform duration-500 group-hover:scale-110",
            accentGradient
          )}
        />
        <div
          className={cn(
            "absolute size-20 rounded-xl bg-gradient-to-br opacity-30",
            accentGradient
          )}
        />
      </div>

      {/* ── Hover overlay ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

      {/* ── Tag badge ─────────────────────────────────────────────────── */}
      <div className="absolute left-4 top-4 z-10">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1",
            "text-[10px] font-semibold uppercase tracking-widest",
            "bg-[var(--color-accent)] text-[var(--color-primary)]"
          )}
        >
          <Tag size={8} />
          {tag}
        </span>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="relative z-10 p-5 transition-transform duration-300 group-hover:-translate-y-1">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--color-accent)]">
          {subtitle}
        </p>
        <h3 className="text-xl font-bold text-[var(--color-secondary)]">
          {title}
        </h3>
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[var(--color-neutral-400)] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:gap-2">
          Shop now <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}

/* ─── Section Component ──────────────────────────────────────────────────── */
export function FeaturedCollection() {
  return (
    <Section id="featured" variant="muted" size="lg">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Curated For You
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] md:text-4xl">
            Shop by Category
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-[var(--color-neutral-500)]">
            From boardroom essentials to weekend companions — find the perfect
            bag for every moment of your life.
          </p>
        </div>
        <Link
          href="/shop"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="divider-accent mb-10 opacity-60" />

      {/* ── Category Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {FEATURED_CATEGORIES.map((category) => (
          <CategoryCard key={category.id} {...category} />
        ))}
      </div>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-[var(--color-neutral-500)]">
          Looking for something specific?
        </p>
        <Link
          href="/shop"
          className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
        >
          Explore Full Collection
          <ArrowRight size={16} />
        </Link>
      </div>
    </Section>
  );
}
