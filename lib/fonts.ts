/**
 * lib/fonts.ts
 *
 * Central font configuration using next/font/google.
 * Next.js self-hosts Google Fonts — no runtime requests to Google's servers.
 *
 * Outfit is a variable-weight geometric sans-serif that reads as
 * clean and premium — perfect for a luxury fashion brand.
 *
 * We expose:
 *   - `outfit`       → The Outfit font object (has .className and .variable)
 *   - `outfitClass`  → The CSS className string to apply directly to <html>
 */
import { Outfit } from "next/font/google";

export const outfit = Outfit({
  subsets: ["latin"],
  // Variable font — no need to specify individual weights.
  // This gives us font-thin (100) through font-black (900).
  display: "swap",
  variable: "--font-outfit",
});
