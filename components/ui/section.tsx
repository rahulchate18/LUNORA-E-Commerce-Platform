/**
 * components/ui/section.tsx — Section Layout Primitive
 *
 * A reusable wrapper that enforces LUNORA's layout grid:
 *   - Max-width container (1280px) centred with responsive side padding
 *   - Consistent vertical rhythm (padding-block)
 *   - Optional background variants: default | muted | dark | accent
 *
 * This is a Server Component — no interactivity needed.
 *
 * Usage:
 *   <Section>...</Section>
 *   <Section variant="dark" size="lg" id="featured">...</Section>
 *   <Section as="div" className="...">...</Section>
 */
import { cn } from "@/lib/utils";
import type { BaseComponentProps } from "@/types";
import type { ElementType } from "react";

/* ─── Variant & Size Maps ─────────────────────────────────────────────────── */
const variantStyles = {
  /** White — default page background */
  default: "bg-[var(--color-background)] text-[var(--color-foreground)]",
  /** Neutral 50 — subtle off-white for alternating sections */
  muted: "bg-[var(--color-neutral-50)] text-[var(--color-foreground)]",
  /** Deep charcoal — premium dark sections */
  dark: "bg-[var(--color-primary)] text-[var(--color-secondary)]",
  /** Warm gold tint — highlight / accent sections */
  accent: "bg-[var(--color-accent-light)] text-[var(--color-primary)]",
} as const;

const sizeStyles = {
  /** Compact — used for thin promo bars */
  sm: "py-8 md:py-10",
  /** Default — standard section spacing */
  md: "py-12 md:py-16 lg:py-20",
  /** Large — hero-level sections */
  lg: "py-16 md:py-24 lg:py-32",
  /** Extra-large — full-bleed landing sections */
  xl: "py-20 md:py-32 lg:py-40",
} as const;

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface SectionProps extends BaseComponentProps {
  /** Background / color scheme variant */
  variant?: keyof typeof variantStyles;
  /** Vertical padding size */
  size?: keyof typeof sizeStyles;
  /** HTML element to render — defaults to <section> */
  as?: ElementType;
  /** Optional id for scroll-to anchor links */
  id?: string;
  /** If true, inner container is removed (full-bleed) */
  fullBleed?: boolean;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export function Section({
  children,
  className,
  variant = "default",
  size = "md",
  as: Tag = "section",
  id,
  fullBleed = false,
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(variantStyles[variant], sizeStyles[size], className)}
    >
      {fullBleed ? (
        children
      ) : (
        <div className="container-lunora">{children}</div>
      )}
    </Tag>
  );
}
