# LUNORA Verification Testing Guide

This document describes how to execute automated integration tests, concurrency checks, CSRF protection audits, and email templates validations against LUNORA.

---

## 🧪 1. Local Staging Test Runner

Make sure the backend Express API server is active on `http://localhost:5000` (e.g. running under `npm run dev`) before initiating integrations tests.

### A. Total Shopping Workflow Test
Validates cart operations, coupon discounts calculations, tax margins, checkout total math, and stock levels updates:
```bash
node C:/Users/rahul/.gemini/antigravity-ide/brain/35c5b98a-16df-414a-aac1-ff5d44446025/scratch/test_shopping.js
```

### B. Concurrency Checkout Lock Test
Verifies that atomic stock decrements prevent overselling under high concurrent flash-sale checkout checks:
```bash
# Cwd: server/
$env:NODE_PATH="node_modules"; node C:/Users/rahul/.gemini/antigravity-ide/brain/35c5b98a-16df-414a-aac1-ff5d44446025/scratch/test_concurrency.js
```

### C. CSRF Protection Middleware validation
Checks that state-changing requests (POST/PATCH/DELETE) reject sessions with invalid/missing tokens, returning 403 Forbidden:
```bash
node C:/Users/rahul/.gemini/antigravity-ide/brain/35c5b98a-16df-414a-aac1-ff5d44446025/scratch/test_csrf.js
```

### D. Payment Gateway Signature & Replay Defense Test
Verifies signature validation logic and blocks replay attempts using the duplicate token check:
```bash
node C:/Users/rahul/.gemini/antigravity-ide/brain/35c5b98a-16df-414a-aac1-ff5d44446025/scratch/test_payments.js
```

### E. CloudinaryDirect Stream Uploader Test
Checks Multer memory buffering, direct streaming, reordering grids, and evictions on database deletions:
```bash
# Cwd: server/
$env:NODE_PATH="node_modules"; node C:/Users/rahul/.gemini/antigravity-ide/brain/35c5b98a-16df-414a-aac1-ff5d44446025/scratch/test_uploads.js
```

### F. Nodemailer Template & PDF Generator Test
Verifies HTML email formats, background retry logs, and pdfkit invoice calculations:
```bash
cd server
node test_email.cjs
```
