import { wrapEmailLayout } from "./layout.js";

export function getShippingUpdateTemplate(name: string, order: any, carrierName = "BlueDart Express", trackingNumber?: string): string {
  const trk = trackingNumber || `LUN-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
  const content = `
    <h1>Your Order is on the Way</h1>
    <p>Dear ${name},</p>
    <p>We are thrilled to let you know that your order <strong style="color: #D4A373;">${order.orderNumber}</strong> has left our atelier and is now in transit.</p>
    
    <div style="margin: 25px 0; background-color: #FAFAF9; border-radius: 8px; padding: 20px; border: 1px solid #E5E5E5; font-size: 13px;">
      <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #1A1A1A; margin-bottom: 12px;">Tracking Information</h3>
      <table style="font-size: 12px; color: #777777;">
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A; width: 120px;">Carrier:</td>
          <td style="padding-bottom: 6px;">${carrierName}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A;">Tracking Number:</td>
          <td style="padding-bottom: 6px; font-weight: bold; color: #D4A373;">${trk}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #1A1A1A;">Estimated Delivery:</td>
          <td>Within 3–4 business days</td>
        </tr>
      </table>
    </div>

    <p>You can track the progress of your shipment directly using the carrier's portal or check your profile dashboard for updates.</p>
    
    <div class="divider"></div>
    <p>We hope you enjoy your LUNORA purchase. If you have any shipping queries, reach out to us at <a href="mailto:support@lunora.com" style="color: #D4A373;">support@lunora.com</a>.</p>
    <p>Best regards,<br><strong>The LUNORA Delivery Team</strong></p>
  `;
  return wrapEmailLayout("Your LUNORA Order Has Shipped", content);
}
