import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * server/src/utils/catch-async.ts — Wraps async route handlers to forward promise rejections to the error handler middleware.
 */
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
