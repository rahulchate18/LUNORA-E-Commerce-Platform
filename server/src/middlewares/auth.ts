import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error.js";
import { env } from "../config/db.js";
import { catchAsync } from "../utils/catch-async.js";

// Extends Express Request type declaration
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "admin" | "user";
        email: string;
      };
    }
  }
}

interface DecodedToken {
  id: string;
  role: "admin" | "user";
  email: string;
  iat: number;
  exp: number;
}

/**
 * Authentication Guard: Extracts JWT cookie or Bearer header, validates signature, and registers user on req.user.
 */
export const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Read token from cookies (primary/recommended) or fallback to Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Access denied. Please log in to request this resource.", 401));
  }

  // 2. Verify token signature
  const decoded = await new Promise<DecodedToken>((resolve, reject) => {
    jwt.verify(token!, env.JWT_SECRET, (err, payload) => {
      if (err) return reject(err);
      resolve(payload as DecodedToken);
    });
  });

  // 3. Attach user payload. (Future logic will fetch user from Mongoose database)
  req.user = {
    id: decoded.id,
    role: decoded.role,
    email: decoded.email,
  };

  next();
});

/**
 * Authorization Guard: Restricts endpoint access to specific user roles.
 */
export const authorize = (...allowedRoles: Array<"admin" | "user">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Session context not found. Please authenticate first.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Forbidden. You do not possess privileges to perform this action.", 403));
    }

    next();
  };
};
