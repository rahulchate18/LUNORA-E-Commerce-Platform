import { wrapEmailLayout } from "./layout.js";

export function getAdminNewOrderTemplate(order: any): string {
  const itemsHtml = (order.items || []).map((item: any) => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #F5F5F4; text-align: left;">
        <span style="font-weight: bold;">${item.product?.name || "Product Item"}</span>
        <br/><span style="font-size: 11px; color: #777777;">Color: ${item.selectedColor?.name || "N/A"}</span>
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #F5F5F4; text-align: center; color: #777777;">${item.quantity}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #F5F5F4; text-align: right;">INR ${item.price}</td>
    </tr>
  `).join("");

  const content = `
    <h1>New Order Received</h1>
    <p>A new order has been successfully placed by a customer on LUNORA.</p>
    
    <div style="margin: 25px 0; background-color: #FAFAF9; border-radius: 8px; padding: 20px; border: 1px solid #E5E5E5; font-size: 13px;">
      <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #1A1A1A; margin-bottom: 12px;">Order Summary</h3>
      <table style="font-size: 12px; color: #777777;">
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A; width: 120px;">Order Number:</td>
          <td style="padding-bottom: 6px;">${order.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A;">Grand Total:</td>
          <td style="padding-bottom: 6px; font-weight: bold; color: #D4A373;">INR ${order.total}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A;">Payment Method:</td>
          <td style="padding-bottom: 6px;">${order.paymentMethod || "COD"}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #1A1A1A;">Customer:</td>
          <td>
            ${order.shippingAddress?.name}<br/>
            Email: ${order.user?.email || "Registered customer"}
          </td>
        </tr>
      </table>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 25px 0;">
      <thead>
        <tr style="border-bottom: 1px solid #1A1A1A; color: #1A1A1A; font-weight: bold;">
          <th style="padding-bottom: 6px; text-align: left; width: 60%;">Item</th>
          <th style="padding-bottom: 6px; text-align: center; width: 15%;">Qty</th>
          <th style="padding-bottom: 6px; text-align: right; width: 25%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:3000/admin/orders" class="btn">View Orders Queue</a>
    </div>

    <div class="divider"></div>
    <p>Please initiate atelier dispatch preparations for order shipment packaging.</p>
    <p>Thank you,<br><strong>LUNORA System Router</strong></p>
  `;
  return wrapEmailLayout("Admin Alert: New Order Placed", content);
}
