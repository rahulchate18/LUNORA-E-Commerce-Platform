/**
 * components/ui/button.tsx — LUNORA Button Component
 *
 * Built with class-variance-authority (CVA) for type-safe variants.
 * Supports forwardRef for form library compatibility.
 * Uses shadcn's base-nova ButtonPrimitive from @base-ui/react/button
 * for full a11y and form support (disabled, aria-invalid, etc.)
 *
 * Variants:
 *   primary         — solid champagne gold, the main CTA style
 *   secondary       — solid charcoal dark
 *   outline         — bordered transparent
 *   outline-accent  — gold border (for dark backgrounds)
 *   ghost           — transparent with muted hover
 *   ghost-dark      — ghost for dark backgrounds
 *   link            — underline text style
 *
 * Sizes: xs | sm | md (default) | lg | xl
 *        icon | icon-sm | icon-lg
 *
 * Usage:
 *   <Button>Add to Cart</Button>
 *   <Button variant="outline" size="lg">Shop Now</Button>
 *   <Button variant="secondary" disabled>Sold Out</Button>
 *   <Button size="icon" aria-label="Search"><SearchIcon /></Button>
 *   <Button isLoading loadingText="Adding...">Add to Cart</Button>
 */
"use client";

import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonVariantProps } from "./button-variants";

/* ─── Props ──────────────────────────────────────────────────────────────── */
export interface ButtonProps
  extends ButtonPrimitive.Props,
    ButtonVariantProps {
  /** Show a loading spinner and disable the button */
  isLoading?: boolean;
  /** Text shown while isLoading = true; defaults to children */
  loadingText?: string;
}

/* ─── Loading Spinner ────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────────────── */
function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={isLoading || disabled}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
