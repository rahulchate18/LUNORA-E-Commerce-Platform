import { Router } from "express";
import rateLimit from "express-rate-limit";
import { EmailService } from "../services/email-service.js";
import { catchAsync } from "../utils/catch-async.js";
import { AppError } from "../utils/app-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { logger } from "../config/logger.js";
const contactRouter = Router();
// Rate limiter: 5 requests per hour per IP
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: "Too many contact form inquiries. Please try again after an hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Helper to check for header injection (e.g., carriage return / line feed in email header inputs)
const checkHeaderInjection = (str) => {
    return /[\r\n]/.test(str);
};
contactRouter.post("/", contactLimiter, catchAsync(async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        throw new AppError("All fields (name, email, subject, message) are required.", 400);
    }
    // Input sanitization / injection checks
    if (checkHeaderInjection(name) ||
        checkHeaderInjection(email) ||
        checkHeaderInjection(subject)) {
        logger.warn(`Security Warning: Header injection attempt detected in contact form from IP ${req.ip}`);
        throw new AppError("Invalid input content detected.", 400);
    }
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new AppError("Invalid email address format.", 400);
    }
    logger.info(`Contact Form: Received support inquiry from ${name} <${email}> regarding: ${subject}`);
    // Send contact form email in the background (non-blocking)
    EmailService.sendContactFormInquiry(name, email, subject, message).catch((err) => {
        logger.error("Failed to process background contact form notification email:", err);
    });
    new ApiResponse(res, 200, null, "Your inquiry has been submitted successfully. Our team will contact you shortly.");
}));
export default contactRouter;
//# sourceMappingURL=contact.js.map