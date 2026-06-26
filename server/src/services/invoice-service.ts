import PDFDocument from "pdfkit";

// Simple manual price formatter helper in case import is not present
function formatINR(amount: number): string {
  return `INR ${amount.toFixed(2)}`;
}

export class InvoiceService {
  /**
   * Generates a luxury minimal PDF invoice for the given order in-memory as a Buffer.
   */
  static async generateInvoicePdfBuffer(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const buffers: Buffer[] = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));

        // Colors
        const primaryColor = "#1A1A1A"; // Charcoal
        const accentColor = "#D4A373";  // Gold
        const lightGray = "#777777";
        const borderColor = "#E5E5E5";

        // 1. BRANDING HEADER
        doc
          .fillColor(primaryColor)
          .font("Helvetica-Bold")
          .fontSize(24)
          .text("L U N O R A", 50, 50)
          .fontSize(9)
          .font("Helvetica")
          .fillColor(accentColor)
          .text("PREMIUM ATELIER", 50, 78)
          .moveDown();

        // 2. INVOICE META
        doc
          .fillColor(primaryColor)
          .font("Helvetica-Bold")
          .fontSize(16)
          .text("INVOICE", 400, 50, { align: "right" })
          .font("Helvetica")
          .fontSize(9)
          .fillColor(lightGray)
          .text(`Invoice No: INV-${order.orderNumber || order._id}`, 400, 70, { align: "right" })
          .text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN")}`, 400, 82, { align: "right" })
          .moveDown();

        // Horizontal line separator
        doc.strokeColor(borderColor).lineWidth(1).moveTo(50, 105).lineTo(545, 105).stroke();

        // 3. COMPANY & CUSTOMER INFO BLOCK
        doc
          .fillColor(primaryColor)
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("Seller Details", 50, 120)
          .font("Helvetica")
          .fontSize(9)
          .fillColor(lightGray)
          .text("LUNORA Premium E-Commerce", 50, 135)
          .text("104, Elite Boulevard, Indiranagar", 50, 147)
          .text("Bengaluru, KA - 560038, India", 50, 159)
          .text("GSTIN: 29AAAAA1111A1Z1", 50, 171)
          .text("support@lunora.com", 50, 183);

        const shipping = order.shippingAddress || {};
        doc
          .fillColor(primaryColor)
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("Billed To (Customer)", 320, 120)
          .font("Helvetica")
          .fontSize(9)
          .fillColor(lightGray)
          .text(shipping.name || "Customer Details", 320, 135)
          .text(shipping.street || "", 320, 147)
          .text(`${shipping.city || ""}, ${shipping.state || ""}`, 320, 159)
          .text(`PIN: ${shipping.postalCode || ""}`, 320, 171)
          .text(`Phone: ${shipping.phone || ""}`, 320, 183);

        // Horizontal line separator
        doc.strokeColor(borderColor).lineWidth(1).moveTo(50, 210).lineTo(545, 210).stroke();

        // 4. TRANSACTION / PAYMENT META
        doc
          .fillColor(primaryColor)
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("Payment Specs", 50, 225)
          .font("Helvetica")
          .fontSize(9)
          .fillColor(lightGray)
          .text(`Method: ${order.paymentMethod || "COD"}`, 50, 240)
          .text(`Status: ${order.paymentStatus || "Pending"}`, 50, 252)
          .text(`Transaction ID: ${order.paymentId || "N/A"}`, 50, 264);

        doc
          .fillColor(primaryColor)
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("Order Info", 320, 225)
          .font("Helvetica")
          .fontSize(9)
          .fillColor(lightGray)
          .text(`Order ID: ${order.orderNumber}`, 320, 240)
          .text(`Delivery Status: ${order.status}`, 320, 252);

        // Horizontal line separator
        doc.strokeColor(borderColor).lineWidth(1).moveTo(50, 290).lineTo(545, 290).stroke();

        // 5. ITEMS TABLE HEADER
        const tableTop = 310;
        doc
          .fillColor(primaryColor)
          .font("Helvetica-Bold")
          .fontSize(9)
          .text("Product Details", 50, tableTop)
          .text("Color", 250, tableTop)
          .text("Unit Price", 340, tableTop, { width: 60, align: "right" })
          .text("Qty", 410, tableTop, { width: 30, align: "right" })
          .text("Amount", 470, tableTop, { width: 75, align: "right" });

        // Line below headers
        doc.strokeColor(borderColor).lineWidth(1).moveTo(50, 325).lineTo(545, 325).stroke();

        // 6. TABLE ITEMS
        let currentY = 335;
        const items = order.items || [];

        items.forEach((item: any) => {
          const product = item.product || {};
          const productName = product.name || "Product Item";
          const colorName = item.selectedColor?.name || "N/A";
          const unitPrice = item.price || 0;
          const qty = item.quantity || 1;
          const amount = unitPrice * qty;

          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(primaryColor)
            .text(productName, 50, currentY, { width: 190 })
            .text(colorName, 250, currentY, { width: 80 })
            .text(formatINR(unitPrice), 340, currentY, { width: 60, align: "right" })
            .text(qty.toString(), 410, currentY, { width: 30, align: "right" })
            .text(formatINR(amount), 470, currentY, { width: 75, align: "right" });

          currentY += 20;
        });

        // Horizontal line below items
        doc.strokeColor(borderColor).lineWidth(1).moveTo(50, currentY).lineTo(545, currentY).stroke();

        // 7. PRICING BREAKDOWN DETAILS
        currentY += 15;
        const summaryX = 340;
        const valueX = 470;

        // Subtotal
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(lightGray)
          .text("Subtotal", summaryX, currentY, { width: 100 })
          .fillColor(primaryColor)
          .text(formatINR(order.subtotal || 0), valueX, currentY, { width: 75, align: "right" });

        // Applied Discount
        if (order.discount && order.discount > 0) {
          currentY += 15;
          doc
            .fillColor(lightGray)
            .text("Discount (Coupon)", summaryX, currentY, { width: 100 })
            .fillColor(primaryColor)
            .text(`-${formatINR(order.discount)}`, valueX, currentY, { width: 75, align: "right" });
        }

        // Standard 18% GST (already computed in order totals)
        currentY += 15;
        const gstAmount = order.taxAmount || Math.round(((order.subtotal - (order.discount || 0)) * 18) / 100);
        doc
          .fillColor(lightGray)
          .text("GST Tax (18%)", summaryX, currentY, { width: 100 })
          .fillColor(primaryColor)
          .text(formatINR(gstAmount), valueX, currentY, { width: 75, align: "right" });

        // Shipping Charges
        currentY += 15;
        const shippingFee = order.deliveryCharge || 0;
        doc
          .fillColor(lightGray)
          .text("Shipping Fee", summaryX, currentY, { width: 100 })
          .fillColor(primaryColor)
          .text(shippingFee === 0 ? "Free" : formatINR(shippingFee), valueX, currentY, { width: 75, align: "right" });

        // Horizontal divider before grand total
        currentY += 15;
        doc.strokeColor(borderColor).lineWidth(1).moveTo(summaryX, currentY).lineTo(545, currentY).stroke();

        // Grand Total
        currentY += 10;
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(primaryColor)
          .text("Grand Total", summaryX, currentY, { width: 100 })
          .fillColor(accentColor)
          .text(formatINR(order.total || 0), valueX, currentY, { width: 75, align: "right" });

        // 8. LEGAL NOTICE & TERMS
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(lightGray)
          .text("Thank you for shopping with LUNORA. We appreciate your fine business.", 50, 720, { align: "center" })
          .text("This is an electronically generated invoice. No signature is required under IT act.", 50, 735, { align: "center" });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
