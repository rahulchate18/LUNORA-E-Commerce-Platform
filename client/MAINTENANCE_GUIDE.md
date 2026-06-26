# LUNORA Technical Maintenance Guide

This document describes tasks for developers maintaining LUNORA in production.

## 📊 1. Log Rotation Audits
* The server logs backend operations dynamically into `logs/app-YYYY-MM-DD.log`.
* The rotating file system maintains daily log segments, automatically purging files past 14 days to prevent storage leaks.
* Regularly audit `logs/` for recurring status `500` HTTP reports or validation anomalies.

## 🔑 2. Secrets & Token Rotations
* **JWT Secret**: Rotate the `JWT_SECRET` key every 180 days. Note: rotating this secret instantly invalidates all active user sessions, prompting users to sign back in.
* **API Credentials**: Rotate your Razorpay key ID/secret and Cloudinary keys immediately if they are exposed in front-end client bundles or logging traces.
* **SMTP Credentials**: Update `SMTP_PASS` parameters if you change Resend/Gmail passwords.
