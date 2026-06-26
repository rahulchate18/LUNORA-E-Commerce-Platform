/**
 * scratch/test_auth.js
 * Test suite to verify authentication endpoint validation checks.
 */

async function runTests() {
  const url = "http://localhost:5000/api/v1/auth";

  console.log("=== LUNORA AUTH ENDPOINT VALIDATION TESTS ===\n");

  // Test 1: Register with invalid parameters (Short password, invalid email)
  console.log("Test 1: Register with invalid parameters...");
  try {
    const res = await fetch(`${url}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "R",
        email: "not-an-email",
        password: "short",
      }),
    });
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(body, null, 2));
  } catch (err) {
    console.error("Test 1 Failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // Test 2: Login with empty fields
  console.log("Test 2: Login with empty fields...");
  try {
    const res = await fetch(`${url}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(body, null, 2));
  } catch (err) {
    console.error("Test 2 Failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // Test 3: Forgot password invalid email format
  console.log("Test 3: Forgot password invalid email format...");
  try {
    const res = await fetch(`${url}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email-format" }),
    });
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log("Response:", JSON.stringify(body, null, 2));
  } catch (err) {
    console.error("Test 3 Failed:", err);
  }
}

runTests();
