/**
 * components/home/newsletter-section.tsx — Newsletter / Promo Banner
 *
 * Client Component — email input requires useState + form submission.
 * Phase 1: UI only. Phase 2 will wire to backend /api/newsletter endpoint.
 *
 * Design: Dark background, champagne gold accent details, minimal elegant form.
 */
"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    // Phase 2: Replace with real API call to /api/newsletter
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setStatus("success");
  };

  const isSuccess = status === "success";

  return (
    <Section variant="dark" size="lg" id="newsletter">
      {/* ── Background glow ────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 100%, oklch(75% 0.08 72 / 0.05) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-8 text-center">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[oklch(75%_0.08_72_/_0.1)]">
            <Mail size={20} className="text-[var(--color-accent)]" />
          </div>

          <div className="divider-accent w-16 opacity-60 mx-auto" />

          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-secondary)] md:text-4xl">
            Stay in the{" "}
            <span className="text-gradient-accent">loop</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-[var(--color-neutral-400)]">
            Subscribe for early access to new arrivals, exclusive member-only
            offers, and style inspiration delivered to your inbox.
          </p>
        </div>

        {/* ── Perks row ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-6">
          {[
            "10% off your first order",
            "Early access to sales",
            "Style inspiration weekly",
          ].map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-sm text-[var(--color-neutral-400)]">
              <div className="size-1.5 rounded-full bg-[var(--color-accent)]" />
              {perk}
            </div>
          ))}
        </div>

        {/* ── Form ────────────────────────────────────────────────────── */}
        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={36} className="text-[var(--color-accent)]" />
            <div>
              <p className="font-semibold text-[var(--color-secondary)]">
                You&apos;re in!
              </p>
              <p className="text-sm text-[var(--color-neutral-400)]">
                Check your inbox — a welcome gift is on its way.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            aria-label="Newsletter subscription form"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Your email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              autoComplete="email"
              aria-required="true"
              disabled={status === "loading"}
              className={cn(
                "flex-1 rounded-[var(--radius-md)] border px-4 py-3 text-sm",
                "bg-[oklch(100%_0_0_/_0.06)] text-[var(--color-secondary)]",
                "border-[var(--color-neutral-700)]",
                "placeholder:text-[var(--color-neutral-600)]",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:border-[var(--color-accent)] focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]",
                "disabled:opacity-50"
              )}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={status === "loading"}
              loadingText="Subscribing..."
              className="shrink-0"
            >
              Subscribe
              {status !== "loading" && <ArrowRight size={14} />}
            </Button>
          </form>
        )}

        {/* ── Fine print ──────────────────────────────────────────────── */}
        <p className="text-[10px] text-[var(--color-neutral-700)]">
          No spam, ever. Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </Section>
  );
}
