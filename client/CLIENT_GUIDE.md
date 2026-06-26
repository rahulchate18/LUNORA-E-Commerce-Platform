# LUNORA Client Storefront Guide

This document assists the brand owner in navigating and checking operations on the **LUNORA** storefront.

## 🔑 1. Customer Registration & Login
* Click the profile icon in the storefront header layout.
* To register, enter a name, email address, and password conforming to strong constraints (min 8 chars, numbers, capital letters).
* Standard logins issue a JWT session cookie and set the Double-Submit CSRF cookie.

## 🛍️ 2. Browsing & Filtering
* **Shop Grid**: Accessible via `/shop`. Supports:
  - Search input box filtering items by term matches.
  - Sidebar checkbox controls sorting items by category classifications.
  - Price sliders filtering items in pricing tiers.
  - Sort selections ordering results by ascending/descending pricing.
* **Product Details**: Accessible via `/shop/[slug]`. Renders multi-resolution image gallery previews, color selectors, and add-to-cart controls.

## 🛒 3. Cart & Wishlist
* Click **Add to Cart** on any details page. Cart items count dynamically increments in header indicators.
* The cart sidebar displays subtotals, GST margins, and waived shipping alerts.
* Tap **Wishlist** (heart icon) to bookmark items for future checkout. Bookmark indicators support one-click moves to cart.
