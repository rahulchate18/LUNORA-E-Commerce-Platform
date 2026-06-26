import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";

/**
 * CSRF Protection Middleware for HTTP-Only cookie authenticated requests.
 * State-changing methods (POST, PATCH, PUT, DELETE) must supply a header X-CSRF-Token
 * matching the csrfToken cookie if a session cookie is present.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const method = req.method;
  const stateChangingMethods = ["POST", "PATCH", "PUT", "DELETE"];

  // 1. Skip if request is not state-changing
  if (!stateChangingMethods.includes(method)) {
    return next();
  }

  // 2. Skip if request is authenticated via Bearer token (immune to CSRF)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    return next();
  }

  // 3. If the cookie token is present, we must enforce CSRF token validation
  if (req.cookies && req.cookies.token) {
    const cookieCsrfToken = req.cookies.csrfToken;
    const headerCsrfToken = req.headers["x-csrf-token"] || req.headers["X-CSRF-Token"] || req.headers["x-csrf-token".toLowerCase()];

    if (!cookieCsrfToken) {
      return next(new AppError("CSRF cookie token is missing.", 403));
    }

    if (!headerCsrfToken) {
      return next(new AppError("X-CSRF-Token header is missing.", 403));
    }

    if (cookieCsrfToken !== headerCsrfToken) {
      return next(new AppError("CSRF verification failed: Token mismatch.", 403));
    }
  }

  next();
};
