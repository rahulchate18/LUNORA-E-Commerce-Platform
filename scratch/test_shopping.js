/**
 * Test suite to verify Cart, Wishlist, and Order APIs (Phase 9).
 */

async function runTests() {
  const baseUrl = "http://localhost:5000/api/v1";
  console.log("=== LUNORA SHOPPING WORKFLOW API VERIFICATION TESTS ===\n");

  let token = "";
  let userId = "";
  let product1 = null;
  let product2 = null;
  let orderId = "";
  const uniqueEmail = `shopper_${Date.now()}@lunora.com`;

  // 1. REGISTER NEW USER
  console.log("1. Registering new test user...");
  try {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Shopper",
        email: uniqueEmail,
        password: "Password123",
        phone: "9876543210",
      }),
    });
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    if (body.success) {
      token = body.data.token;
      userId = body.data.user.id;
      console.log(`Registered user: ${body.data.user.email} (Role: ${body.data.user.role})`);
    } else {
      console.error("Failed to register:", body);
      return;
    }
  } catch (err) {
    console.error("Registration error:", err);
    return;
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  console.log("\n---------------------------------------------\n");

  // 2. FETCH PRODUCTS LIST
  console.log("2. Fetching products list to use in test...");
  try {
    const res = await fetch(`${baseUrl}/products?limit=2`);
    const body = await res.json();
    if (body.success && body.data.products.length >= 2) {
      product1 = body.data.products[0];
      product2 = body.data.products[1];
      console.log(`Product 1: ${product1.name} (Price: ₹${product1.price}, Stock: ${product1.stock})`);
      console.log(`Product 2: ${product2.name} (Price: ₹${product2.price}, Stock: ${product2.stock})`);
    } else {
      console.error("Could not fetch 2 products. Seed database first.");
      return;
    }
  } catch (err) {
    console.error("Fetch products error:", err);
    return;
  }

  console.log("\n---------------------------------------------\n");

  // 3. CART OPERATIONS
  console.log("3. Testing Cart operations...");
  try {
    // Add Product 1 to cart
    console.log(`- Adding 2 units of "${product1.name}" to cart...`);
    let res = await fetch(`${baseUrl}/cart`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        productId: product1.id,
        quantity: 2,
      }),
    });
    let body = await res.json();
    console.log(`Add response status: ${res.status}, success: ${body.success}`);
    if (!body.success) console.log("Fail reason:", body);

    // Add Product 2 with color choice
    console.log(`- Adding 1 unit of "${product2.name}" (with color hex) to cart...`);
    res = await fetch(`${baseUrl}/cart`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        productId: product2.id,
        quantity: 1,
        selectedColor: product2.colors && product2.colors[0] ? product2.colors[0] : { name: "Noir", hex: "#000000" },
      }),
    });
    body = await res.json();
    console.log(`Add response status: ${res.status}, success: ${body.success}`);
    if (!body.success) console.log("Fail reason:", body);

    // Get Cart
    console.log("- Fetching current cart details...");
    res = await fetch(`${baseUrl}/cart`, { headers: authHeaders });
    body = await res.json();
    if (body.success) {
      console.log("Current Cart items:", body.data.cart.items.map(item => `${item.product.name} (Qty: ${item.quantity})`));
    }

    // Update quantity of Product 1 to 3
    console.log(`- Updating "${product1.name}" quantity to 3...`);
    res = await fetch(`${baseUrl}/cart/${product1.id}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ quantity: 3 }),
    });
    body = await res.json();
    console.log(`Update response status: ${res.status}, success: ${body.success}`);

    // Remove Product 2 from cart
    console.log(`- Removing "${product2.name}" from cart...`);
    res = await fetch(`${baseUrl}/cart/${product2.id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    body = await res.json();
    console.log(`Remove response status: ${res.status}, success: ${body.success}`);

    // Fetch Cart again
    res = await fetch(`${baseUrl}/cart`, { headers: authHeaders });
    body = await res.json();
    console.log("Verified Cart after removal:", body.data.cart.items.map(item => `${item.product.name} (Qty: ${item.quantity})`));
  } catch (err) {
    console.error("Cart operations failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 4. WISHLIST OPERATIONS
  console.log("4. Testing Wishlist operations...");
  try {
    // Add Product 2 to wishlist
    console.log(`- Adding "${product2.name}" to wishlist...`);
    let res = await fetch(`${baseUrl}/wishlist`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ productId: product2.id }),
    });
    let body = await res.json();
    console.log(`Add to wishlist status: ${res.status}, success: ${body.success}`);

    // Get Wishlist
    res = await fetch(`${baseUrl}/wishlist`, { headers: authHeaders });
    body = await res.json();
    console.log("Current Wishlist items:", body.data.wishlist.products.map(p => p.name));

    // Move Wishlist item to cart
    console.log(`- Moving "${product2.name}" from wishlist to cart...`);
    res = await fetch(`${baseUrl}/wishlist/${product2.id}/move-to-cart`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        quantity: 1,
        selectedColor: product2.colors && product2.colors[0] ? product2.colors[0] : { name: "Noir", hex: "#000000" },
      }),
    });
    body = await res.json();
    console.log(`Move to cart response status: ${res.status}, success: ${body.success}`);

    // Get Wishlist again (should be empty)
    res = await fetch(`${baseUrl}/wishlist`, { headers: authHeaders });
    body = await res.json();
    console.log("Verified Wishlist products count:", body.data.wishlist.products.length);

    // Get Cart (should have both product 1 and product 2)
    res = await fetch(`${baseUrl}/cart`, { headers: authHeaders });
    body = await res.json();
    console.log("Verified Cart items:", body.data.cart.items.map(item => `${item.product.name} (Qty: ${item.quantity})`));
  } catch (err) {
    console.error("Wishlist operations failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 5. ORDER PLACEMENT (CHECKOUT)
  console.log("5. Testing Order Placement...");
  try {
    // Current stock levels
    console.log(`Product 1 initial stock: ${product1.stock}`);
    console.log(`Product 2 initial stock: ${product2.stock}`);

    // Create Order with coupon WELCOME200
    console.log("- Placing checkout order with coupon 'WELCOME200'...");
    const res = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        shippingAddress: {
          name: "John Doe",
          street: "123 Premium Way",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          phone: "9876543210",
        },
        paymentMethod: "UPI",
        couponCode: "WELCOME200",
      }),
    });
    const body = await res.json();
    console.log(`Order status: ${res.status}, success: ${body.success}`);
    if (body.success) {
      const order = body.data.order;
      orderId = order.id || order._id;
      console.log("\nOrder Calculations & Results:");
      console.log(`- Order Number: ${order.orderNumber}`);
      console.log(`- Subtotal: ₹${order.subtotal}`);
      console.log(`- Discount Applied: ₹${order.discount}`);
      console.log(`- Shipping Fee: ₹${order.shipping}`);
      console.log(`- Tax (18% GST): ₹${order.tax}`);
      console.log(`- Final Total: ₹${order.total}`);
      console.log(`- Payment status: ${order.paymentStatus}`);
      console.log(`- Order status: ${order.orderStatus}`);

      // Verify cart is now cleared
      const cartRes = await fetch(`${baseUrl}/cart`, { headers: authHeaders });
      const cartBody = await cartRes.json();
      console.log(`- Post-order Cart items count: ${cartBody.data.cart.items.length}`);

      // Verify product stock has decreased
      const p1Res = await fetch(`${baseUrl}/products/id/${product1.id}`);
      const p1Body = await p1Res.json();
      const p2Res = await fetch(`${baseUrl}/products/id/${product2.id}`);
      const p2Body = await p2Res.json();
      console.log(`- Product 1 updated stock (Expected ${product1.stock - 3}): ${p1Body.data.product.stock}`);
      console.log(`- Product 2 updated stock (Expected ${product2.stock - 1}): ${p2Body.data.product.stock}`);
    } else {
      console.error("Order placement failed details:", body);
    }
  } catch (err) {
    console.error("Order placement error:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 6. ORDER LIST & DETAIL LOOKUPS
  console.log("6. Testing Order detail lookups...");
  try {
    // Get Orders history
    let res = await fetch(`${baseUrl}/orders`, { headers: authHeaders });
    let body = await res.json();
    console.log(`Orders list status: ${res.status}, count: ${body.count}`);

    // Get Single Order details
    res = await fetch(`${baseUrl}/orders/${orderId}`, { headers: authHeaders });
    body = await res.json();
    console.log(`Single Order details status: ${res.status}, orderNumber: ${body.data.order.orderNumber}`);
  } catch (err) {
    console.error("Order details lookup failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 7. ORDER CANCELLATION & STOCK RECOVERY
  console.log("7. Testing Order cancellation and stock recovery...");
  try {
    const res = await fetch(`${baseUrl}/orders/${orderId}/cancel`, {
      method: "PATCH",
      headers: authHeaders,
    });
    const body = await res.json();
    console.log(`Cancel response status: ${res.status}, success: ${body.success}`);
    if (body.success) {
      console.log(`Updated Order status: ${body.data.order.orderStatus}`);

      // Verify product stock has been restored
      const p1Res = await fetch(`${baseUrl}/products/id/${product1.id}`);
      const p1Body = await p1Res.json();
      const p2Res = await fetch(`${baseUrl}/products/id/${product2.id}`);
      const p2Body = await p2Res.json();
      console.log(`- Product 1 restored stock (Expected ${product1.stock}): ${p1Body.data.product.stock}`);
      console.log(`- Product 2 restored stock (Expected ${product2.stock}): ${p2Body.data.product.stock}`);
    } else {
      console.error("Cancellation test failed details:", body);
    }
  } catch (err) {
    console.error("Cancellation test failed:", err);
  }
}

runTests();
