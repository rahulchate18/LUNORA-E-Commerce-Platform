# LUNORA Premium E-Commerce — Version 1.0.0 Release Notes

LUNORA is proud to announce the commercial release of **Version 1.0.0** of the e-commerce platform.

---

## 🏆 Summary of Version 1.0.0 Upgrades

1. **Security & Cryptography Hardening**:
   - Double-submit CSRF cookies protect state-changing requests.
   - timing-safe cryptographic comparisons block timings timing side-channel leaks.
   - Cryptographically hashed passwords and user password resets tokens.
2. **High-Performance Image CDNs**:
   - direct memory buffer uploads streaming to Cloudinary.
   - Virtual Mongoose getters rendering optimized sizes and compressions (`f_auto`, `q_auto`, `dpr_auto`).
3. **Failsafe notifications**:
   - Nodemailer HTML welcome, purchase notifications, and order updates.
   - Background retry log consoles variables inspectors and manual triggers.
   - PDFKit in-memory PDF invoice attachments.
4. **Reliability & DevOps Orchestrations**:
   - Zod fail-fast validations.
   - Rotating daily logs files.
   - Docker Compose containers with persistent volumes.
   - Multi-tier ready checks.
