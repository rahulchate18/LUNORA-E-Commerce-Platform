# LUNORA Codebase Statistics

This document summarizes the codebase metrics, file scopes, technologies used, and security controls for the **LUNORA Premium E-Commerce Platform**.

---

## 📊 1. Core Codebase Metrics

| Metric | Count | Description / Verified Scope |
| :--- | :---: | :--- |
| **Total Pages / Routes (Frontend)** | **29** | 25 static prerendered routes and 4 dynamic on-demand routes, including storefront shop grid, details layout, dashboards, and admin control panels. |
| **Total Components (React)** | **32** | Reusable components including dynamic image galleries, uploader controls, loading skeletons, cart sidebars, value propositions, and toast notifications. |
| **Total APIs (Express Backend)** | **30** | REST endpoints covering auth sessions, product catalogs, categories, cart mutations, order placement, Razorpay verification, mail checks, and log monitoring. |
| **Total Controllers** | **8** | Auth, Product, Category, Cart, Wishlist, Order, Payment, and Upload controllers. |
| **Total Services** | **6** | Cart, Wishlist, Order, Payment, Upload, and PDF Invoice services. |
| **Total Middleware** | **6** | Auth authentication check, Admin restrictions guard, double-submit CSRF cookie checks, rate limiters, global error handler, and image upload filters. |
| **Total Mongoose Models** | **6** | User, Product, Category, Order, EmailLog, and Cart models. |
| **Total Database Collections** | **6** | `users`, `products`, `categories`, `orders`, `email_logs`, and `carts`. |
| **Total Automated Tests** | **9** | Auth, Products filters, Shopping workflow, Coupon discount, Concurrency checkout, Cookie CSRF, Payments gateway, Cloudinary uploads, and Nodemailer queues. |
| **Total Security Features** | **8** | Double-submit CSRF cookies, constant-time signature comparisons, Bcrypt hashing, Zod schema constraints, hashed token storage, rate limiters, trust proxy config, and secure HTTP headers. |

---

## 🛠️ 2. Technologies Used

* **Frontend Architecture**:
  * **Framework**: Next.js 16.2.9 (using Turbopack for compilation and static routing optimization).
  * **Library**: React 19.2.4 (decoupled state hooks and custom layouts).
  * **Language**: TypeScript 5.x (strict type checking across all client modules).
  * **Animation & Styling**: Tailwind CSS, Framer Motion (for smooth micro-animations on interactive components).
  * **Forms**: React Hook Form with Zod validation adapters.
* **Backend Architecture**:
  * **Server**: Node.js & Express (configured behind reverse proxies).
  * **Database**: MongoDB & Mongoose (hosted on MongoDB Atlas multi-region clusters).
  * **Language**: TypeScript 5.7.2 (compiled to ES Modules).
* **Integrations**:
  * **CDN**: Cloudinary API (streaming memory buffers directly without local disk writes).
  * **Payments**: Razorpay (standard sandbox configuration).
  * **Notifications**: Nodemailer (Relay SMTP mode with background queue recovery logging).
  * **Documents**: PDFKit (in-memory compiler generating invoice PDFs).
* **DevOps**:
  * **Containerization**: Docker (multi-stage non-root containers) and Docker Compose.
  * **CI/CD**: GitHub Actions (clean TS checks and linting pipelines).
