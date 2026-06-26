/**
 * app/layout.tsx — Root Layout
 *
 * Topmost Server Component layout shared by all routes. Handles:
 *  - Font injection (Outfit via CSS variable)
 *  - Global SEO metadata
 *  - Structural HTML shell
 *  - Persistent Navbar + Footer
 */
import type { Metadata, Viewport } from "next";
import { outfit } from "@/lib/fonts";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { RootProviders } from "@/components/providers/root-providers";
import "./globals.css";

/* ─── SEO Metadata ───────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "LUNORA — Premium Women's Bags & Fashion Accessories",
    template: "%s | LUNORA",
  },
  description:
    "Shop LUNORA's curated collection of premium women's bags, totes, handbags, sling bags, laptop bags, and fashion accessories. Luxury design at honest prices.",
  keywords: [
    "women's bags",
    "premium handbags",
    "tote bags",
    "sling bags",
    "laptop bags",
    "fashion accessories",
    "luxury bags India",
    "LUNORA",
  ],
  authors: [{ name: "LUNORA" }],
  creator: "LUNORA",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "LUNORA",
    title: "LUNORA — Premium Women's Bags & Fashion Accessories",
    description:
      "Curated luxury bags and fashion accessories for the modern woman.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUNORA — Premium Women's Bags",
    description: "Curated luxury bags and accessories for the modern woman.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

/* ─── Viewport ───────────────────────────────────────────────────────────── */
export const viewport: Viewport = {
  themeColor: "#1A1A1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* ─── Root Layout ─────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
     * outfit.variable injects "--font-outfit" onto <html>.
     * globals.css @theme maps --font-sans to var(--font-outfit),
     * so every element inherits Outfit automatically.
     */
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col antialiased">
        <RootProviders>
          {/* Persistent header — never re-mounts on navigation */}
          <Navbar />

          {/* Page content rendered here by each route's page.tsx */}
          <main id="main-content" className="flex-1">
            {children}
          </main>

          {/* Site-wide footer */}
          <Footer />
        </RootProviders>
      </body>
    </html>
  );
}
