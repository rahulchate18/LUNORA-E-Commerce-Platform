import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Category } from "../models/category.js";
import { Product } from "../models/product.js";
// Resolve __dirname since we are in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load env variables
dotenv.config({ path: path.join(__dirname, "../../.env") });
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/lunora";
const categoriesData = [
    {
        name: "Tote Bags",
        slug: "tote-bags",
        description: "Spacious, chic, and perfect for carrying your daily essentials in style.",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Crossbody Bags",
        slug: "crossbody-bags",
        description: "Hands-free convenience meets modern high-fashion aesthetics.",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Backpacks",
        slug: "backpacks",
        description: "Premium leather and structured canvas backpacks designed for active urban living.",
        image: "https://images.unsplash.com/photo-1605733513597-a8f8d410fe3c?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Satchels & Handbags",
        slug: "satchels-handbags",
        description: "Structured classic handbags and sophisticated satchels for work or evening events.",
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    },
];
const productsData = [
    // Tote Bags
    {
        name: "Aria Pebble Leather Tote",
        description: "Crafted from fine full-grain pebbled leather, this unstructured tote features a spacious main compartment, internal zip pocket, and polished gold-tone hardware. The ideal companion for the modern professional.",
        shortDescription: "Timeless pebble leather tote with spacious interiors.",
        categoryName: "Tote Bags",
        price: 3499,
        originalPrice: 4999,
        stock: 25,
        images: [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Tan Brown", hex: "#b07d62" },
            { name: "Classic Black", hex: "#1a1a1a" }
        ],
        tags: ["leather", "tote", "work", "classic"],
        isFeatured: true,
        isNewArrival: true,
        isBestseller: true,
    },
    {
        name: "Siena Canvas Utility Tote",
        description: "Heavyweight water-resistant organic cotton canvas detailed with premium harness leather trims. Outfitted with multiple exterior slide pockets and a secure laptop sleeve for versatile daily transport.",
        shortDescription: "Rugged organic canvas tote with leather details.",
        categoryName: "Tote Bags",
        price: 1899,
        originalPrice: 2499,
        stock: 40,
        images: [
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Olive Green", hex: "#556b2f" },
            { name: "Cream White", hex: "#fffdd0" }
        ],
        tags: ["canvas", "tote", "casual", "utility"],
        isFeatured: false,
        isNewArrival: true,
        isBestseller: false,
    },
    {
        name: "Novara Suede Shoulder Bag",
        description: "Indulgently soft split suede finished with a magnetic top closure and a signature brushed brass buckle. Elegant slouchy silhouette drape that sits comfortably under the shoulder.",
        shortDescription: "Ultra-soft split suede shoulder bag with premium brass accents.",
        categoryName: "Tote Bags",
        price: 2999,
        originalPrice: 3799,
        stock: 15,
        images: [
            "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Emerald Green", hex: "#0f52ba" },
            { name: "Taupe Gray", hex: "#8b8589" }
        ],
        tags: ["suede", "shoulder", "luxury", "slouchy"],
        isFeatured: true,
        isNewArrival: false,
        isBestseller: true,
    },
    // Crossbody Bags
    {
        name: "Milano Quilted Chain Crossbody",
        description: "Impeccable diamond quilting on premium lambskin leather. Styled with an elegant sliding woven chain strap that adjusts for double-handle shoulder carriage or long crossbody style.",
        shortDescription: "Diamond quilted lambskin bag with sliding chain strap.",
        categoryName: "Crossbody Bags",
        price: 4299,
        originalPrice: 4999,
        stock: 12,
        images: [
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Noir Black", hex: "#0d0d0d" },
            { name: "Burgundy Wine", hex: "#800020" }
        ],
        tags: ["quilted", "chain", "evening", "crossbody"],
        isFeatured: true,
        isNewArrival: true,
        isBestseller: true,
    },
    {
        name: "Stella Saddle Crossbody",
        description: "Classic equestrian curved silhouette fashioned from stiff smooth saddle leather. Built with a front flap pocket under the magnetic strap and a full-length adjustable strap.",
        shortDescription: "Curved equestrian saddle bag in smooth structured leather.",
        categoryName: "Crossbody Bags",
        price: 2499,
        originalPrice: 3299,
        stock: 30,
        images: [
            "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Cognac Brown", hex: "#9b583c" },
            { name: "Mustard Yellow", hex: "#e1ad01" }
        ],
        tags: ["saddle", "crossbody", "vintage", "daily"],
        isFeatured: false,
        isNewArrival: false,
        isBestseller: false,
    },
    {
        name: "Luna Half-Moon Sling",
        description: "Compact half-moon silhouette with structured contours. Features dual zipper tabs, internal credit card slots, and a rear slip pocket for smartphone convenience.",
        shortDescription: "Chic minimalist half-moon sling bag.",
        categoryName: "Crossbody Bags",
        price: 1599,
        originalPrice: 1999,
        stock: 50,
        images: [
            "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Blush Pink", hex: "#ffc0cb" },
            { name: "Bone White", hex: "#e3dac9" }
        ],
        tags: ["minimalist", "sling", "trendy", "half-moon"],
        isFeatured: true,
        isNewArrival: true,
        isBestseller: false,
    },
    // Backpacks
    {
        name: "Verona Leather Laptop Backpack",
        description: "Sophisticated travel/work companion featuring a padded 15-inch laptop slot, quick-access front pockets, and ergonomic padded shoulder straps. Handmade with premium full-grain leather.",
        shortDescription: "Ergonomic leather business backpack with laptop sleeve.",
        categoryName: "Backpacks",
        price: 4899,
        originalPrice: 5999,
        stock: 10,
        images: [
            "https://images.unsplash.com/photo-1605733513597-a8f8d410fe3c?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Chocolate Brown", hex: "#3d2314" },
            { name: "Slate Grey", hex: "#708090" }
        ],
        tags: ["backpack", "travel", "laptop", "office"],
        isFeatured: true,
        isNewArrival: false,
        isBestseller: true,
    },
    {
        name: "Como Drawstring Mini Backpack",
        description: "Playful micro backpack styled with dynamic drawcord top and security flap closure. Handcrafted in lightweight calfskin for casual strolls and weekend excursions.",
        shortDescription: "Cute drawstring calfskin leather mini backpack.",
        categoryName: "Backpacks",
        price: 1999,
        originalPrice: 2799,
        stock: 22,
        images: [
            "https://images.unsplash.com/photo-1566150905458-1bf1fc15a6a0?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Soft Lilac", hex: "#db99db" },
            { name: "Crimson Red", hex: "#dc143c" }
        ],
        tags: ["backpack", "mini", "casual", "cute"],
        isFeatured: false,
        isNewArrival: true,
        isBestseller: false,
    },
    {
        name: "Garda Canvas Commuter Pack",
        description: "Weather-resistant waxed canvas body with premium leather snap-down flaps. Generous capacity features dual compartments, external drink sleeve, and breathable mesh back.",
        shortDescription: "Waxed canvas commuter pack with drink sleeves.",
        categoryName: "Backpacks",
        price: 2199,
        originalPrice: 2999,
        stock: 35,
        images: [
            "https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Khaki Tan", hex: "#c3b091" },
            { name: "Charcoal Black", hex: "#36454f" }
        ],
        tags: ["canvas", "backpack", "commute", "waxed"],
        isFeatured: false,
        isNewArrival: false,
        isBestseller: true,
    },
    // Satchels & Handbags
    {
        name: "Florence Box Satchel",
        description: "Exquisite structured box satchel designed with clean geometric profiles, rigid top carry handle, and optional crossbody strap. Fully lined with micro-suede interior.",
        shortDescription: "Structured geometric box satchel with top handle.",
        categoryName: "Satchels & Handbags",
        price: 3899,
        originalPrice: 4799,
        stock: 18,
        images: [
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Rich Ivory", hex: "#fffff0" },
            { name: "Midnight Navy", hex: "#191970" }
        ],
        tags: ["satchel", "structured", "elegant", "handbag"],
        isFeatured: true,
        isNewArrival: true,
        isBestseller: true,
    },
    {
        name: "Palermo Suede Bucket Bag",
        description: "Slouchy design with flat rigid bottom. Fastened with polished leather drawcord and customized internal zipper compartment. Extremely lightweight for all-day comfort.",
        shortDescription: "Suede bucket bag with leather drawstring.",
        categoryName: "Satchels & Handbags",
        price: 2799,
        originalPrice: 3499,
        stock: 16,
        images: [
            "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Caramel Suede", hex: "#c68e17" },
            { name: "Hunter Green", hex: "#355e3b" }
        ],
        tags: ["bucket-bag", "suede", "slouchy", "casual"],
        isFeatured: false,
        isNewArrival: false,
        isBestseller: false,
    },
    {
        name: "Lucca Micro Carryall",
        description: "Perfectly scaled-down iconic top-handle bag. Featuring textured Saffiano leather finish, double structured handles, and protective metal feet at the bottom base.",
        shortDescription: "Miniature top-handle handbag in Saffiano leather.",
        categoryName: "Satchels & Handbags",
        price: 1799,
        originalPrice: 2299,
        stock: 28,
        images: [
            "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Teal Green", hex: "#008080" },
            { name: "Dusty Rose", hex: "#cca9a8" }
        ],
        tags: ["micro", "handbag", "saffiano", "chic"],
        isFeatured: true,
        isNewArrival: true,
        isBestseller: false,
    },
];
const seedDB = async () => {
    try {
        console.log("Connecting to MongoDB for seeding...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully.");
        // Clear existing collections
        console.log("Clearing Categories...");
        await Category.deleteMany({});
        console.log("Clearing Products...");
        await Product.deleteMany({});
        // Seed Categories
        console.log("Seeding Categories...");
        const createdCategories = await Category.insertMany(categoriesData);
        console.log(`Successfully seeded ${createdCategories.length} categories.`);
        // Map Category name to ObjectId
        const categoryMap = new Map();
        for (const cat of createdCategories) {
            categoryMap.set(cat.name, cat._id);
        }
        // Prepare Products with correct category ObjectIds
        console.log("Preparing Products...");
        const preparedProducts = productsData.map((prod) => {
            const catId = categoryMap.get(prod.categoryName);
            if (!catId) {
                throw new Error(`Category "${prod.categoryName}" not found in seeded categories.`);
            }
            const mappedImages = prod.images.map((img, idx) => {
                return {
                    url: img,
                    secure_url: img,
                    publicId: `seeded_img_${idx}_${Math.random().toString(36).substring(2, 8)}`,
                    width: 800,
                    height: 1000,
                    format: "jpg",
                    bytes: 145000,
                    alt: prod.name,
                    isPrimary: idx === 0,
                    uploadedAt: new Date()
                };
            });
            return {
                name: prod.name,
                description: prod.description,
                shortDescription: prod.shortDescription,
                category: catId,
                price: prod.price,
                originalPrice: prod.originalPrice,
                stock: prod.stock,
                images: mappedImages,
                colors: prod.colors,
                tags: prod.tags,
                isFeatured: prod.isFeatured,
                isNewArrival: prod.isNewArrival,
                isBestseller: prod.isBestseller,
            };
        });
        // Seed Products (slug and sku will be created in pre-save hook)
        console.log("Seeding Products...");
        for (const prod of preparedProducts) {
            await Product.create(prod);
        }
        console.log(`Successfully seeded ${preparedProducts.length} products.`);
        console.log("Database successfully seeded with realistic LUNORA products!");
        process.exit(0);
    }
    catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};
seedDB();
//# sourceMappingURL=seed.js.map