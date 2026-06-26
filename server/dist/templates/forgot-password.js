import { wrapEmailLayout } from "./layout.js";
export function getForgotPasswordTemplate(name, resetUrl) {
    const content = `
    <h1>Password Reset Request</h1>
    <p>Dear ${name},</p>
    <p>We received a request to reset the password linked to your LUNORA account.</p>
    <p>Click the button below to establish a new password. For security, this link is valid for 1 hour only.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p>If the button above does not work, copy and paste the following link into your browser:</p>
    <p style="word-break: break-all; font-size: 12px; color: #777777;">${resetUrl}</p>
    <div class="divider"></div>
    <p><strong>Did not request this?</strong> If you did not make this request, you can safely ignore this email. Your current password remains active and secure.</p>
    <p>Thank you,<br><strong>LUNORA Security Desk</strong></p>
  `;
    return wrapEmailLayout("Reset Your LUNORA Password", content);
}
//# sourceMappingURL=forgot-password.js.map