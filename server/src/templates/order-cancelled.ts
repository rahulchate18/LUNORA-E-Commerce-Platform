import { wrapEmailLayout } from "./layout.js";

export function getOrderCancelledTemplate(name: string, order: any): string {
  const content = `
    <h1>Order Cancelled</h1>
    <p>Dear ${name},</p>
    <p>We are writing to confirm that your order <strong style="color: #D4A373;">${order.orderNumber}</strong> has been cancelled.</p>
    
    <div style="margin: 25px 0; background-color: #FAFAF9; border-radius: 8px; padding: 20px; border: 1px solid #E5E5E5; font-size: 13px;">
      <p style="margin-top: 0; font-weight: bold; color: #1A1A1A;">Cancellation Details:</p>
      <table style="font-size: 12px; color: #777777;">
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A; width: 120px;">Order Number:</td>
          <td style="padding-bottom: 6px;">${order.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A;">Refund Amount:</td>
          <td style="padding-bottom: 6px; font-weight: bold; color: #D4A373;">INR ${order.total}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #1A1A1A;">Refund Destination:</td>
          <td>Original payment source (${order.paymentMethod === "COD" ? "Not applicable - COD order" : "Refund processed via gateway"})</td>
        </tr>
      </table>
    </div>

    <p><strong>When will I receive my refund?</strong></p>
    <p>For prepaid orders, the refund has been initiated immediately. It typically takes 5–7 business days to reflect in your bank account or credit card statement, depending on your financial institution.</p>
    
    <div class="divider"></div>
    <p>If you did not request this cancellation or believe this was an error, please get in touch with our concierge team immediately at <a href="mailto:support@lunora.com" style="color: #D4A373;">support@lunora.com</a>.</p>
    <p>Best regards,<br><strong>LUNORA Concierge Desk</strong></p>
  `;
  return wrapEmailLayout("LUNORA Order Cancellation", content);
}
