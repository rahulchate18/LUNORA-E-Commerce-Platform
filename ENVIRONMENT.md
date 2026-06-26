# LUNORA Environment Variables Reference

This document catalogs and explains the configurations and secrets required to operate **LUNORA** in both local development and production modes.

---

## 🎨 1. Frontend Environment Variables

Configure these variables inside your Next.js project on Vercel:

| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | `https://lunora.com` | Base storefront URL. Used for generating dynamic canonical alternate URLs. |
| `NEXT_PUBLIC_API_URL` | `https://api.lunora.com/api/v1` | Backend API root URL. Used by client fetch calls. |

---

## 🚀 2. Backend Environment Variables

Configure these variables inside your API server parameters on Render or Railway:

### System Config
* `PORT`: Port the Express server listens to (defaults to `5000` locally, Render binds dynamically).
* `NODE_ENV`: Operational execution environment (`development`, `production`, `test`). Setting this to `production` enables strict fail-fast validation checks.
* `CORS_ORIGIN`: Whitelisted client origin domain. Requests from other domains will be rejected by CORS middleware (e.g. `https://lunora.com`).

### Database & Session Security
* `MONGO_URI`: The connection connection string mapping to your MongoDB database (Atlas cluster string or local host URI).
* `JWT_SECRET`: A secure, random cryptographic string (Minimum 16 characters long) used to verify session token authenticity.
* `JWT_EXPIRES_IN`: Expiry duration for token authentication cookies (defaults to `7d`).

### Razorpay Payments Gateway
* `RAZORPAY_KEY_ID`: Your Razorpay client public credential key. Switch to production keys (starting with `rzp_live_`) when deploying live.
* `RAZORPAY_KEY_SECRET`: Your Razorpay client cryptographic secret key.

### Cloudinary CDN Storage
* `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud registry name.
* `CLOUDINARY_API_KEY`: Cloudinary API public access key.
* `CLOUDINARY_API_SECRET`: Cloudinary API secret signature key.

### SMTP Email Service
* `EMAIL_PROVIDER`: Defines dispatch relay. Supported values are:
  * `mock`: Outputs templates and PDF invoices to local scratch files. **Blocked in production mode**.
  * `gmail`: Relays mail through Google Gmail SMTP.
  * `mailtrap`: Used to safely verify templates delivery in development.
  * `smtp` / `resend`: Production SMTP mail servers.
* `SMTP_HOST`: Mail relay server address (e.g. `smtp.resend.com`).
* `SMTP_PORT`: Mail relay port (usually `587` or `465` for SSL).
* `SMTP_USER`: SMTP authenticated username.
* `SMTP_PASS`: SMTP authenticated password.
* `MAIL_FROM`: Verified email header sender name (e.g. `"LUNORA" <support@lunora.com>`).
* `ADMIN_NOTIFICATION_EMAIL`: Target email where copies of orders and contact inquiries are sent.

---

## 🛡️ 3. Environment Fail-Safe Validation

To prevent runtime failures (such as a customer checkout succeeding but the email confirmation or payment verify failing due to missing keys), LUNORA runs a strict **fail-fast Zod validation** during backend boot time:

* If `NODE_ENV` is set to `production`, the server will check for:
  1. Real non-mock Razorpay keys (`rzp_live_...`).
  2. Real Cloudinary details (replaces sandbox credentials).
  3. Non-mock email configuration, requiring host, user, and password parameters.
* **If any variable is missing or invalid, the Node.js process terminates immediately with exit code 1**, preventing the server from starting up in a misconfigured state.
