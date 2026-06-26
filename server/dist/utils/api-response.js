/**
 * server/src/utils/api-response.ts — Formatter for successful server JSON responses.
 */
export class ApiResponse {
    success;
    statusCode;
    message;
    data;
    constructor(res, statusCode, data, message = "Success") {
        this.success = true;
        this.statusCode = statusCode;
        this.message = message;
        if (data !== undefined) {
            this.data = data;
        }
        res.status(statusCode).json(this);
    }
}
//# sourceMappingURL=api-response.js.map