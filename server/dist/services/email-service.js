import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { transporter, mailConfig, isMockMode } from "../config/mail.js";
import { EmailLog } from "../models/email-log.js";
import { InvoiceService } from "./invoice-service.js";
import { logger } from "../config/logger.js";
// Templates imports
import { getWelcomeTemplate } from "../templates/welcome.js";
import { getForgotPasswordTemplate } from "../templates/forgot-password.js";
import { getPasswordResetSuccessTemplate } from "../templates/password-reset-success.js";
import { getOrderConfirmationTemplate } from "../templates/order-confirmation.js";
import { getOrderCancelledTemplate } from "../templates/order-cancelled.js";
import { getShippingUpdateTemplate } from "../templates/shipping-update.js";
import { getDeliveryConfirmationTemplate } from "../templates/delivery.js";
import { getContactFormTemplate } from "../templates/contact.js";
import { getAdminNewOrderTemplate } from "../templates/admin-new-order.js";
// ES modules workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class EmailService {
    static isQueueRunning = false;
    /**
     * Initialize background retry checker (runs every 1 minute)
     */
    static initBackgroundQueue() {
        if (this.isQueueRunning)
            return;
        this.isQueueRunning = true;
        // Check every 30 seconds for testing responsiveness
        setInterval(async () => {
            try {
                await this.processFailedEmails();
            }
            catch (err) {
                logger.error("Email Service Queue: Failed to run background processing cycle:", err);
            }
        }, 30 * 1000);
        logger.info("Email Service Queue: Background retry monitor initialized successfully.");
    }
    /**
     * core mail dispatcher (handles db logging, mock execution, attachments, and retry enrollment)
     */
    static async sendMail(options) {
        const { to, subject, template, html, variables, attachments = [] } = options;
        // 1. Create a pending EmailLog record in MongoDB
        const log = await EmailLog.create({
            recipient: to,
            subject,
            template,
            variables,
            provider: mailConfig.provider,
            status: "pending",
        });
        if (isMockMode) {
            // 2. Mock Simulator Fallback Mode
            try {
                const scratchDir = path.resolve(__dirname, "../../../scratch/emails");
                if (!fs.existsSync(scratchDir)) {
                    fs.mkdirSync(scratchDir, { recursive: true });
                }
                const timestamp = Date.now();
                // Save HTML template
                const htmlPath = path.join(scratchDir, `email_${timestamp}_${template}.html`);
                fs.writeFileSync(htmlPath, html);
                // Save PDF Invoice if attached
                if (attachments.length > 0) {
                    attachments.forEach((att) => {
                        const pdfPath = path.join(scratchDir, `invoice_${timestamp}_${att.filename}`);
                        fs.writeFileSync(pdfPath, att.content);
                        logger.info(`Email Service (Mock Mode): Saved attachment locally to: ${pdfPath}`);
                    });
                }
                logger.info(`[MOCK EMAIL SENT]
  To: ${to}
  Subject: ${subject}
  Template: ${template}
  Mock Log File: ${htmlPath}`);
                // Update log as sent
                log.status = "sent";
                log.sentAt = new Date();
                await log.save();
                return true;
            }
            catch (err) {
                logger.error("Email Service (Mock Mode): Failed to write mock email logs:", err);
                log.status = "failed";
                log.error = err.message;
                await log.save();
                return false;
            }
        }
        // 3. Real SMTP Transport Mode
        try {
            if (!transporter) {
                throw new Error("SMTP transporter is not initialized.");
            }
            const mailOptions = {
                from: mailConfig.from,
                to,
                subject,
                html,
                attachments: attachments.map((att) => ({
                    filename: att.filename,
                    content: att.content,
                    contentType: att.contentType || "application/pdf",
                })),
            };
            await transporter.sendMail(mailOptions);
            logger.info(`Email Service: Successfully sent email '${subject}' to <${to}>.`);
            log.status = "sent";
            log.sentAt = new Date();
            await log.save();
            return true;
        }
        catch (err) {
            logger.error(`Email Service: Failed sending email '${subject}' to <${to}>:`, err);
            log.status = "failed";
            log.error = err.message;
            await log.save();
            // Asynchronously trigger retry queue immediately
            this.retryEmailAsync(log.id).catch((e) => logger.error("Async retry queue failure:", e));
            return false;
        }
    }
    /**
     * Asynchronous non-blocking retry helper for single log
     */
    static async retryEmailAsync(logId) {
        // Wrap retry inside a background process
        setImmediate(async () => {
            try {
                const log = await EmailLog.findById(logId);
                if (log && log.status === "failed" && log.attempts < 3) {
                    logger.info(`Email Service: Scheduling automated retry for log ID: ${logId}`);
                    await this.attemptSend(log);
                }
            }
            catch (err) {
                logger.error(`Failed executing background retry on log ${logId}:`, err);
            }
        });
    }
    /**
     * Renders the template HTML and dispatches the send request based on the logged variables.
     */
    static async attemptSend(log) {
        log.attempts += 1;
        log.status = "pending";
        await log.save();
        try {
            let html = "";
            const vars = log.variables || {};
            let attachments = [];
            // Re-render HTML based on template ID
            switch (log.template) {
                case "welcome":
                    html = getWelcomeTemplate(vars.name, vars.loginUrl);
                    break;
                case "forgot-password":
                    html = getForgotPasswordTemplate(vars.name, vars.resetUrl);
                    break;
                case "password-reset-success":
                    html = getPasswordResetSuccessTemplate(vars.name, vars.loginUrl);
                    break;
                case "order-confirmation":
                    html = getOrderConfirmationTemplate(vars.name, vars.order);
                    const confirmInvoice = await InvoiceService.generateInvoicePdfBuffer(vars.order);
                    attachments.push({ filename: `invoice_${vars.order.orderNumber}.pdf`, content: confirmInvoice });
                    break;
                case "order-cancelled":
                    html = getOrderCancelledTemplate(vars.name, vars.order);
                    break;
                case "shipping-update":
                    html = getShippingUpdateTemplate(vars.name, vars.order, vars.carrierName, vars.trackingNumber);
                    break;
                case "delivery":
                    html = getDeliveryConfirmationTemplate(vars.name, vars.order);
                    const deliveryInvoice = await InvoiceService.generateInvoicePdfBuffer(vars.order);
                    attachments.push({ filename: `invoice_${vars.order.orderNumber}.pdf`, content: deliveryInvoice });
                    break;
                case "contact":
                    html = getContactFormTemplate(vars.name, vars.email, vars.subject, vars.message);
                    break;
                case "admin-new-order":
                    html = getAdminNewOrderTemplate(vars.order);
                    break;
                default:
                    throw new Error(`Unknown email template identifier: ${log.template}`);
            }
            if (isMockMode) {
                // Just resolve mock success
                log.status = "sent";
                log.sentAt = new Date();
                await log.save();
                logger.info(`Email Service Queue: Retry succeeded (Mock) for log ID: ${log.id}`);
                return true;
            }
            if (!transporter)
                throw new Error("Transporter is missing.");
            const mailOptions = {
                from: mailConfig.from,
                to: log.recipient,
                subject: log.subject,
                html,
                attachments: attachments.map((att) => ({
                    filename: att.filename,
                    content: att.content,
                    contentType: "application/pdf",
                })),
            };
            await transporter.sendMail(mailOptions);
            log.status = "sent";
            log.sentAt = new Date();
            await log.save();
            logger.info(`Email Service Queue: Retry succeeded (SMTP) for log ID: ${log.id}`);
            return true;
        }
        catch (err) {
            log.status = "failed";
            log.error = err.message;
            await log.save();
            logger.warn(`Email Service Queue: Retry attempt ${log.attempts} failed for log ID: ${log.id}. Error: ${err.message}`);
            return false;
        }
    }
    /**
     * Process all pending retries (runs periodically)
     */
    static async processFailedEmails() {
        const failedLogs = await EmailLog.find({
            status: "failed",
            attempts: { $lt: 3 },
        });
        if (failedLogs.length === 0)
            return;
        logger.info(`Email Service Queue: Processing ${failedLogs.length} failed logs for retry...`);
        // Process sequentially to avoid resource exhaustion
        for (const log of failedLogs) {
            await this.attemptSend(log);
        }
    }
    /**
     * Manually triggers a retry attempt for a specific log item (Admin feature)
     */
    static async manualRetry(logId) {
        const log = await EmailLog.findById(logId);
        if (!log)
            throw new Error("Email log not found.");
        return this.attemptSend(log);
    }
    // ─── Core Email Senders ────────────────────────────────────────────────────
    static async sendWelcome(to, name) {
        const loginUrl = `${process.env.CORS_ORIGIN || "http://localhost:3000"}/login`;
        const html = getWelcomeTemplate(name, loginUrl);
        return this.sendMail({
            to,
            subject: "Welcome to LUNORA Premium Atelier",
            template: "welcome",
            html,
            variables: { name, loginUrl },
        });
    }
    static async sendForgotPassword(to, name, token) {
        const resetUrl = `${process.env.CORS_ORIGIN || "http://localhost:3000"}/reset-password?token=${token}`;
        const html = getForgotPasswordTemplate(name, resetUrl);
        return this.sendMail({
            to,
            subject: "LUNORA Password Reset Request",
            template: "forgot-password",
            html,
            variables: { name, resetUrl },
        });
    }
    static async sendPasswordResetSuccess(to, name) {
        const loginUrl = `${process.env.CORS_ORIGIN || "http://localhost:3000"}/login`;
        const html = getPasswordResetSuccessTemplate(name, loginUrl);
        return this.sendMail({
            to,
            subject: "LUNORA Password Updated Successfully",
            template: "password-reset-success",
            html,
            variables: { name, loginUrl },
        });
    }
    static async sendOrderConfirmation(to, name, order) {
        const html = getOrderConfirmationTemplate(name, order);
        try {
            const invoiceBuffer = await InvoiceService.generateInvoicePdfBuffer(order);
            return this.sendMail({
                to,
                subject: `LUNORA Purchase Confirmation - ${order.orderNumber}`,
                template: "order-confirmation",
                html,
                variables: { name, order },
                attachments: [
                    {
                        filename: `invoice_${order.orderNumber}.pdf`,
                        content: invoiceBuffer,
                    },
                ],
            });
        }
        catch (err) {
            logger.error("Failed to generate PDF for order confirmation email, sending without invoice.", err);
            // Fallback: send without attachment
            return this.sendMail({
                to,
                subject: `LUNORA Purchase Confirmation - ${order.orderNumber}`,
                template: "order-confirmation",
                html,
                variables: { name, order },
            });
        }
    }
    static async sendOrderCancelled(to, name, order) {
        const html = getOrderCancelledTemplate(name, order);
        return this.sendMail({
            to,
            subject: `LUNORA Order Cancellation - ${order.orderNumber}`,
            template: "order-cancelled",
            html,
            variables: { name, order },
        });
    }
    static async sendShippingUpdate(to, name, order, carrierName, trackingNumber) {
        const html = getShippingUpdateTemplate(name, order, carrierName, trackingNumber);
        return this.sendMail({
            to,
            subject: `LUNORA Shipment Update - ${order.orderNumber}`,
            template: "shipping-update",
            html,
            variables: { name, order, carrierName, trackingNumber },
        });
    }
    static async sendDeliveryConfirmation(to, name, order) {
        const html = getDeliveryConfirmationTemplate(name, order);
        try {
            const invoiceBuffer = await InvoiceService.generateInvoicePdfBuffer(order);
            return this.sendMail({
                to,
                subject: `LUNORA Shipment Delivered - ${order.orderNumber}`,
                template: "delivery",
                html,
                variables: { name, order },
                attachments: [
                    {
                        filename: `invoice_${order.orderNumber}.pdf`,
                        content: invoiceBuffer,
                    },
                ],
            });
        }
        catch (err) {
            logger.error("Failed to generate PDF for delivery confirmation email, sending without invoice.", err);
            return this.sendMail({
                to,
                subject: `LUNORA Shipment Delivered - ${order.orderNumber}`,
                template: "delivery",
                html,
                variables: { name, order },
            });
        }
    }
    static async sendContactFormInquiry(name, email, subject, message) {
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@lunora.com";
        const html = getContactFormTemplate(name, email, subject, message);
        return this.sendMail({
            to: adminEmail,
            subject: `[Contact Inquiry] ${subject}`,
            template: "contact",
            html,
            variables: { name, email, subject, message },
        });
    }
    static async sendAdminNewOrder(order) {
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@lunora.com";
        const html = getAdminNewOrderTemplate(order);
        return this.sendMail({
            to: adminEmail,
            subject: `[Admin Alert] New Order placed: ${order.orderNumber}`,
            template: "admin-new-order",
            html,
            variables: { order },
        });
    }
}
//# sourceMappingURL=email-service.js.map