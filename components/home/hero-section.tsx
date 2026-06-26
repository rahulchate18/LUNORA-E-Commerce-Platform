/**
 * components/home/hero-section.tsx — LUNORA Homepage Hero
 *
 * Client Component — uses Framer Motion for entrance animations.
 *
 * Design: Full viewport, dark editorial background, oversized headline,
 * gold accent details, dual CTA. Inspired by D2C premium fashion brands.
 */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

/* ─── Animation Variants ─────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      // Cubic bezier expressed as a typed tuple for Framer Motion
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, delay: 0.7 },
  },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100svh-70px)] items-center overflow-hidden bg-[var(--color-primary)]"
    >
      {/* ── Background — radial glow effects ─────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 60% 40%, oklch(75% 0.08 72 / 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 80% at 10% 90%, oklch(75% 0.08 72 / 0.04) 0%, transparent 50%)
          `,
        }}
        aria-hidden="true"
      />

      {/* ── Grid overlay — editorial texture ─────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-accent) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
        aria-hidden="true"
      />

      <div className="container-lunora relative z-10 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6 max-w-3xl"
        >
          {/* ── Badge ────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)] bg-[oklch(75%_0.08_72_/_0.08)] px-3.5 py-1.5 text-xs font-medium tracking-[0.08em] uppercase text-[var(--color-accent)]">
              <Sparkles size={11} />
              New Collection 2025
            </span>
          </motion.div>

          {/* ── Main Headline ─────────────────────────────────────────── */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl font-bold leading-[1.05] tracking-tight text-[var(--color-secondary)] sm:text-6xl md:text-7xl"
          >
            Carry Your{" "}
            <span className="text-gradient-accent">Story</span>
            <br />
            <span className="font-light italic">Effortlessly.</span>
          </motion.h1>

          {/* ── Subline ───────────────────────────────────────────────── */}
          <motion.p
            variants={itemVariants}
            className="max-w-lg text-base leading-relaxed text-[var(--color-neutral-400)] sm:text-lg"
          >
            Premium women&apos;s bags crafted for the modern woman — where
            luxury meets everyday functionality. Discover your signature piece.
          </motion.p>

          {/* ── CTAs ──────────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            {/*
             * Using Link with buttonVariants() instead of <Button asChild>.
             * @base-ui/react/button does not support asChild composition.
             * buttonVariants() returns the className string directly.
             */}
            <Link
              href="/shop"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
            >
              Shop Collection
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/shop?category=new-arrivals"
              className={cn(
                buttonVariants({ variant: "outline-accent", size: "lg" })
              )}
            >
              New Arrivals
            </Link>
          </motion.div>

          {/* ── Social proof ─────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-6 pt-4"
          >
            {[
              { value: "10K+", label: "Happy customers" },
              { value: "500+", label: "Premium designs" },
              { value: "4.9★", label: "Avg. rating" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-xl font-bold text-[var(--color-accent)]">
                  {value}
                </span>
                <span className="text-xs text-[var(--color-neutral-500)]">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Decorative right-side accent (desktop only) ───────────────── */}
      <motion.div
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        className="pointer-events-none absolute right-0 top-0 hidden h-full w-[45%] lg:block"
        aria-hidden="true"
      >
        {/* Vertical gold line */}
        <div className="absolute left-0 top-[15%] h-[70%] w-px bg-gradient-to-b from-transparent via-[var(--color-accent)] to-transparent opacity-20" />

        {/* Concentric circle accents */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 size-72 rounded-full border border-[var(--color-accent)] opacity-5" />
        <div className="absolute right-16 top-1/2 -translate-y-1/2 size-48 rounded-full border border-[var(--color-accent)] opacity-[0.08]" />

        {/* "Crafted in India" label */}
        <div className="absolute bottom-12 right-10 flex items-center gap-3">
          <div className="h-px w-8 bg-[var(--color-accent)] opacity-40" />
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--color-neutral-600)]">
            Crafted in India
          </span>
        </div>
      </motion.div>

      {/* ── Scroll indicator ─────────────────────────────────────────── */}
      <motion.div
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--color-neutral-600)]">
            Scroll
          </span>
          <div className="flex h-8 w-4 items-start justify-center rounded-full border border-[var(--color-neutral-700)] p-0.5">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="size-1.5 rounded-full bg-[var(--color-accent)]"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
