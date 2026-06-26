import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { logger } from "./logger.js";
dotenv.config();
// 1. Parse and extract configuration from environment
const provider = (process.env.EMAIL_PROVIDER || "mock").toLowerCase();
const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.MAIL_FROM || '"LUNORA" <support@lunora.com>';
export const mailConfig = {
    provider,
    host,
    port,
    user,
    pass,
    from,
};
let transporter = null;
const isMockMode = provider === "mock" ||
    (!host && provider !== "gmail" && provider !== "mailtrap") ||
    (provider === "smtp" && (!host || !user || !pass));
// 2. Initialize Nodemailer Transporter
if (isMockMode) {
    logger.info("Email Service: Configured in Mock Simulator Mode. Emails will be logged to console and saved locally.");
}
else {
    try {
        let transportOptions = {};
        if (provider === "gmail") {
            transportOptions = {
                service: "gmail",
                auth: {
                    user: user || process.env.SMTP_USER,
                    pass: pass || process.env.SMTP_PASS,
                },
            };
        }
        else if (provider === "mailtrap") {
            transportOptions = {
                host: host || "sandbox.smtp.mailtrap.io",
                port: port || 2525,
                auth: {
                    user: user,
                    pass: pass,
                },
            };
        }
        else {
            // Standard SMTP (e.g. Resend, custom)
            transportOptions = {
                host: host,
                port: port || 587,
                secure: port === 465, // true for 465, false for others
                auth: {
                    user: user,
                    pass: pass,
                },
            };
        }
        transporter = nodemailer.createTransport(transportOptions);
        logger.info(`Email Service: Nodemailer transporter initialized successfully using provider '${provider}'.`);
    }
    catch (err) {
        logger.error("Email Service: Failed to initialize Nodemailer transporter. Falling back to Mock Simulator.", err);
        mailConfig.provider = "mock";
    }
}
export { transporter, isMockMode };
//# sourceMappingURL=mail.js.map