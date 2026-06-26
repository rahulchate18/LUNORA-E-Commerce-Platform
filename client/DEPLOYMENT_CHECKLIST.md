# LUNORA Production Deployment Checklist

Use this checklist to verify staging before directing live traffic:

## 1. Environment & Variables (Render & Vercel)
- [ ] `NODE_ENV` is set to `production` on backend.
- [ ] `PORT` matches host listener parameters.
- [ ] `MONGO_URI` connection SRV string connects to MongoDB Atlas production cluster.
- [ ] `JWT_SECRET` is set to a secure, randomly generated 32-character string.
- [ ] `CORS_ORIGIN` matches Vercel production URL.
- [ ] `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` live mode parameters are active.
- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` point to production buckets.
- [ ] `EMAIL_PROVIDER` is set to `resend`, `smtp`, or `gmail` (not `mock` or `mailtrap`).
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` verified.
- [ ] `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_URL` mapped correctly in Vercel.

## 2. Security & Operations
- [ ] Run dry-run configuration validator `node verify_production_secrets.js` inside server and ensure all checks pass.
- [ ] Enable HTTP HTTPS redirection forces inside DNS zone registers.
- [ ] Verify rotating JSON log directory `logs/` has write access on host.
- [ ] Confirm `/api/ready` response returns status code `200` with database, SMTP, and Cloudinary all showing `ready`.
