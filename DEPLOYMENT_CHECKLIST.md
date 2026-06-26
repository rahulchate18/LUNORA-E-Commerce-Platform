# LUNORA — Production Deployment & Client Handover Checklist

This document provides the step-by-step checklist for live deployment, credentials setup, and the remaining commercial tasks required before delivering LUNORA to a paying client.

---

## 🚀 1. Live Deployment Steps Checklist

Use this list to verify all services are active and properly linked:

### A. Database (MongoDB Atlas M0 Free Tier)
- [ ] Create a MongoDB Atlas cluster (M0 Free Tier is sufficient for staging/launch).
- [ ] Configure database access rules (create database user, secure strong password).
- [ ] Add network access IP rules (whitelist Render backend IP or set `0.0.0.0/0` for dynamic hosting).
- [ ] Run seed script (`npm run seed --prefix server`) to populate product collections.

### B. Backend (Render Free Tier)
- [ ] Register new web service pointing to your GitHub repository root, set `rootDir: server`.
- [ ] Configure plan to **Free** (or Starter to prevent spin-up sleep delays).
- [ ] Set all environment variables (including Atlas MONGO_URI, JWT_SECRET, CORS_ORIGIN, and Cloudinary/Resend credentials).
- [ ] Confirm `/api/health` and `/api/ready` return `200 OK` status.

### C. Frontend (Vercel Hobby Tier)
- [ ] Import project repository in Vercel dashboard.
- [ ] Configure build commands: build command = `npm run build:frontend`, install command = `npm install`.
- [ ] Set environment variables: `NEXT_PUBLIC_API_URL` pointing to Render backend API.
- [ ] Deploy and verify the live storefront loads statically.

### D. Image Hosting (Cloudinary Free Tier)
- [ ] Create Cloudinary account.
- [ ] Copy Cloud Name, API Key, and API Secret, and insert them into Render environment settings.
- [ ] Run a test upload via the live admin dashboard to verify buffer streaming is active.

### E. Email Dispatch (Resend Free Tier)
- [ ] Register a free account on Resend.
- [ ] Retrieve API key, set `SMTP_PASS` in Render to match key value.
- [ ] Configure SMTP parameters: `SMTP_HOST=smtp.resend.com`, `SMTP_PORT=587`, `SMTP_USER=resend`, `EMAIL_PROVIDER=resend`.
- [ ] Register a verified domain on Resend (recommended) or utilize default `onboarding@resend.dev` sender for testing.

---

## 🏁 2. Remaining Steps Before Client Handover

To transition LUNORA from a staging sandbox into a commercial store, the following actions must be executed:

### 1. Payment Gateway Activation (Razorpay Live Mode)
- [ ] Switch Razorpay dashboard to **Live Mode**.
- [ ] Provide business verification details and KYC documents to Razorpay.
- [ ] Generate Live API keys (`rzp_live_xxxxxxxx`) and replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in production Render environment settings.
- [ ] Set up Razorpay live webhooks for automated order fulfillment (if utilizing webhooks).

### 2. Custom Domain Mappings
- [ ] Purchase custom brand domain name (e.g. `lunorafineleather.com`).
- [ ] Map custom domain names to Vercel DNS CNAME parameters.
- [ ] Map custom subdomains (e.g. `api.lunorafineleather.com`) to Render service parameters.
- [ ] Update CORS_ORIGIN in Render backend to allow the custom brand domain.

### 3. Email Whitelisting & DKIM Configuration
- [ ] Add MX, SPF, and DKIM text records to the brand domain registrar settings to verify the sender coordinates on Resend.
- [ ] Replace `MAIL_FROM` in Render variables with the brand address: `"LUNORA Fine Leather" <orders@lunorafineleather.com>`.

### 4. Database Security & Backups
- [ ] Elevate database user passwords and lock network access whitelists to the Render backend service outbound IP addresses range.
- [ ] Enable MongoDB Atlas automated daily backups and point them to secure storage buckets.

### 5. Hosting Scale-Up
- [ ] Scale the Render backend service from "Free" tier to **Starter ($7/mo)** or **Scale ($20/mo)** to prevent spin-up sleep delays (Render Free tier sleeps after 15 minutes of inactivity, causing a 50-second latency spike on the first subsequent API request).
