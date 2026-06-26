# LUNORA Product Roadmap

This document outlines the planned future features and architecture roadmap for **LUNORA Premium E-Commerce**.

## 📍 Short-Term Goals (Next 3 Months)
- **Redis Cache Layer**: Cache hot product catalog results to reduce MongoDB read load.
- **Zustand State Migration**: Transition the shopping cart and wishlist React contexts to Zustand stores for refined atomic re-rendering.
- **Admin Coupon Creator UI**: Build an interactive administration panel interface for creating and managing checkout coupon codes.

## 📍 Medium-Term Goals (3-6 Months)
- **BullMQ Notification Workers**: Decouple email dispatch threads from backend transaction controllers using Redis-backed BullMQ messaging workers.
- **Server-Side Rendered Shop Catalog**: Move the main shop route to Server-side rendering (SSR) for instant first paint (FCP) and optimal search rankings.
- **Product Reviews & Ratings Aggregate**: Build customer rating stars input forms and dynamically update aggregated scores in database pre-save hooks.

## 📍 Long-Term Goals (6+ Months)
- **Multi-Tenant Franchising**: Enable multiple storefront brands to share a single decoupled api server.
- **AI Recommendation Engine**: Feed user analytics and shopping profiles into a lightweight recommendation engine to display personalized "You May Also Like" modules.
