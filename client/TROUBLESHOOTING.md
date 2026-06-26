# LUNORA Production Troubleshooting Manual

Use this reference to resolve common operational issues:

## ❌ Issue 1: Server Fails-Fast and Shuts Down on Boot
* **Symptom**: Container logs or Render service status lists exit code `1`.
* **Explanation**: Zod environment checks failed because a required secret is missing or has an invalid format.
* **Resolution**:
  1. Access Render parameters configuration panel.
  2. Confirm `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `EMAIL_PROVIDER` are present.
  3. Ensure `JWT_SECRET` is at least 16 characters long.

## ❌ Issue 2: Customer Checkout Rejections (Status code: 403)
* **Symptom**: Orders page or checkout button returns a 403 Forbidden error response.
* **Explanation**: Double-submit CSRF checks failed because the `X-CSRF-Token` header is missing or does not match the `csrfToken` cookie value.
* **Resolution**:
  1. Verify the frontend and backend are hosted under the same root domain namespace (or verify CORS and cookie settings allow cross-site credentials sharing).
  2. Verify that header injections are permitted in Vercel/Render configurations.
  3. Ensure cookies are sent with credentials enabled in API fetch calls.
