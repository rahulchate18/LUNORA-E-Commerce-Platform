const mongoose = require("mongoose");
const { Schema } = mongoose;

const MONGO_URI = "mongodb://rahulchate021_db_user:w7pskFVXeLdIRfiE@ac-dqow4dt-shard-00-00.gj5caax.mongodb.net:27017,ac-dqow4dt-shard-00-01.gj5caax.mongodb.net:27017,ac-dqow4dt-shard-00-02.gj5caax.mongodb.net:27017/lunora?ssl=true&authSource=admin&retryWrites=true&w=majority";
const BASE_URL = "http://localhost:5000/api/v1";

const ProductSchema = new Schema({
  name: String,
  stock: Number,
}, { collection: "products" });

const CartSchema = new Schema({
  user: Schema.Types.ObjectId,
  items: [{
    product: Schema.Types.ObjectId,
    quantity: Number,
  }]
}, { collection: "carts" });

async function runTest() {
  console.log("=== LUNORA CHECKOUT CONCURRENCY TEST SUITE ===\n");
  
  await mongoose.connect(MONGO_URI);
  console.log("- Connected directly to MongoDB.");

  const ProductModel = mongoose.model("ProductTest", ProductSchema);
  const CartModel = mongoose.model("CartTest", CartSchema);

  // 1. Fetch first product catalog
  const targetProduct = await ProductModel.findOne({});
  if (!targetProduct) {
    console.error("No products found in DB. Seed first.");
    await mongoose.disconnect();
    return;
  }

  const originalStock = targetProduct.stock;
  console.log(`- Target Product: "${targetProduct.name}" (ID: ${targetProduct._id}), Original Stock: ${originalStock}`);

  // 2. Set product stock to exactly 1
  targetProduct.stock = 1;
  await targetProduct.save();
  console.log("- Stock temporarily set to 1 in MongoDB.");

  // 3. Register two separate users
  const user1Email = `concur_user1_${Date.now()}@lunora.com`;
  const user2Email = `concur_user2_${Date.now()}@lunora.com`;
  const password = "Password123";

  async function registerUser(email) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Concurrency User", email, password }),
    });
    const body = await res.json();
    if (!body.success) throw new Error(`Registration failed: ${body.message}`);
    return { token: body.data.token, userId: body.data.user.id || body.data.user._id };
  }

  console.log("\n- Registering User 1 and User 2...");
  const u1 = await registerUser(user1Email);
  const u2 = await registerUser(user2Email);
  console.log(`  - User 1 Email: ${user1Email} (ID: ${u1.userId})`);
  console.log(`  - User 2 Email: ${user2Email} (ID: ${u2.userId})`);

  // 4. Seed carts for both users with 1 quantity of targetProduct
  async function seedCart(userId, productId) {
    let cart = await CartModel.findOne({ user: userId });
    if (!cart) {
      cart = new CartModel({ user: userId, items: [] });
    }
    cart.items = [{ product: productId, quantity: 1 }];
    await cart.save();
  }

  console.log("\n- Seeding shopping carts for both users directly in DB...");
  await seedCart(u1.userId, targetProduct._id);
  await seedCart(u2.userId, targetProduct._id);
  console.log("  - Carts seeded with 1 unit of product.");

  // 5. Fire concurrent POST checkout (COD) requests
  const shippingAddress = {
    name: "Concurrency Tester",
    street: "123 high-load drive",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560103",
    phone: "9988776655",
  };

  async function fireCheckout(token) {
    return fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shippingAddress,
        paymentMethod: "Cash on Delivery",
      }),
    });
  }

  console.log("\n- Triggering concurrent checkout requests simultaneously...");
  
  // Fire both requests in parallel
  const [res1, res2] = await Promise.all([
    fireCheckout(u1.token),
    fireCheckout(u2.token)
  ]);

  const body1 = await res1.json();
  const body2 = await res2.json();

  console.log("\n- Processing Results:");
  console.log(`  - User 1 checkout: Status = ${res1.status}, Success = ${body1.success}, Message = "${body1.message}"`);
  console.log(`  - User 2 checkout: Status = ${res2.status}, Success = ${body2.success}, Message = "${body2.message}"`);

  // Check states
  const oneSucceeded = (res1.status === 201 && body1.success) || (res2.status === 201 && body2.success);
  const oneFailed = (res1.status === 400 && !body1.success) || (res2.status === 400 && !body2.success);

  // Re-fetch product to check final stock
  const finalProduct = await ProductModel.findById(targetProduct._id);
  console.log(`\n- Final Product Stock in DB (Expected: 0): ${finalProduct.stock}`);

  if (oneSucceeded && oneFailed && finalProduct.stock === 0) {
    console.log("\n✅ SUCCESS: Concurrency check passed! Exactly one checkout succeeded, and stock did not undersell.");
  } else {
    console.error("\n❌ FAILURE: Concurrency verification failed.");
  }

  // Restore original stock
  finalProduct.stock = originalStock;
  await finalProduct.save();
  console.log("\n- Product original stock successfully restored in MongoDB.");

  await mongoose.disconnect();
}

runTest();
