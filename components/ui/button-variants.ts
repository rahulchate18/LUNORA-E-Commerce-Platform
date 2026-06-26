/**
 * components/ui/button-variants.ts — Shared button styles
 *
 * Extracted into a non-client file so it can be imported safely by
 * both Server Components and Client Components without triggering Next.js
 * pre-render module restriction warnings.
 */
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  // Base styles — applied to ALL variants
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-2",
    "font-medium tracking-wide whitespace-nowrap",
    "rounded-[var(--radius-md)] border border-transparent bg-clip-padding",
    "text-sm transition-all duration-200 outline-none select-none",
    // Focus ring
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    // Active / disabled
    "active:not-aria-[haspopup]:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50",
    // Invalid state
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    // SVG sizing
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        /** Main CTA — champagne gold */
        primary: [
          "bg-[var(--color-accent)] text-[var(--color-primary)]",
          "border-[var(--color-accent)]",
          "hover:bg-[var(--color-accent-dark)] hover:border-[var(--color-accent-dark)]",
          "shadow-sm hover:shadow-[var(--shadow-accent)]",
        ],
        /** Solid dark — secondary CTA */
        secondary: [
          "bg-[var(--color-primary)] text-[var(--color-secondary)]",
          "hover:bg-[var(--color-neutral-800)]",
        ],
        /** Bordered transparent */
        outline: [
          "border-[var(--color-neutral-300)] bg-transparent text-[var(--color-primary)]",
          "hover:border-[var(--color-primary)] hover:bg-[var(--color-neutral-50)]",
        ],
        /** Gold border — for dark backgrounds */
        "outline-accent": [
          "border-[var(--color-accent)] bg-transparent text-[var(--color-accent)]",
          "hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)]",
        ],
        /** Ghost */
        ghost: [
          "bg-transparent text-[var(--color-primary)]",
          "hover:bg-[var(--color-neutral-100)]",
        ],
        /** Ghost on dark surfaces */
        "ghost-dark": [
          "bg-transparent text-[var(--color-secondary)]",
          "hover:bg-[oklch(100%_0_0_/_0.1)]",
        ],
        /** Destructive — for deletes/errors */
        destructive: [
          "bg-destructive/10 text-destructive",
          "hover:bg-destructive/20",
          "focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        ],
        /** Underline link style */
        link: [
          "bg-transparent text-[var(--color-primary)]",
          "underline underline-offset-4",
          "hover:text-[var(--color-accent)]",
          "border-0 h-auto rounded-none px-0 py-0",
        ],
      },
      size: {
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),12px)] px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-10 gap-1.5 px-5",
        lg: "h-12 gap-2 px-7 text-base",
        xl: "h-14 gap-2 px-9 text-lg",
        icon: "size-10",
        "icon-sm": "size-8 rounded-[min(var(--radius-md),12px)]",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
