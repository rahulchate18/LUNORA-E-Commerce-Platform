import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { EmailLog } from "../models/email-log.js";
import { EmailService } from "../services/email-service.js";
import { catchAsync } from "../utils/catch-async.js";
import { AppError } from "../utils/app-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { logger } from "../config/logger.js";
const router = Router();
// Protect all routes: authenticate user and authorize admin only
router.use(authenticate, authorize("admin"));
/**
 * GET /api/v1/admin/emails/logs
 * Retrieve email dispatch logs with filtration, search, and pagination.
 */
router.get("/logs", catchAsync(async (req, res) => {
    const { status, template, search, page = "1", limit = "10" } = req.query;
    const filter = {};
    if (status) {
        filter.status = status;
    }
    if (template) {
        filter.template = template;
    }
    if (search) {
        // Search by recipient email or subject
        filter.$or = [
            { recipient: { $regex: search, $options: "i" } },
            { subject: { $regex: search, $options: "i" } },
        ];
    }
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;
    const [logs, total] = await Promise.all([
        EmailLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skipNum)
            .limit(limitNum)
            .lean(),
        EmailLog.countDocuments(filter),
    ]);
    new ApiResponse(res, 200, {
        logs,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
        },
    }, "Email logs retrieved successfully.");
}));
/**
 * POST /api/v1/admin/emails/logs/:id/retry
 * Manually triggers a retry attempt for a failed email log.
 */
router.post("/logs/:id/retry", catchAsync(async (req, res) => {
    const { id } = req.params;
    logger.info(`Admin Action: Manual retry requested for email log ID: ${id}`);
    try {
        const success = await EmailService.manualRetry(id);
        if (success) {
            new ApiResponse(res, 200, null, "Email resent successfully.");
        }
        else {
            throw new AppError("Failed to resend email.", 500);
        }
    }
    catch (err) {
        throw new AppError(err.message || "Failed to resend email.", 500);
    }
}));
export default router;
//# sourceMappingURL=admin-emails.js.map