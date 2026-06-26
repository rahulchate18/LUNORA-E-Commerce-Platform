import type { Response } from "express";

/**
 * server/src/utils/api-response.ts — Formatter for successful server JSON responses.
 */
export class ApiResponse {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: any;

  constructor(res: Response, statusCode: number, data?: any, message: string = "Success") {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    
    if (data !== undefined) {
      this.data = data;
    }

    res.status(statusCode).json(this);
  }
}
