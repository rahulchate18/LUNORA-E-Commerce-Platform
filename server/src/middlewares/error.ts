import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import { logger } from "../config/logger.js";

/**
 * server/src/middlewares/error.ts — Centralized Global Error Handler Middleware
 */

function handleCastErrorDB(err: any): AppError {
  return new AppError(`Invalid value '${err.value}' for field '${err.path}'.`, 400);
}

function handleDuplicateFieldsDB(err: any): AppError {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(`Duplicate field value: '${value}' for path '${field}'. Please use another value.`, 409);
}

function handleValidationErrorDB(err: any): AppError {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  return new AppError(`Invalid inputs: ${errors.join(". ")}`, 400);
}

function handleJWTError(): AppError {
  return new AppError("Invalid authentication session. Please log in again.", 401);
}

function handleJWTExpiredError(): AppError {
  return new AppError("Your authentication session has expired. Please log in again.", 401);
}

function sendErrorDev(err: AppError | any, res: Response) {
  res.status(err.statusCode || 500).json({
    success: false,
    statusCode: err.statusCode || 500,
    status: err.status || "error",
    message: err.message,
    stack: err.stack,
    error: err,
  });
}

function sendErrorProd(err: AppError, res: Response) {
  // Operational, trusted error: send user-friendly message
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programmatic or unknown error: don't leak details to clients
    logger.error("SYSTEM_UNHANDLED_ERROR:", err);
    res.status(500).json({
      success: false,
      statusCode: 500,
      status: "error",
      message: "An unexpected error occurred. Please contact system support.",
    });
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
