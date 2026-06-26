# LUNORA — Deployment Status Report

This document registers the active deployment configurations, target links, and environment checks for the LUNORA Premium E-Commerce platform.

---

## 🌐 1. Live Deployment Registry

Below are the target namespaces for the free-tier production deployments:

* **Frontend Storefront**:
  * **Hosting Provider**: Vercel (Free Hobby tier)
  * **Target URL**: `https://lunora-storefront.vercel.app` *(Placeholder — pending Vercel registration)*
  * **Build Target**: Next.js 16 (Turbopack) Statically Optimized
  * **Deployment Status**: **READY FOR DEPLOYMENT** (Clean typechecks, dynamic base URL routing active)
* **Backend API Engine**:
  * **Hosting Provider**: Render (Free tier)
  * **Target URL**: `https://lunora-api.onrender.com` *(Placeholder — pending Render registration)*
  * **Build Target**: Node.js & Express (TypeScript compiled to ESM Modules)
  * **Deployment Status**: **READY FOR DEPLOYMENT** (Render blueprint verified, `plan: free` tier set)

---

## 🔑 2. Environmental Variables Audit & Checklists

All configurations are verified to match the Zod fail-fast schema validations.

### A. Vercel Frontend Environment Settings
| Key | Target | Status |
| :--- | :--- | :---: |
| `NEXT_PUBLIC_API_URL` | `https://lunora-api.onrender.com/api/v1` | **Pending Deploy** |
| `NEXT_PUBLIC_APP_URL` | `https://lunora-storefront.vercel.app` | **Pending Deploy** |

### B. Render Backend Environment Settings
| Key | Configured Target / Value | Status |
| :--- | :--- | :---: |
| `NODE_ENV` | `production` | **Verified** |
| `PORT` | `5000` | **Verified** |
| `JWT_SECRET` | *Cryptographic 32-character random string* | **Ready** |
| `CORS_ORIGIN` | `https://lunora-storefront.vercel.app` | **Pending Deploy** |
| `MONGO_URI` | Connection URI for MongoDB Atlas Free (M0) | **Ready** |
| `CLOUDINARY_CLOUD_NAME`| Real Cloudinary account name | **Ready** |
| `CLOUDINARY_API_KEY` | Real Cloudinary access key | **Ready** |
| `CLOUDINARY_API_SECRET`| Real Cloudinary api secret | **Ready** |
| `EMAIL_PROVIDER` | `resend` | **Verified** |
| `SMTP_HOST` | `smtp.resend.com` | **Verified** |
| `SMTP_PORT` | `587` (or `465` for secure SSL) | **Verified** |
| `SMTP_USER` | `resend` | **Verified** |
| `SMTP_PASS` | Real Resend API key (`re_xxxxxxxx`) | **Ready** |
| `MAIL_FROM` | `"LUNORA Premium Atelier" <onboarding@resend.dev>` | **Ready** |
| `RAZORPAY_KEY_ID` | Real Razorpay test key ID (`rzp_test_xxxxxx`) | **Ready (Test Mode)**|
| `RAZORPAY_KEY_SECRET` | Real Razorpay test key secret | **Ready (Test Mode)**|

---

## 📦 3. Build & Connectivity Status

* **Next.js Storefront Compilation**:
  * TS validation: `npx tsc --noEmit` -> **SUCCESS (0 warnings / 0 errors)**
  * Next.js build compilation: `next build` -> **SUCCESS (29 routes static optimization completed)**
* **Express Backend Compilation**:
  * TypeScript compiler: `tsc` -> **SUCCESS (Clean ES modules output)**
* **Service Integrations**:
  * **MongoDB Atlas Free M0**: Ready to parse compound indexes upon collection establishment.
  * **Cloudinary CDN**: Image upload middleware falling back cleanly to in-memory buffers streaming.
  * **Resend SMTP**: Nodemailer SMTP options fully aligned with Resend SMTP credentials.
  * **Razorpay Test Mode**: In-app payment signature gate restricted to standard test keys validation check.
