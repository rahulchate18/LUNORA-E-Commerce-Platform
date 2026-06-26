const BASE_URL = "http://localhost:5000/api/v1";

function parseCookies(response) {
  const cookieHeaders = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
  const cookies = {};
  for (const header of cookieHeaders) {
    const parts = header.split(";")[0].split("=");
    if (parts.length === 2) {
      cookies[parts[0].trim()] = parts[1].trim();
    }
  }
  return cookies;
}

async function runTest() {
  console.log("=== LUNORA CSRF PROTECTION TEST SUITE ===\n");

  const email = `csrf_tester_${Date.now()}@lunora.com`;
  const password = "Password123";

  // 1. REGISTER A USER TO ESTABLISH SESSION
  console.log("1. Registering new test user...");
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "CSRF Tester", email, password }),
  });
  const regBody = await regRes.json();
  if (!regBody.success) {
    console.error("Registration failed:", regBody);
    return;
  }

  const cookies = parseCookies(regRes);
  const tokenCookie = cookies["token"];
  const csrfTokenCookie = cookies["csrfToken"];

  console.log(`- Received Token Cookie: ${tokenCookie ? tokenCookie.substring(0, 20) + "..." : "NONE"}`);
  console.log(`- Received CSRF Cookie: ${csrfTokenCookie || "NONE"}`);

  if (!tokenCookie || !csrfTokenCookie) {
    console.error("Cookies are missing. Ensure server sets cookies correctly.");
    return;
  }

  const cookieHeader = `token=${tokenCookie}; csrfToken=${csrfTokenCookie}`;

  // Get a product to add to cart
  const prodRes = await fetch(`${BASE_URL}/products?limit=1`);
  const prodBody = await prodRes.json();
  const targetProduct = prodBody.data.products[0];
  if (!targetProduct) {
    console.error("No product found to run cart tests.");
    return;
  }

  const testPayload = JSON.stringify({ productId: targetProduct.id, quantity: 1 });

  // ─── TEST 1: Valid CSRF Request ──────────────────────────────────────────
  console.log("\n2. [TEST 1] Testing request with matching CSRF Token...");
  const res1 = await fetch(`${BASE_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
      "X-CSRF-Token": csrfTokenCookie,
    },
    body: testPayload,
  });
  const body1 = await res1.json();
  console.log(`- Status code: ${res1.status} (Expected: 200)`);
  console.log(`- Success state: ${body1.success} (Expected: true)`);
  console.log(`- Message: "${body1.message}"`);

  // ─── TEST 2: Missing X-CSRF-Token Header ─────────────────────────────────
  console.log("\n3. [TEST 2] Testing request with missing X-CSRF-Token header...");
  const res2 = await fetch(`${BASE_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
    },
    body: testPayload,
  });
  const body2 = await res2.json();
  console.log(`- Status code: ${res2.status} (Expected: 403)`);
  console.log(`- Success state: ${body2.success} (Expected: false)`);
  console.log(`- Message: "${body2.message}"`);

  // ─── TEST 3: Mismatched X-CSRF-Token Header ──────────────────────────────
  console.log("\n4. [TEST 3] Testing request with mismatched X-CSRF-Token header...");
  const res3 = await fetch(`${BASE_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
      "X-CSRF-Token": "wrong_csrf_token_value_xyz",
    },
    body: testPayload,
  });
  const body3 = await res3.json();
  console.log(`- Status code: ${res3.status} (Expected: 403)`);
  console.log(`- Success state: ${body3.success} (Expected: false)`);
  console.log(`- Message: "${body3.message}"`);

  // ─── TEST 4: Request with Bearer token bypasses CSRF ─────────────────────
  console.log("\n5. [TEST 4] Testing Bearer Token request bypasses CSRF check...");
  const res4 = await fetch(`${BASE_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${regBody.data.token}`,
    },
    body: testPayload,
  });
  const body4 = await res4.json();
  console.log(`- Status code: ${res4.status} (Expected: 200)`);
  console.log(`- Success state: ${body4.success} (Expected: true)`);

  console.log("\n=== CSRF PROTECTION SYSTEM VERIFICATION COMPLETE ===");
}

runTest();
