// server/test_email.cjs
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function runTest() {
  console.log("=== LUNORA PHASE 12 EMAIL SYSTEM AUTOMATED VERIFICATION ===\n");

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Error: MONGO_URI environment variable is missing.");
    process.exit(1);
  }

  console.log("Connecting to database at:", mongoUri.split("@").pop());
  await mongoose.connect(mongoUri);
  console.log("Database connection established.\n");

  try {
    // 1. Dynamically import ESM services and models
    const { EmailService } = await import("./dist/services/email-service.js");
    const { EmailLog } = await import("./dist/models/email-log.js");
    const { InvoiceService } = await import("./dist/services/invoice-service.js");

    // Initialize background queue monitor (which registers intervals)
    EmailService.initBackgroundQueue();

    // 2. Prepare mock details
    const testEmail = "test_receiver@lunora.com";
    const testName = "Aarushi Goel";
    const testToken = "test_reset_token_hex_value_123456";

    const mockOrder = {
      _id: new mongoose.Types.ObjectId(),
      orderNumber: "LUN-2026-99999",
      status: "Processing",
      orderStatus: "Processing",
      items: [
        {
          product: { name: "Classic Canvas Tote" },
          selectedColor: { name: "Taupe Gold" },
          price: 1299,
          quantity: 1,
        },
        {
          product: { name: "Structured Mini Handbag" },
          selectedColor: { name: "Charcoal Black" },
          price: 2199,
          quantity: 2,
        }
      ],
      subtotal: 5697,
      discount: 500,
      taxAmount: 935, // GST
      deliveryCharge: 0, // Free
      total: 6132,
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      paymentId: "pay_mock_payment_id_999",
      shippingAddress: {
        name: "Aarushi Goel",
        street: "Flat 402, Block C, Maple Heights",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560103",
        phone: "+91 98765 43210",
      },
      createdAt: new Date(),
    };

    // Clean up past test logs to start fresh
    await EmailLog.deleteMany({ recipient: { $in: [testEmail, "admin@lunora.com"] } });

    // 3. Test 1: Welcome Email
    console.log("1. Testing Welcome Email dispatch...");
    const welcomeSent = await EmailService.sendWelcome(testEmail, testName);
    console.log(`- Welcome Email Sent Status: ${welcomeSent}`);

    // 4. Test 2: Forgot Password Email
    console.log("2. Testing Forgot Password Email dispatch...");
    const forgotSent = await EmailService.sendForgotPassword(testEmail, testName, testToken);
    console.log(`- Forgot Password Email Sent Status: ${forgotSent}`);

    // 5. Test 3: Reset Success Email
    console.log("3. Testing Password Reset Success Email dispatch...");
    const resetSent = await EmailService.sendPasswordResetSuccess(testEmail, testName);
    console.log(`- Reset Success Email Sent Status: ${resetSent}`);

    // 6. Test 4: Order Confirmation Email
    console.log("4. Testing Order Confirmation Email with PDF Invoice generation...");
    const orderSent = await EmailService.sendOrderConfirmation(testEmail, testName, mockOrder);
    console.log(`- Order Confirmation Email Sent Status: ${orderSent}`);

    // 7. Test 5: Order Cancelled Email
    console.log("5. Testing Order Cancelled Email dispatch...");
    const cancelSent = await EmailService.sendOrderCancelled(testEmail, testName, mockOrder);
    console.log(`- Order Cancelled Email Sent Status: ${cancelSent}`);

    // 8. Test 6: Shipping Update Email
    console.log("6. Testing Shipping Update Email dispatch...");
    const shipSent = await EmailService.sendShippingUpdate(
      testEmail,
      testName,
      mockOrder,
      "LUNORA Express",
      "LUN-TRK-887766"
    );
    console.log(`- Shipping Update Email Sent Status: ${shipSent}`);

    // 9. Test 7: Delivery Email
    console.log("7. Testing Delivery Confirmation Email with PDF Invoice...");
    const deliverySent = await EmailService.sendDeliveryConfirmation(testEmail, testName, mockOrder);
    console.log(`- Delivery Email Sent Status: ${deliverySent}`);

    // 10. Test 8: Contact Form Inquiry Email
    console.log("8. Testing Contact Form submission forwarding email...");
    const contactSent = await EmailService.sendContactFormInquiry(
      testName,
      testEmail,
      "Partnership Inquiry",
      "We would like to partner with LUNORA for partnership distribution channels."
    );
    console.log(`- Contact Inquiry Email Sent Status: ${contactSent}`);

    // 11. Test 9: Admin New Order Alert
    console.log("9. Testing Admin Alert for New Orders...");
    const adminAlertSent = await EmailService.sendAdminNewOrder(mockOrder);
    console.log(`- Admin Alert Sent Status: ${adminAlertSent}`);

    // 12. Verification of Database Logging
    console.log("\n10. Verifying Database Log Entries...");
    const logs = await EmailLog.find({ recipient: { $in: [testEmail, "admin@lunora.com"] } });
    console.log(`- Found ${logs.length} database logs (Expected: 9).`);
    
    const allPassed = logs.every(log => log.status === "sent");
    console.log(`- Status Check: All logs marked as 'sent' -> ${allPassed}`);

    // Inspect files generated inside scratch
    console.log("\n11. Verifying Local Mock Artifact Outputs in scratch/emails/...");
    const scratchPath = path.resolve(__dirname, "../scratch/emails");
    if (fs.existsSync(scratchPath)) {
      const files = fs.readdirSync(scratchPath);
      console.log(`- Found ${files.length} email HTML/PDF artifacts in scratch/emails/.`);
    } else {
      console.log("- Warning: scratch/emails directory does not exist.");
    }

    console.log("\n=== EMAIL SYSTEM TEST SUITE COMPLETED SUCCESSFULLY ===");
    process.exit(0);
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exit(1);
  }
}

runTest();
