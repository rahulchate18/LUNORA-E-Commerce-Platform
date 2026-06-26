import { wrapEmailLayout } from "./layout.js";
export function getPasswordResetSuccessTemplate(name, loginUrl) {
    const content = `
    <h1>Password Updated Successfully</h1>
    <p>Dear ${name},</p>
    <p>This is a confirmation that the password for your LUNORA account was successfully changed.</p>
    <p>You can now log in securely using your new credentials:</p>
    <div style="text-align: center;">
      <a href="${loginUrl}" class="btn">Log In to Account</a>
    </div>
    <div class="divider"></div>
    <p style="color: #EF4444; font-weight: 600;">Security Alert:</p>
    <p>If you did not authorize this change, please immediately contact our security concierge desk at <a href="mailto:security@support.lunora.com" style="color: #D4A373;">security@lunora.com</a> to lock and safeguard your account.</p>
    <p>Best regards,<br><strong>LUNORA Security Desk</strong></p>
  `;
    return wrapEmailLayout("LUNORA Password Reset Confirmation", content);
}
//# sourceMappingURL=password-reset-success.js.map