/**
 * components/auth/auth-card-wrapper.tsx — Shared premium split-screen layout for auth forms
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthCardWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  illustrationUrl?: string;
  quote?: string;
  quoteAuthor?: string;
}

export function AuthCardWrapper({
  children,
  title,
  subtitle,
  illustrationUrl = "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
  quote = "Carry yourself with confidence. LUNORA is more than a bag; it's a statement.",
  quoteAuthor = "LUNORA Editorial",
}: AuthCardWrapperProps) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full">
      {/* Left side: Premium high-fashion branding image (hidden on mobile/tablet) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-neutral-950 lg:block">
        <Image
          src={illustrationUrl}
          alt="LUNORA premium fashion illustration"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-75 transition-transform duration-1000 hover:scale-102"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-neutral-950/40" />

        {/* Branding text details */}
        <div className="absolute bottom-16 left-16 right-16 space-y-6 text-white">
          <Link href="/" className="inline-block text-sm font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">
            LUNORA
          </Link>
          <div className="space-y-3">
            <blockquote className="text-2xl font-semibold leading-relaxed tracking-tight">
              “{quote}”
            </blockquote>
            <cite className="block text-xs font-bold uppercase tracking-widest text-neutral-400 not-italic">
              — {quoteAuthor}
            </cite>
          </div>
        </div>
      </div>

      {/* Right side: Form container */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Back Link */}
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>

          {/* Header titles */}
          <div className="mt-8 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          </div>

          {/* Render forms here */}
          <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900/40">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
