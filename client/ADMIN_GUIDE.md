# LUNORA Admin Administration Guide

This guide details operations inside LUNORA's secure administrative interface.

## 🔑 1. Logging In as Admin
* Sign in using administrative credentials (default dev account: `admin@lunora.com` / `AdminPassword123`).
* Administrative accounts display a **Dashboard** link in their profile header navigation menus.

## 📦 2. Product & Inventory Control
* Navigate to **Admin** -> **Products**.
* **Create Product**:
  1. Click **Add Product**.
  2. Input product name, short and long descriptions, categorizations, pricing, original price, and stock levels.
  3. Drag and drop product images inside the Cloudinary uploader grid.
* **Gallery Reordering**: Drag and drop images to reorder. Set primary status by clicking the star icon.
* **Eviction on Delete**: Deleting a product automatically prompts the Cloudinary service API to evict all connected media assets.

## 📧 3. Email Logs Console Manager
* Navigate to **Admin** -> **Email Logs**.
* Renders a searchable, paginated ledger of all background notifications.
* Tap **Inspect** on any log to view variable payloads, SMTP relays, and error stack trace dumps.
* Click **Retry** on failed log records to trigger immediate dispatch retry runs in the background queue.
