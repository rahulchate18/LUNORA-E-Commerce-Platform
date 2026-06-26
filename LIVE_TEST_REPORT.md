# LUNORA — Live Test Report

This report documents the verification logs, integration test results, and validation checks performed to ensure that the LUNORA platform operates seamlessly under staging and live environments.

---

## 🧪 1. Core Integration Test Results

All verification suites have been executed against local staging servers and MongoDB Atlas, yielding a **100% PASS** rate. The test scripts are ready to execute against live production endpoints by updating the target environment variables.

| Script Name | Scope / Target Module | Verified Use Cases | Status |
| :--- | :--- | :--- | :---: |
| `test_auth.js` | **Authentication** | Registration inputs validation (Zod schema checking), Bcrypt password hashes matching, cookie JWT token issuances | **PASS** |
| `test_products.js` | **Product catalog** | Categories listing, dynamic slug resolutions, product searches, category filters, price ranges sliders, and sort order parameters | **PASS** |
| `test_shopping.js` | **Shopping Flow** | Add to cart, quantity updates, wishlist move-to-cart transfers, coupon discounts deductions, order placement, and cart clearance | **PASS** |
| `test_concurrency.cjs`| **Concurrency check** | Atomic Mongoose increments locking; blocks double-spending of final items, gracefully returning Zod errors | **PASS** |
| `test_csrf.js` | **CSRF Protections** | double-submit cookie validation checks, blocks request on token mismatches, allows Bearer auth bypasses | **PASS** |
| `test_payments.js` | **Razorpay gateway** | Cash on Delivery (COD) order saves, Razorpay order generations, HMAC verification signature checks, replay protections | **PASS** |
| `test_uploads.cjs` | **Cloudinary CDN** | Upload authorization guard checks (403 for standard users), memory buffers direct uploads, set primary images, deletes | **PASS** |
| `test_email.cjs` | **Email Relays** | Nodemailer HTML layouts rendering, attachments compilation (PDF invoices), background queues audits, DB mail logs saves | **PASS** |

---

## 📈 2. Deployed Integrations Verification Plan

Upon active DNS propagation on Vercel and Render, the live systems will be verified as follows:

### A. Authentication & User Profiles
* Run `node scratch/test_auth.js` pointing to `https://lunora-api.onrender.com/api/v1` to verify CORS cookie exchange limits.
* Navigate to the profile edit dashboard layout, modify name, phone coordinates, and ensure changes persist on MongoDB Atlas M0 cluster.

### B. Catalog Operations
* Run search matching for `"Pebble"` and `"Mini"` on storefront search input.
* Toggle sidebar category checkboxes and verify dynamic route hydration maps correctly without page refresh delays.

### C. Cloudinary CDN Uploader
* Log in as an administrator on the live dashboard.
* Upload a JPEG format image file on the **New Product** form uploader field.
* Verify image displays with correct aspects using dynamic `f_auto,q_auto` delivery parameters, and verify the file is saved as a secure Cloudinary resource object.

### D. Resend Notification Dispatch
* Trigger a checkout order using coupon `WELCOME200`.
* Confirm receipt of purchase confirmation HTML email containing attached invoice PDF in inbox.
* Verify email logs status is updated to `"sent"` on the **Admin Email Manager** log list page.

### E. Razorpay Sandbox Checkout
* Add items to cart, select Razorpay payment method, click submit.
* Verify standard sandbox popup authorizes payment successfully, returning the customer to `/order-success` order details page.
