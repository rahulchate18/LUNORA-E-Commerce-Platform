# LUNORA v1.0.0 — Security Audit Report

This report assesses the defensive architectures, cryptographic controls, rate limit configurations, and token lifecycle protections implemented within the LUNORA Premium E-Commerce platform.

---

## 🛡️ 1. Double-Submit Cookie CSRF Mitigations

Cookie-authenticated endpoints enforce dual-validation checks to protect against Cross-Site Request Forgery (CSRF) attacks:

* **Session Token**: Authenticated users receive an `HTTPOnly`, secure, `SameSite: Lax` JSON Web Token (JWT) cookie. Standard scripts cannot access this cookie.
* **CSRF Token**: Upon session establishment (login/registration), the server sets a non-HTTPOnly `csrfToken` cookie containing a cryptographically secure random token hex.
* **Dual-Validation Check**: For state-changing requests (`POST`, `PATCH`, `DELETE`, `PUT`), client-side scripts must extract the `csrfToken` cookie value and submit it in the custom `X-CSRF-Token` header.
* **Middleware Guard**: Express middleware verifies that:
  1. The session cookie is valid.
  2. The `X-CSRF-Token` header matches the `csrfToken` cookie.
  3. Rejects request with **403 Forbidden** on mismatch.
* **Bypass Rule**: Bearer token authentication (via `Authorization: Bearer <JWT>` headers) is exempt from CSRF checks, allowing secure mobile and automated administrative programmatic integrations.

---

## 🔑 2. Cryptographic Controls & Hashing

LUNORA enforces cryptographic algorithms to ensure data secrecy and block timing attacks:

* **Timing-Safe Payments Signature Verification**:
  * Razorpay payment verification calculates HMAC signatures using the active webhook key.
  * Verified signatures are compared using **`crypto.timingSafeEqual`** constant-time buffer matches.
  * This blocks execution timing side-channel leaks, preventing attackers from brute-forcing valid signatures.
* **Password Salting & Storage**:
  * Customer credentials are encrypted using `bcryptjs` with salt round **`12`**.
  * This exceeds OWASP standards for protection against offline dictionary and rainbow table attacks.
* **Hashed Token Registries**:
  * Temporary authorization tokens (e.g. `passwordResetToken`) are stored in the database as SHA-256 hashes instead of plain text, securing credentials even in the event of database disclosures.

---

## 🚫 3. Rate Limiting & API Defenses

Endpoint-specific limiters block brute-force attempts, scraper scripts, and memory-overflow DDoS vectors:

* **Global API Limiter**:
  * Restricts requests to **200 requests per 15 minutes** per IP.
  * Prevents rapid scanning and scraping tools.
* **Auth Limiter**:
  * Restricts `/auth/login` and `/auth/register` endpoints to **5 requests per 15 minutes** per IP.
  * Prevents dictionary brute-forcing of credentials.
* **Contact Form Guard**:
  * Restricts `/contact` inquiries to **5 requests per hour** per IP.
  * Blocks email spamming vectors.
* **Payload Sanitization**:
  * Express requests are validated against strict Zod schema constraints. Unrecognized body parameters are stripped to prevent parameter pollution or database injections.
