/**
 * lib/api-config.ts
 *
 * Centralizes the API base URL resolution to easily swap between local development
 * (http://localhost:5000/api/v1) and production hosting (e.g. on Render).
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
