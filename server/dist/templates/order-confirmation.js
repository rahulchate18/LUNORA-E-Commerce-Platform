import { wrapEmailLayout } from "./layout.js";
export function getOrderConfirmationTemplate(name, order) {
    const itemsHtml = (order.items || []).map((item) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F5F5F4; text-align: left;">
        <span style="font-weight: 600;">${item.product?.name || "Product Item"}</span>
        <br/><span style="font-size: 11px; color: #777777;">Color: ${item.selectedColor?.name || "N/A"}</span>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F5F5F4; text-align: center; color: #777777;">${item.quantity}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F5F5F4; text-align: right; font-weight: 600;">INR ${item.price}</td>
    </tr>
  `).join("");
    const content = `
    <h1>Thank You for Your Order</h1>
    <p>Dear ${name},</p>
    <p>Your order <strong style="color: #D4A373;">${order.orderNumber}</strong> has been successfully received and is currently being processed by our atelier craftsman.</p>
    <p>A copy of your official PDF tax invoice is attached to this email for your records.</p>
    
    <div style="margin: 25px 0; background-color: #FAFAF9; border-radius: 8px; padding: 20px; border: 1px solid #E5E5E5;">
      <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #1A1A1A; margin-bottom: 12px;">Shipment Summary</h3>
      <table style="font-size: 12px; color: #777777; line-height: 1.5;">
        <tr>
          <td style="padding-bottom: 8px; font-weight: 600; width: 120px; color: #1A1A1A;">Order Number:</td>
          <td style="padding-bottom: 8px;">${order.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-weight: 600; color: #1A1A1A;">Order Date:</td>
          <td style="padding-bottom: 8px;">${new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-weight: 600; color: #1A1A1A;">Payment Method:</td>
          <td style="padding-bottom: 8px;">${order.paymentMethod || "COD"}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; vertical-align: top; color: #1A1A1A;">Ship To:</td>
          <td>
            ${order.shippingAddress?.name}<br/>
            ${order.shippingAddress?.street || ""}<br/>
            ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.postalCode || ""}
          </td>
        </tr>
      </table>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 30px 0;">
      <thead>
        <tr style="border-bottom: 2px solid #1A1A1A; color: #1A1A1A; font-weight: 700;">
          <th style="padding-bottom: 8px; text-align: left; width: 60%;">Item</th>
          <th style="padding-bottom: 8px; text-align: center; width: 15%;">Qty</th>
          <th style="padding-bottom: 8px; text-align: right; width: 25%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="width: 100%; max-width: 280px; margin-left: auto; font-size: 12px; line-height: 1.6;">
      <table style="color: #777777;">
        <tr>
          <td style="padding: 4px 0; text-align: left;">Subtotal:</td>
          <td style="padding: 4px 0; text-align: right; color: #1A1A1A;">INR ${order.subtotal}</td>
        </tr>
        ${order.discount && order.discount > 0 ? `
        <tr>
          <td style="padding: 4px 0; text-align: left;">Discount (Coupon):</td>
          <td style="padding: 4px 0; text-align: right; color: #1A1A1A;">-INR ${order.discount}</td>
        </tr>` : ""}
        <tr>
          <td style="padding: 4px 0; text-align: left;">GST Tax (18%):</td>
          <td style="padding: 4px 0; text-align: right; color: #1A1A1A;">INR ${order.taxAmount || 0}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; text-align: left;">Shipping Fee:</td>
          <td style="padding: 4px 0; text-align: right; color: #1A1A1A;">${order.deliveryCharge === 0 ? "Free" : `INR ${order.deliveryCharge}`}</td>
        </tr>
        <tr style="font-weight: 700; font-size: 14px; color: #1A1A1A; border-top: 1px solid #E5E5E5;">
          <td style="padding: 10px 0; text-align: left;">Grand Total:</td>
          <td style="padding: 10px 0; text-align: right; color: #D4A373;">INR ${order.total}</td>
        </tr>
      </table>
    </div>

    <div class="divider"></div>
    <p>We will send you a shipment confirmation email with tracking numbers once your order leaves our atelier.</p>
    <p>Thank you for choosing LUNORA,<br/><strong>The LUNORA Concierge Desk</strong></p>
  `;
    return wrapEmailLayout("LUNORA Order Confirmation", content);
}
//# sourceMappingURL=order-confirmation.js.map