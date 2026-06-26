/**
 * components/common/footer.tsx — LUNORA Site Footer
 *
 * Server Component — no interactivity needed.
 *
 * Layout (mobile → desktop):
 *   Row 1: Logo + tagline + social icons
 *   Row 2: 4 link columns (Shop | Help | Company | Legal)
 *   Row 3: Bottom bar — copyright + payment icons
 *
 * Design: Dark (#1A1A1A) background, gold accents, elegant spacing.
 */
import Link from "next/link";
import {
  Link2,
  MessageCircle,
  Play,
  Globe,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const FOOTER_LINKS = {
  shop: {
    title: "Shop",
    links: [
      { label: "All Bags", href: "/shop" },
      { label: "Tote Bags", href: "/shop?category=tote-bags" },
      { label: "Handbags", href: "/shop?category=handbags" },
      { label: "Sling Bags", href: "/shop?category=sling-bags" },
      { label: "Laptop Bags", href: "/shop?category=laptop-bags" },
      { label: "Travel Bags", href: "/shop?category=travel-bags" },
      { label: "Accessories", href: "/shop?category=accessories" },
    ],
  },
  help: {
    title: "Help",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Track Order", href: "/orders/track" },
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Return & Exchange", href: "/returns" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Care Instructions", href: "/care" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About LUNORA", href: "/about" },
      { label: "Our Story", href: "/about#story" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
} as const;

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    Icon: Link2,
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    Icon: MessageCircle,
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    Icon: Play,
  },
  {
    label: "Website",
    href: "https://lunora.in",
    Icon: Globe,
  },
] as const;

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-accent)]">
        {title}
      </h3>
      <ul className="space-y-2.5" role="list">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[var(--color-neutral-400)] transition-colors duration-150 hover:text-[var(--color-secondary)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Footer Component ───────────────────────────────────────────────────── */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="bg-[var(--color-primary)] text-[var(--color-secondary)]"
    >
      {/* ── Upper Footer ───────────────────────────────────────────────── */}
      <Section
        as="div"
        variant="dark"
        size="lg"
        className="!py-0 border-t border-[var(--color-neutral-800)]"
      >
        <div className="py-14 md:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_2fr] lg:gap-20">

            {/* Brand column */}
            <div className="flex flex-col gap-6">
              {/* Logo */}
              <Link href="/" aria-label="LUNORA — Home" className="w-fit">
                <span className="text-3xl font-bold tracking-[0.15em] uppercase">
                  LUN<span className="text-[var(--color-accent)]">ORA</span>
                </span>
              </Link>

              {/* Tagline */}
              <p className="max-w-xs text-sm leading-relaxed text-[var(--color-neutral-400)]">
                Crafted for the modern woman — every bag tells a story of
                elegance, quality, and conscious design.
              </p>

              {/* Contact info */}
              <div className="flex flex-col gap-2.5">
                <a
                  href="mailto:hello@lunora.in"
                  className="flex items-center gap-2 text-sm text-[var(--color-neutral-400)] transition-colors hover:text-[var(--color-accent)]"
                >
                  <Mail size={14} strokeWidth={1.75} />
                  hello@lunora.in
                </a>
                <a
                  href="tel:+919000000000"
                  className="flex items-center gap-2 text-sm text-[var(--color-neutral-400)] transition-colors hover:text-[var(--color-accent)]"
                >
                  <Phone size={14} strokeWidth={1.75} />
                  +91 90000 00000
                </a>
                <span className="flex items-center gap-2 text-sm text-[var(--color-neutral-400)]">
                  <MapPin size={14} strokeWidth={1.75} />
                  Mumbai, Maharashtra, India
                </span>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LUNORA on ${label}`}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      "border border-[var(--color-neutral-800)]",
                      "text-[var(--color-neutral-500)]",
                      "transition-all duration-200",
                      "hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[oklch(75%_0.08_72_/_0.08)]"
                    )}
                  >
                    <Icon size={16} strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links grid */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <FooterLinkColumn
                title={FOOTER_LINKS.shop.title}
                links={FOOTER_LINKS.shop.links}
              />
              <FooterLinkColumn
                title={FOOTER_LINKS.help.title}
                links={FOOTER_LINKS.help.links}
              />
              <FooterLinkColumn
                title={FOOTER_LINKS.company.title}
                links={FOOTER_LINKS.company.links}
              />
              <FooterLinkColumn
                title={FOOTER_LINKS.legal.title}
                links={FOOTER_LINKS.legal.links}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Gold Divider Line ──────────────────────────────────────────── */}
      <div className="divider-accent opacity-40" />

      {/* ── Bottom Bar ─────────────────────────────────────────────────── */}
      <div className="bg-[var(--color-primary)]">
        <div className="container-lunora">
          <div className="flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-[var(--color-neutral-600)]">
              © {currentYear} LUNORA. All rights reserved. Designed &amp;
              crafted with care.
            </p>
            <div className="flex items-center gap-4">
              {/* Payment method icons */}
              {["VISA", "MC", "UPI", "COD"].map((method) => (
                <span
                  key={method}
                  className={cn(
                    "rounded border border-[var(--color-neutral-800)]",
                    "px-2 py-0.5 text-[9px] font-bold tracking-widest",
                    "text-[var(--color-neutral-600)]"
                  )}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
