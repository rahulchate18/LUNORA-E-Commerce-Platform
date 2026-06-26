/**
 * Test suite to verify Product and Category API endpoints.
 */

async function runTests() {
  const baseUrl = "http://localhost:5000/api/v1";

  console.log("=== LUNORA PRODUCT & CATEGORY API VERIFICATION TESTS ===\n");

  // 1. GET ALL CATEGORIES
  console.log("Test 1: GET All Categories...");
  try {
    const res = await fetch(`${baseUrl}/categories`);
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Success: ${body.success}`);
    console.log(`Count: ${body.count}`);
    if (body.data && body.data.categories) {
      console.log("Categories found:", body.data.categories.map(c => `${c.name} (${c.slug})`));
    }
  } catch (err) {
    console.error("Test 1 Failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 2. GET CATEGORY BY SLUG
  console.log("Test 2: GET Category by Slug ('tote-bags')...");
  try {
    const res = await fetch(`${baseUrl}/categories/tote-bags`);
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Success: ${body.success}`);
    if (body.data && body.data.category) {
      console.log("Category Description:", body.data.category.description);
    }
  } catch (err) {
    console.error("Test 2 Failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 3. GET ALL PRODUCTS
  console.log("Test 3: GET All Products (Paginated)...");
  try {
    const res = await fetch(`${baseUrl}/products`);
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Success: ${body.success}`);
    if (body.pagination) {
      console.log("Pagination:", JSON.stringify(body.pagination));
    }
    if (body.data && body.data.products) {
      console.log(`Returned products count: ${body.data.products.length}`);
      console.log("First product sample:", {
        name: body.data.products[0].name,
        price: body.data.products[0].price,
        isNew: body.data.products[0].isNew, // verified serialization rename
        sku: body.data.products[0].sku
      });
    }
  } catch (err) {
    console.error("Test 3 Failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 4. GET FEATURED PRODUCTS
  console.log("Test 4: GET Featured Collection...");
  try {
    const res = await fetch(`${baseUrl}/products/featured`);
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Success: ${body.success}`);
    console.log(`Count: ${body.count}`);
    if (body.data && body.data.products) {
      console.log("Featured items:", body.data.products.map(p => p.name));
    }
  } catch (err) {
    console.error("Test 4 Failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 5. FILTER PRODUCTS BY CATEGORY
  console.log("Test 5: Filter Products by Category ('crossbody-bags')...");
  try {
    const res = await fetch(`${baseUrl}/products?category=crossbody-bags`);
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Success: ${body.success}`);
    if (body.data && body.data.products) {
      console.log(`Count: ${body.data.products.length}`);
      console.log("Filtered items:", body.data.products.map(p => `${p.name} - Category: ${p.category.name}`));
    }
  } catch (err) {
    console.error("Test 5 Failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 6. SEARCH PRODUCTS
  console.log("Test 6: Search Products for 'Pebble'...");
  try {
    const res = await fetch(`${baseUrl}/products?search=Pebble`);
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Success: ${body.success}`);
    if (body.data && body.data.products) {
      console.log("Search matches:", body.data.products.map(p => p.name));
    }
  } catch (err) {
    console.error("Test 6 Failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 7. PRICE FILTER
  console.log("Test 7: Filter by Price ₹2000 - ₹4000...");
  try {
    const res = await fetch(`${baseUrl}/products?minPrice=2000&maxPrice=4000`);
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Success: ${body.success}`);
    if (body.data && body.data.products) {
      console.log(`Count: ${body.data.products.length}`);
      console.log("Items in price range:", body.data.products.map(p => `${p.name} (₹${p.price})`));
    }
  } catch (err) {
    console.error("Test 7 Failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 8. SORT BY PRICE ASCENDING
  console.log("Test 8: Sort Products by price_asc...");
  try {
    const res = await fetch(`${baseUrl}/products?sort=price_asc`);
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Success: ${body.success}`);
    if (body.data && body.data.products) {
      console.log("Sorted order:", body.data.products.map(p => `${p.name} (₹${p.price})`));
    }
  } catch (err) {
    console.error("Test 8 Failed:", err);
  }

  console.log("\n---------------------------------------------\n");

  // 9. GET PRODUCT BY SLUG
  console.log("Test 9: GET Product by Slug ('aria-pebble-leather-tote')...");
  try {
    const res = await fetch(`${baseUrl}/products/aria-pebble-leather-tote`);
    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Success: ${body.success}`);
    if (body.data && body.data.product) {
      console.log("Full Product description:", body.data.product.description);
      console.log("Colors:", body.data.product.colors);
    }
  } catch (err) {
    console.error("Test 9 Failed:", err);
  }
}

runTests();
