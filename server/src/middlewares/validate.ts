import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { AnyZodObject } from "zod";
import { AppError } from "../utils/app-error.js";

/**
 * server/src/middlewares/validate.ts — Request Validator Middleware.
 * Validates req.body, req.query, or req.params against a Zod schema.
 */
interface ValidationSchema {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export const validate = (schema: ValidationSchema): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      // Validate query params
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query) as any;
      }

      // Validate route params
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params) as any;
      }

      next();
    } catch (error: any) {
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map((err: any) => `${err.path.join(".")}: ${err.message}`).join(". ");
        next(new AppError(`Validation constraints failed: ${errorMessages}`, 400));
      } else {
        next(new AppError("Failed to parse request payload parameters.", 400));
      }
    }
  };
};
