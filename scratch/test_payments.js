/**
 * scratch/test_payments.js — Automated test script to verify payment flows (COD, Razorpay, Replays, Signature Checks).
 */
const crypto = require("crypto");

async function runTests() {
  const baseUrl = "http://localhost:5000/api/v1";
  console.log("=== LUNORA PAYMENT SYSTEM TEST SUITE ===\n");

  let token = "";
  let userId = "";
  let product = null;
  const uniqueEmail = `shopper_payment_${Date.now()}@lunora.com`;

  // 1. REGISTER USER
  console.log("1. Registering test shopper...");
  try {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Payment Tester",
        email: uniqueEmail,
        password: "Password123",
        phone: "9988776655",
      }),
    });
    const body = await res.json();
    if (body.success) {
      token = body.data.token;
      userId = body.data.user.id || body.data.user._id;
      console.log(`- Registered: ${body.data.user.email}`);
    } else {
      console.error("Registration failed:", body);
      return;
    }
  } catch (err) {
    console.error("Error registering user:", err.message);
    return;
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 2. GET PRODUCT FOR CART SEED
  console.log("\n2. Fetching product catalog...");
  try {
    const res = await fetch(`${baseUrl}/products?limit=1`);
    const body = await res.json();
    if (body.success && body.data.products.length > 0) {
      product = body.data.products[0];
      console.log(`- Target Product: ${product.name} (Price: ₹${product.price}, Stock: ${product.stock})`);
    } else {
      console.error("No products found to run tests. Seed first.");
      return;
    }
  } catch (err) {
    console.error("Product fetch error:", err.message);
    return;
  }

  const shippingAddress = {
    name: "Payment Tester",
    street: "123 luxury lane, sector 9",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560103",
    phone: "9988776655",
  };

  // ─── TEST 1: Cash on Delivery (COD) Checkout ──────────────────────────────
  console.log("\n3. [TEST 1] Testing Cash on Delivery Checkout...");
  try {
    // Add item to cart
    await fetch(`${baseUrl}/cart`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });

    const res = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        shippingAddress,
        paymentMethod: "Cash on Delivery",
      }),
    });
    const body = await res.json();
    console.log(`- Status code: ${res.status}`);
    console.log(`- Success state: ${body.success}`);
    if (body.success) {
      console.log(`- Order Number: ${body.data.order.orderNumber}`);
      console.log(`- Total Amount: ₹${body.data.order.total}`);
      console.log(`- Payment Status: ${body.data.order.paymentStatus}`);
    } else {
      console.error("- Failed COD checkout:", body);
    }
  } catch (err) {
    console.error("- COD checkout test error:", err.message);
  }

  // ─── TEST 2: Successful Razorpay Flow ─────────────────────────────────────
  console.log("\n4. [TEST 2] Testing Successful Razorpay Flow...");
  let activeRazorpayOrderId = "";
  let activePaymentId = `pay_mock_${Math.floor(100000 + Math.random() * 900000)}`;
  let activeSignature = "";

  try {
    // Re-add product to cart
    await fetch(`${baseUrl}/cart`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });

    // Create payment order
    const orderRes = await fetch(`${baseUrl}/payments/create-order`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    const orderBody = await orderRes.json();
    console.log(`- Create Order Status: ${orderRes.status}`);
    
    if (orderBody.success) {
      activeRazorpayOrderId = orderBody.data.orderId;
      console.log(`- Razorpay Order ID generated: ${activeRazorpayOrderId}`);

      // Calculate HMAC signature locally using the mock secret key 'mockSecretKey456'
      const keySecret = "mockSecretKey456";
      const signText = `${activeRazorpayOrderId}|${activePaymentId}`;
      activeSignature = crypto
        .createHmac("sha256", keySecret)
        .update(signText)
        .digest("hex");

      console.log(`- Client Signed Signature: ${activeSignature}`);

      // Verify signature on backend
      const verifyRes = await fetch(`${baseUrl}/payments/verify`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          razorpay_order_id: activeRazorpayOrderId,
          razorpay_payment_id: activePaymentId,
          razorpay_signature: activeSignature,
          shippingAddress,
        }),
      });

      const verifyBody = await verifyRes.json();
      console.log(`- Signature Verify Status: ${verifyRes.status}`);
      console.log(`- Verify Success state: ${verifyBody.success}`);
      if (verifyBody.success) {
        console.log(`- Order Created: ${verifyBody.data.order.orderNumber}`);
        console.log(`- Payment ID registered: ${verifyBody.data.order.paymentId}`);
      } else {
        console.error("- Verify failed:", verifyBody);
      }
    } else {
      console.error("- Failed to create payment order:", orderBody);
    }
  } catch (err) {
    console.error("- Razorpay success test error:", err.message);
  }

  // ─── TEST 3: Invalid Signature Flow ───────────────────────────────────────
  console.log("\n5. [TEST 3] Testing Invalid Signature Flow...");
  try {
    // Re-add product to cart
    await fetch(`${baseUrl}/cart`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });

    // Create payment order
    const orderRes = await fetch(`${baseUrl}/payments/create-order`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    const orderBody = await orderRes.json();

    if (orderBody.success) {
      const razorpayOrderId = orderBody.data.orderId;
      const paymentId = `pay_mock_${Math.floor(100000 + Math.random() * 900000)}`;
      const corruptedSignature = "corrupted_signature_length_64_characters_xxxxxxxxxxxxxxxxxxxxxx";

      console.log(`- Submitting corrupted signature of length ${corruptedSignature.length}`);

      const verifyRes = await fetch(`${baseUrl}/payments/verify`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: corruptedSignature,
          shippingAddress,
        }),
      });

      const verifyBody = await verifyRes.json();
      console.log(`- Verify status code: ${verifyRes.status} (Expected: 400)`);
      console.log(`- Success state: ${verifyBody.success} (Expected: false)`);
      console.log(`- Error message: "${verifyBody.message}"`);
    }
  } catch (err) {
    console.error("- Invalid signature test error:", err.message);
  }

  // ─── TEST 4: Duplicate Transaction Replay Attack ─────────────────────────
  console.log("\n6. [TEST 4] Testing Replay Attack Protection (Duplicate Verification)...");
  try {
    console.log(`- Submitting the verified Razorpay Order ID again: ${activeRazorpayOrderId}`);
    
    const verifyRes = await fetch(`${baseUrl}/payments/verify`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        razorpay_order_id: activeRazorpayOrderId,
        razorpay_payment_id: activePaymentId,
        razorpay_signature: activeSignature,
        shippingAddress,
      }),
    });

    const verifyBody = await verifyRes.json();
    console.log(`- Verify status code: ${verifyRes.status} (Expected: 400)`);
    console.log(`- Success state: ${verifyBody.success} (Expected: false)`);
    console.log(`- Error message: "${verifyBody.message}"`);
  } catch (err) {
    console.error("- Replay attack test error:", err.message);
  }

  console.log("\n=== PAYMENT SYSTEM VERIFICATION COMPLETE ===");
}

runTests();
