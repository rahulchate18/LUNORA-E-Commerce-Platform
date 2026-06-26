# Changelog
All notable changes to the **LUNORA Premium E-Commerce Platform** will be documented in this file.

---

## [1.0.0] - 2026-06-26
### Added
- **Phase 14 (Final Production Release Polish)**:
  - Embedded dynamic JSON-LD metadata for Homepage (`WebSite`, `Store`) and Shop Product details.
  - Added suppressHydrationWarning attributes on all date renderings to handle multi-locale timezone discrepancies.
  - Completed all integration test runs (green checks).
- **Phase 13 (Deployment & DevOps)**:
  - Created dynamic sitemap.xml, robots.txt, and web manifests.
  - Implemented multi-tier readiness (/api/ready) and version API controls.
  - Added daily rotation logs file structures and Morgan middleware.
- **Phase 12 (Emails & Invoices notifications)**:
  - Added Nodemailer template relays and background retry logs schemas.
  - Integrated pdfkit in-memory PDF billing statements.
- **Phase 11 (Cloudinary Image CDN)**:
  - Configured direct buffers streaming uploads, HTML5 uploader grids, and image crop virtuals.
- **Phase 10.5 (Production Hardening)**:
  - Implemented transaction retry concurrency checks, double-submit cookie CSRF defenses, and cryptographically hashed password tokens.
- **Phase 10 (Razorpay Payments Integration)**:
  - Sandboxed Razorpay signature validation, duplicate payment replay defenses, and elegant storefront UI pages.
- **Phase 8 & 9 (Catalog & Shopping flows APIs)**:
  - Integrated satchels & totes products, carts/wishlists contexts, and coupon discounts calculations.
- **Phase 1 - 7 (Platform foundations)**:
  - Constructed Node/TypeScript structure, CORS headers, Helmet policies, JWT cookie sessions, and Mongoose database model collections.
