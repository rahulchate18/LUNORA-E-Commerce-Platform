import { wrapEmailLayout } from "./layout.js";
export function getDeliveryConfirmationTemplate(name, order) {
    const content = `
    <h1>Order Delivered Successfully</h1>
    <p>Dear ${name},</p>
    <p>We are pleased to confirm that your order <strong style="color: #D4A373;">${order.orderNumber}</strong> has been successfully delivered to your shipping address.</p>
    <p>For your records, we have attached your official PDF tax invoice to this email.</p>

    <div style="margin: 25px 0; background-color: #FAFAF9; border-radius: 8px; padding: 20px; border: 1px solid #E5E5E5; font-size: 13px;">
      <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #1A1A1A; margin-bottom: 12px;">Delivery Details</h3>
      <table style="font-size: 12px; color: #777777;">
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A; width: 120px;">Order Number:</td>
          <td style="padding-bottom: 6px;">${order.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A;">Delivered To:</td>
          <td style="padding-bottom: 6px;">
            ${order.shippingAddress?.name}<br/>
            ${order.shippingAddress?.street || ""}, ${order.shippingAddress?.city || ""}
          </td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #1A1A1A;">Delivery Time:</td>
          <td>${new Date().toLocaleDateString("en-IN")}</td>
        </tr>
      </table>
    </div>

    <p>We would love to hear about your experience. How do you like the material, details, and stitching? Share your feedback with us or leave a review on our shop listing.</p>
    
    <div class="divider"></div>
    <p>If you have any questions, or if you did not receive this delivery, please reach out to us immediately at <a href="mailto:support@lunora.com" style="color: #D4A373;">support@lunora.com</a>.</p>
    <p>Warmest regards,<br><strong>The LUNORA Concierge Desk</strong></p>
  `;
    return wrapEmailLayout("LUNORA Order Delivered", content);
}
//# sourceMappingURL=delivery.js.map