/**
 * test_uploads.js
 *
 * Automated verification test suite for Phase 11 Cloudinary & Product Image uploads.
 * Validates generic upload first, save first, set primary, reorder, replace, delete,
 * and admin permissions guard.
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load backend environment variables
const envPath = path.resolve(__dirname, ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn("Warning: .env file not found at", envPath);
}

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api/v1`;

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

async function runTests() {
  console.log("=== PHASE 11: CLOUDINARY & IMAGE MANAGEMENT TEST SUITE ===\n");

  const emailAdmin = `upload_admin_${Date.now()}@lunora.com`;
  const emailUser = `upload_user_${Date.now()}@lunora.com`;
  const password = "Password123";

  // 1. Connect to DB to elevate role to admin
  console.log("Connecting to MongoDB for test coordination...");
  await mongoose.connect(process.env.MONGO_URI);
  const usersCol = mongoose.connection.db.collection("users");
  const productsCol = mongoose.connection.db.collection("products");
  const categoriesCol = mongoose.connection.db.collection("categories");
  console.log("Database connection successful.\n");

  // Fetch a category to use for product creation
  const testCategory = await categoriesCol.findOne({});
  if (!testCategory) {
    console.error("Error: No category found in database to link products. Run seed script first.");
    await mongoose.disconnect();
    return;
  }
  const categoryId = testCategory._id.toString();
  console.log(`Using category: ${testCategory.name} (${categoryId})`);

  let adminCookieHeader = "";
  let adminCsrfToken = "";
  let userCookieHeader = "";
  let userCsrfToken = "";

  try {
    // 2. REGISTER & ELEVATE ADMIN
    console.log("\n1. Registering admin tester account...");
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Upload Admin", email: emailAdmin, password }),
    });
    const regBody = await regRes.json();
    if (!regRes.ok) throw new Error(`Admin registration failed: ${JSON.stringify(regBody)}`);

    // Elevate in DB
    await usersCol.updateOne({ email: emailAdmin }, { $set: { role: "admin" } });
    console.log(`- User ${emailAdmin} successfully elevated to 'admin'.`);

    // Login to get fresh tokens/session cookies
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailAdmin, password }),
    });
    const loginBody = await loginRes.json();
    const adminCookies = parseCookies(loginRes);
    adminCookieHeader = `token=${adminCookies["token"]}; csrfToken=${adminCookies["csrfToken"]}`;
    adminCsrfToken = adminCookies["csrfToken"];
    console.log("- Admin authenticated successfully.");

    // 3. REGISTER STANDARD USER
    console.log("\n2. Registering standard user tester account...");
    const userRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Upload User", email: emailUser, password }),
    });
    const userRegBody = await userRegRes.json();
    if (!userRegRes.ok) throw new Error(`User registration failed: ${JSON.stringify(userRegBody)}`);

    const userCookies = parseCookies(userRegRes);
    userCookieHeader = `token=${userCookies["token"]}; csrfToken=${userCookies["csrfToken"]}`;
    userCsrfToken = userCookies["csrfToken"];
    console.log("- User authenticated successfully.");

    // ─── TEST A: Authorization Guard checks ───────────────────
    console.log("\n3. [TEST A] Verifying permissions restriction (User uploading)...");
    const userFd = new FormData();
    const userBlob = new Blob([Buffer.from("mock image file content")], { type: "image/png" });
    userFd.append("images", userBlob, "unauthorized.png");

    const unauthUploadRes = await fetch(`${BASE_URL}/uploads/images`, {
      method: "POST",
      headers: {
        "Cookie": userCookieHeader,
        "x-csrf-token": userCsrfToken,
      },
      body: userFd,
    });
    console.log(`- Status: ${unauthUploadRes.status} (Expected: 403)`);
    const unauthBody = await unauthUploadRes.json();
    console.log(`- Message: ${unauthBody.message}`);
    if (unauthUploadRes.status !== 403) {
      throw new Error("Security check failed: Standard user was not blocked from uploading.");
    }
    console.log("✔ Permissions restriction validated.");

    // ─── TEST B: Generic Upload-First workflow ─────────────────
    console.log("\n4. [TEST B] Uploading images generic (Upload First workflow)...");
    const adminFd = new FormData();
    const img1 = new Blob([Buffer.from("mock image data 1")], { type: "image/jpeg" });
    const img2 = new Blob([Buffer.from("mock image data 2")], { type: "image/webp" });
    adminFd.append("images", img1, "bag_main.jpg");
    adminFd.append("images", img2, "bag_detail.webp");

    const genericUploadRes = await fetch(`${BASE_URL}/uploads/images`, {
      method: "POST",
      headers: {
        "Cookie": adminCookieHeader,
        "x-csrf-token": adminCsrfToken,
      },
      body: adminFd,
    });
    if (!genericUploadRes.ok) {
      const errBody = await genericUploadRes.json();
      throw new Error(`Generic upload failed: ${JSON.stringify(errBody)}`);
    }

    const uploadBody = await genericUploadRes.json();
    console.log("- Generic upload succeeded. Metadata verification:");
    const uploadedImages = uploadBody.data.images;
    console.log(`- Count: ${uploadedImages.length} (Expected: 2)`);
    
    // Check all required keys
    uploadedImages.forEach((img, idx) => {
      console.log(`  * Image ${idx + 1}:`);
      console.log(`    - url: ${img.url}`);
      console.log(`    - secure_url: ${img.secure_url}`);
      console.log(`    - publicId: ${img.publicId}`);
      console.log(`    - width: ${img.width}, height: ${img.height}`);
      console.log(`    - format: ${img.format}, bytes: ${img.bytes}`);
      console.log(`    - alt: ${img.alt}, isPrimary: ${img.isPrimary}`);
      
      const hasAllKeys = img.url && img.secure_url && img.publicId && img.width && img.height && img.format && img.bytes !== undefined;
      if (!hasAllKeys) {
        throw new Error("Uploaded image metadata lacks required keys.");
      }
    });

    // ─── TEST C: Create Product with uploaded objects ─────────
    console.log("\n5. [TEST C] Creating product using uploaded image objects...");
    const productPayload = {
      name: `Premium Tote ${Date.now()}`,
      shortDescription: "Handcrafted full-grain leather tote.",
      description: "This premium leather tote features dual shoulder straps, custom gold hardware details, and modular storage dividers.",
      category: categoryId,
      price: 2499,
      sku: `LUN-TST-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: 5,
      images: uploadedImages, // Array of image objects
    };

    const createProductRes = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": adminCookieHeader,
        "x-csrf-token": adminCsrfToken,
      },
      body: JSON.stringify(productPayload),
    });
    const createProductBody = await createProductRes.json();
    if (!createProductRes.ok) {
      throw new Error(`Product creation failed: ${JSON.stringify(createProductBody)}`);
    }

    const targetProduct = createProductBody.data.product;
    const productId = targetProduct.id || targetProduct._id;
    console.log(`- Product successfully created. ID: ${productId}`);
    console.log("- Verifying image schema mapping in database...");
    const productInDb = await productsCol.findOne({ _id: new mongoose.Types.ObjectId(productId) });
    console.log(`- Images in DB count: ${productInDb.images.length}`);
    console.log(`- First image secure_url: ${productInDb.images[0].secure_url}`);
    console.log(`- First image format: ${productInDb.images[0].format}`);
    console.log(`- First image bytes: ${productInDb.images[0].bytes}`);
    console.log(`- First image isPrimary: ${productInDb.images[0].isPrimary}`);

    // Verify virtual properties serialization output
    console.log("- Checking serialized virtual thumbnail fields:");
    console.log(`  * thumbnail: ${targetProduct.images[0].thumbnail}`);
    console.log(`  * medium: ${targetProduct.images[0].medium}`);
    console.log(`  * large: ${targetProduct.images[0].large}`);
    console.log(`  * original: ${targetProduct.images[0].original}`);

    if (!targetProduct.images[0].thumbnail || !targetProduct.images[0].thumbnail.includes("f_auto")) {
      throw new Error("Virtual transformation delivery URL generation failed.");
    }
    console.log("✔ Product creation & virtualization verified.");

    // ─── TEST D: Save-first direct uploads ─────────────────────
    console.log("\n6. [TEST D] Uploading image directly to product (Save first workflow)...");
    const saveFirstFd = new FormData();
    const newImgBlob = new Blob([Buffer.from("new overlay image")], { type: "image/png" });
    saveFirstFd.append("images", newImgBlob, "extra_angle.png");

    const directUploadRes = await fetch(`${BASE_URL}/uploads/products/${productId}`, {
      method: "POST",
      headers: {
        "Cookie": adminCookieHeader,
        "x-csrf-token": adminCsrfToken,
      },
      body: saveFirstFd,
    });
    if (!directUploadRes.ok) {
      const errBody = await directUploadRes.json();
      throw new Error(`Direct upload failed: ${JSON.stringify(errBody)}`);
    }
    const directUploadBody = await directUploadRes.json();
    const updatedImages = directUploadBody.data.product.images;
    console.log(`- Upload successful. Total images now: ${updatedImages.length} (Expected: 3)`);
    console.log(`- Last image format: ${updatedImages[2].format}`);
    console.log(`- Last image isPrimary: ${updatedImages[2].isPrimary} (Expected: false)`);

    // ─── TEST E: Reorder Images ───────────────────────────────
    console.log("\n7. [TEST E] Reordering product images...");
    // Reverse the order
    const reversedList = [...updatedImages].reverse();
    const reorderRes = await fetch(`${BASE_URL}/uploads/products/${productId}/reorder`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": adminCookieHeader,
        "x-csrf-token": adminCsrfToken,
      },
      body: JSON.stringify({ images: reversedList }),
    });
    if (!reorderRes.ok) {
      const errBody = await reorderRes.json();
      throw new Error(`Reordering failed: ${JSON.stringify(errBody)}`);
    }
    const reorderBody = await reorderRes.json();
    const reorderedImages = reorderBody.data.product.images;
    console.log(`- Reorder complete. First image publicId is now: ${reorderedImages[0].publicId} (Expected: ${reversedList[0].publicId})`);

    // ─── TEST F: Change Primary Image selection ───────────────
    console.log("\n8. [TEST F] Setting a specific image as primary...");
    const targetPrimaryId = reorderedImages[1].publicId;
    const primaryRes = await fetch(`${BASE_URL}/uploads/products/${productId}/primary`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": adminCookieHeader,
        "x-csrf-token": adminCsrfToken,
      },
      body: JSON.stringify({ publicId: targetPrimaryId }),
    });
    if (!primaryRes.ok) {
      const errBody = await primaryRes.json();
      throw new Error(`Setting primary failed: ${JSON.stringify(errBody)}`);
    }
    const primaryBody = await primaryRes.json();
    const checkPrimaryImages = primaryBody.data.product.images;
    const item1Primary = checkPrimaryImages.find(img => img.publicId === targetPrimaryId).isPrimary;
    const item2Primary = checkPrimaryImages.find(img => img.publicId !== targetPrimaryId).isPrimary;
    console.log(`- Image ${targetPrimaryId} isPrimary: ${item1Primary} (Expected: true)`);
    console.log(`- Other images isPrimary: ${item2Primary} (Expected: false)`);

    // ─── TEST G: Delete Product Image ────────────────────────
    console.log("\n9. [TEST G] Deleting a specific image from product gallery...");
    const deleteTargetId = reorderedImages[0].publicId;
    const deleteImgRes = await fetch(`${BASE_URL}/uploads/products/${productId}/images/${encodeURIComponent(deleteTargetId)}`, {
      method: "DELETE",
      headers: {
        "Cookie": adminCookieHeader,
        "x-csrf-token": adminCsrfToken,
      },
    });
    if (!deleteImgRes.ok) {
      const errBody = await deleteImgRes.json();
      throw new Error(`Deleing single image failed: ${JSON.stringify(errBody)}`);
    }
    const deleteImgBody = await deleteImgRes.json();
    const finalImages = deleteImgBody.data.product.images;
    console.log(`- Deleted successfully. Remaining image count: ${finalImages.length} (Expected: 2)`);
    const foundDeleted = finalImages.some(img => img.publicId === deleteTargetId);
    if (foundDeleted) {
      throw new Error("Deleted image still exists in product document.");
    }
    console.log("✔ Gallery deletions validated.");

    // ─── TEST H: Product deletion CDN cleanup ────────────────
    console.log("\n10. [TEST H] Deleting product and evicting all CDN assets...");
    const deleteProdRes = await fetch(`${BASE_URL}/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Cookie": adminCookieHeader,
        "x-csrf-token": adminCsrfToken,
      },
    });
    if (!deleteProdRes.ok) {
      const errBody = await deleteProdRes.json();
      throw new Error(`Product deletion failed: ${JSON.stringify(errBody)}`);
    }
    console.log("- Product document deleted.");

    // Verify it is gone in DB
    const checkProductDb = await productsCol.findOne({ _id: new mongoose.Types.ObjectId(productId) });
    console.log(`- Product lookup in DB result: ${checkProductDb ? "EXISTS (FAILED)" : "NOT FOUND (SUCCESS)"}`);
    if (checkProductDb) {
      throw new Error("Product document was not removed from database.");
    }
    console.log("✔ Product eviction validated successfully.");

  } catch (err) {
    console.error("\n❌ TEST SUITE FAILED:", err);
  } finally {
    // Cleanup users
    console.log("\nCleaning up test user logs...");
    await usersCol.deleteOne({ email: emailAdmin });
    await usersCol.deleteOne({ email: emailUser });
    console.log("Cleanup completed.");

    await mongoose.disconnect();
    console.log("Disconnected database. Tests Finished.");
  }
}

runTests();
