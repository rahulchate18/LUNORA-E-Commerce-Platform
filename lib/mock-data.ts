/**
 * lib/mock-data.ts — LUNORA Product Mock Data
 *
 * 12 realistic bag products across 6 categories.
 * Images: Unsplash CDN (images.unsplash.com) — no API key needed.
 * Pricing: Indian Rupees ₹799 – ₹4,999.
 *
 * Helper functions are pure / synchronous (no async needed with mock data).
 * In Phase 3 these are replaced by API calls to the Express backend.
 */

import type {
  Product,
  Category,
  SortOption,
  ShopFilters,
  PaginationInfo,
} from "@/types";
import { PRODUCTS_PER_PAGE } from "@/types";

// ─── Unsplash image URL builder ───────────────────────────────────────────────
const img = (id: string, w = 700, h = 875) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// ─── Shared review pool ───────────────────────────────────────────────────────
const makeReview = (
  id: string,
  author: string,
  rating: number,
  title: string,
  body: string,
  daysAgo: number,
  verified = true
) => ({
  id,
  author,
  avatar: author.slice(0, 2).toUpperCase(),
  rating,
  title,
  body,
  date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  verified,
});

// ─── Product Data ─────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  // ── Tote Bags ──────────────────────────────────────────────────────────────
  {
    id: "p001",
    slug: "classic-canvas-tote",
    name: "Classic Canvas Tote",
    shortDescription: "Everyday elegance in a spacious, eco-conscious tote.",
    description:
      "The Classic Canvas Tote is your perfect everyday companion. Crafted from premium 16oz cotton canvas with reinforced leather handles, it's built to carry your world in style. The interior features a zip pocket and two slip pockets for easy organisation. Fits A4 documents, a 13\" laptop, and all your everyday essentials.",
    category: "tote-bags",
    price: 1299,
    originalPrice: 1599,
    discount: 19,
    images: [
      img("1548036161-18d672841aa6"),
      img("1583623025-23-bb31-4a55-a4b2-a9b63b1b9a71"),
      img("1622560480605-d83c853bc5be"),
    ],
    colors: [
      { name: "Natural", hex: "#E8DCC8" },
      { name: "Charcoal", hex: "#3D3D3D" },
      { name: "Sage", hex: "#8FAF8B" },
    ],
    rating: 4.7,
    reviewCount: 128,
    stock: 45,
    sku: "LUN-TOT-001",
    tags: ["canvas", "everyday", "eco-friendly", "spacious"],
    material: "16oz Cotton Canvas, Leather handles",
    dimensions: "40cm × 35cm × 12cm",
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    reviews: [
      makeReview("r1", "Priya Sharma", 5, "My favourite purchase!", "This tote goes everywhere with me — office, market, beach. Incredibly sturdy and the natural colour is so versatile.", 12),
      makeReview("r2", "Ananya M.", 5, "Perfect size", "Fits my laptop, lunch box, and gym clothes. The leather handles feel premium.", 30),
      makeReview("r3", "Ritu K.", 4, "Great quality, slight delay", "Quality is exceptional. Delivery took a day longer than expected but worth the wait.", 45),
    ],
  },

  {
    id: "p002",
    slug: "premium-leather-tote",
    name: "Premium Leather Tote",
    shortDescription: "Full-grain leather that gets better with every use.",
    description:
      "Handcrafted from vegetable-tanned full-grain leather, this tote develops a beautiful patina over time. The structured base keeps it upright, while the magnetic closure keeps everything secure. Interior includes a suede-lined laptop sleeve (fits up to 15\"), zip pocket, and four card slots. A true investment piece.",
    category: "tote-bags",
    price: 3499,
    images: [
      img("1590874103328-eac38a683ce7"),
      img("1553062407-98eeb64c6a62"),
      img("1547949003-9792a18a2601"),
    ],
    colors: [
      { name: "Tan", hex: "#C4956A" },
      { name: "Cognac", hex: "#9B4A2D" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    rating: 4.9,
    reviewCount: 64,
    stock: 18,
    sku: "LUN-TOT-002",
    tags: ["leather", "premium", "work", "patina"],
    material: "Full-grain vegetable-tanned leather, suede lining",
    dimensions: "42cm × 32cm × 14cm",
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    reviews: [
      makeReview("r4", "Kavitha R.", 5, "Worth every rupee", "The leather quality is absolutely stunning. I've been using it daily for 6 months and it only looks better.", 20),
      makeReview("r5", "Deepa V.", 5, "Luxury at its finest", "Gifted this to my sister and she hasn't stopped using it. Packaging was also immaculate.", 55),
      makeReview("r6", "Swathi N.", 4, "Beautiful but heavy", "The quality is unbeatable but it's a bit heavy when empty. Still worth 5 stars.", 70),
    ],
  },

  {
    id: "p003",
    slug: "minimal-everyday-tote",
    name: "Minimal Everyday Tote",
    shortDescription: "Clean lines, lightweight design, effortless style.",
    description:
      "Less is more with the Minimal Everyday Tote. Made from water-resistant nylon with leather trim, this lightweight bag carries up to 10kg without weighing you down. The clean silhouette pairs with any outfit — from workwear to weekends. Features a hidden back pocket for your phone or transit card.",
    category: "tote-bags",
    price: 1899,
    originalPrice: 2299,
    discount: 17,
    images: [
      img("1584917865442-de89df76afd3"),
      img("1548036161-18d672841aa6"),
      img("1622560480605-d83c853bc5be"),
    ],
    colors: [
      { name: "Ivory", hex: "#F5F0E8" },
      { name: "Stone", hex: "#C4B9A8" },
      { name: "Midnight", hex: "#2C2C3E" },
    ],
    rating: 4.5,
    reviewCount: 89,
    stock: 32,
    sku: "LUN-TOT-003",
    tags: ["minimal", "lightweight", "water-resistant", "nylon"],
    material: "Water-resistant nylon, genuine leather trim",
    dimensions: "38cm × 30cm × 10cm",
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    reviews: [
      makeReview("r7", "Meera G.", 5, "Perfect everyday bag", "I bought this for my daily commute and it's been flawless. Lightweight but holds so much!", 8),
      makeReview("r8", "Sneha P.", 4, "Love the minimal look", "Really clean and stylish. The ivory colour is exactly as shown in photos.", 22),
      makeReview("r9", "Lakshmi B.", 4, "Good quality", "Solid construction. The hidden back pocket is genius.", 40),
    ],
  },

  // ── Handbags ───────────────────────────────────────────────────────────────
  {
    id: "p004",
    slug: "structured-mini-handbag",
    name: "Structured Mini Handbag",
    shortDescription: "Compact, polished, and powerfully chic.",
    description:
      "Make a statement with this structured mini handbag. The rigid shell construction in premium PU leather holds its shape perfectly, while the gold-tone hardware adds a touch of luxury. Includes a detachable chain strap for shoulder or crossbody wear. Fits your phone, cards, keys, and lipstick — everything you actually need.",
    category: "handbags",
    price: 2199,
    originalPrice: 2799,
    discount: 21,
    images: [
      img("1553062407-98eeb64c6a62"),
      img("1566150905458-1bf1aca0ad44"),
      img("1590874103328-eac38a683ce7"),
    ],
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Blush", hex: "#E8C4B8" },
    ],
    rating: 4.6,
    reviewCount: 103,
    stock: 27,
    sku: "LUN-HND-001",
    tags: ["structured", "mini", "party", "chain-strap"],
    material: "Premium PU leather, gold-tone hardware",
    dimensions: "22cm × 16cm × 8cm",
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    reviews: [
      makeReview("r10", "Nidhi S.", 5, "Absolutely gorgeous", "Got so many compliments at a wedding. The chain is sturdy and the closure is satisfying.", 15),
      makeReview("r11", "Pooja A.", 5, "Perfect size", "Fits everything I need for a night out without being bulky. Love the gold hardware.", 28),
      makeReview("r12", "Rekha M.", 4, "Good quality", "The bag is beautiful. I wish it had one more interior pocket but overall very happy.", 50),
    ],
  },

  {
    id: "p005",
    slug: "quilted-chain-handbag",
    name: "Quilted Chain Handbag",
    shortDescription: "Timeless quilting with modern-luxury attitude.",
    description:
      "Inspired by classic European couture, this quilted handbag features the signature diamond-stitched pattern in soft lambskin-feel leather. The woven gold chain handle is comfortable on the shoulder and adds a statement to any look. A spacious interior with a mirror pocket makes this as practical as it is beautiful.",
    category: "handbags",
    price: 3999,
    images: [
      img("1566150905458-1bf1aca0ad44"),
      img("1590874103328-eac38a683ce7"),
      img("1553062407-98eeb64c6a62"),
    ],
    colors: [
      { name: "Beige", hex: "#E8D5B7" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Dusty Rose", hex: "#D4A0A0" },
    ],
    rating: 4.8,
    reviewCount: 51,
    stock: 14,
    sku: "LUN-HND-002",
    tags: ["quilted", "chain", "luxury", "designer-inspired"],
    material: "Lambskin-feel PU leather, woven metal chain",
    dimensions: "25cm × 18cm × 7cm",
    isFeatured: true,
    isNew: false,
    isBestseller: false,
    reviews: [
      makeReview("r13", "Aisha K.", 5, "Looks like ₹40,000", "Honestly can't believe this cost ₹3,999. The quilting is perfect and the chain feels solid.", 10),
      makeReview("r14", "Fatima B.", 5, "Designer vibes", "Everyone thinks it's a designer bag. Quality is impressive for the price.", 35),
      makeReview("r15", "Zara S.", 4, "Beautiful but small", "Gorgeous bag but wish it was slightly larger. Perfect for evenings though.", 60),
    ],
  },

  {
    id: "p006",
    slug: "evening-clutch-bag",
    name: "Evening Clutch Bag",
    shortDescription: "Shimmering elegance for your most special moments.",
    description:
      "Turn heads at every occasion with this handcrafted evening clutch. The exterior features a subtle metallic weave that catches light beautifully, complemented by a gold-tone frame and push-lock closure. Lined in soft satin, it holds your essentials with grace. Includes a removable wrist strap for versatile carry.",
    category: "handbags",
    price: 1599,
    images: [
      img("1547949003-9792a18a2601"),
      img("1584917865442-de89df76afd3"),
      img("1491637639811-60e2756cc1c7"),
    ],
    colors: [
      { name: "Gold", hex: "#D4A55A" },
      { name: "Silver", hex: "#C0C0C0" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    rating: 4.4,
    reviewCount: 76,
    stock: 38,
    sku: "LUN-HND-003",
    tags: ["clutch", "evening", "party", "metallic", "wedding"],
    material: "Metallic woven fabric, satin lining",
    dimensions: "28cm × 14cm × 5cm",
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    reviews: [
      makeReview("r16", "Divya N.", 5, "Perfect wedding clutch", "Carried this at three weddings already. Gets better with each wear.", 18),
      makeReview("r17", "Preethi L.", 4, "Lovely but delicate", "Very pretty. Just be careful with it — the weave can snag.", 42),
      makeReview("r18", "Megha S.", 5, "Exceeded expectations", "Photos don't do it justice. The metallic sheen is stunning in person.", 65),
    ],
  },

  // ── Sling Bags ─────────────────────────────────────────────────────────────
  {
    id: "p007",
    slug: "crossbody-sling-bag",
    name: "Crossbody Sling Bag",
    shortDescription: "Hands-free freedom without sacrificing style.",
    description:
      "The perfect companion for days on the move. This crossbody sling features an adjustable strap (60–120cm), a secure zip closure, and two front pockets for easy access. The anti-scratch interior lining protects your phone and essentials. Lightweight at just 280g — you'll forget you're wearing it.",
    category: "sling-bags",
    price: 1499,
    originalPrice: 1899,
    discount: 21,
    images: [
      img("1491637639811-60e2756cc1c7"),
      img("1566150905458-1bf1aca0ad44"),
      img("1548036161-18d672841aa6"),
    ],
    colors: [
      { name: "Tan", hex: "#C4956A" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Rust", hex: "#A0522D" },
    ],
    rating: 4.6,
    reviewCount: 142,
    stock: 55,
    sku: "LUN-SLG-001",
    tags: ["crossbody", "hands-free", "travel", "lightweight"],
    material: "Vegan leather, nylon lining",
    dimensions: "22cm × 15cm × 6cm",
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    reviews: [
      makeReview("r19", "Ankita V.", 5, "Best travel bag", "Wore this across 4 cities. Never once worried about my belongings. Great quality.", 7),
      makeReview("r20", "Sonal M.", 5, "Obsessed with this bag", "The tan colour is perfect. Gets better with use, love the patina forming.", 21),
      makeReview("r21", "Tara N.", 4, "Great everyday sling", "Really well made. Strap adjustment is smooth and secure.", 38),
    ],
  },

  {
    id: "p008",
    slug: "boho-woven-sling",
    name: "Boho Woven Sling",
    shortDescription: "Artisan-crafted weave meets everyday functionality.",
    description:
      "Handwoven by skilled artisans, this bohemian sling bag blends traditional craft with modern design. The natural jute-cotton weave is lined with printed cotton fabric and features a secure zip top and inner phone pocket. An adjustable braided strap completes the earthy, free-spirited aesthetic.",
    category: "sling-bags",
    price: 999,
    originalPrice: 1299,
    discount: 23,
    images: [
      img("1548036161-18d672841aa6"),
      img("1491637639811-60e2756cc1c7"),
      img("1566150905458-1bf1aca0ad44"),
    ],
    colors: [
      { name: "Natural Brown", hex: "#8B6914" },
      { name: "Earthy Tan", hex: "#C4956A" },
      { name: "Forest Green", hex: "#4A6741" },
    ],
    rating: 4.3,
    reviewCount: 97,
    stock: 62,
    sku: "LUN-SLG-002",
    tags: ["boho", "woven", "artisan", "jute", "handmade"],
    material: "Jute-cotton weave, cotton lining",
    dimensions: "24cm × 18cm × 8cm",
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    reviews: [
      makeReview("r22", "Vrinda K.", 5, "Unique and beautiful", "So different from mass-produced bags. Love that artisans made this.", 14),
      makeReview("r23", "Poornima S.", 4, "Pretty but not very durable", "The bag looks amazing but the weave at the base is loosening slightly. Still love it.", 33),
      makeReview("r24", "Lakshmi R.", 4, "Great boho aesthetic", "Exactly what I wanted for my beach holiday. Gets lots of attention!", 55),
    ],
  },

  // ── Laptop Bags ────────────────────────────────────────────────────────────
  {
    id: "p009",
    slug: "professional-laptop-bag",
    name: "Professional Laptop Bag",
    shortDescription: "Carry your career in polished, purposeful style.",
    description:
      "Engineered for the modern professional woman. This laptop bag fits up to a 15.6\" laptop in its padded, fleece-lined sleeve. Six interior compartments organise your charger, notebooks, pens, and documents. The trolley sleeve slides over luggage handles for seamless travel. Available with a padded shoulder strap and top handles.",
    category: "laptop-bags",
    price: 2999,
    images: [
      img("1611532736597-de2d4265fba3"),
      img("1547949003-9792a18a2601"),
      img("1553062407-98eeb64c6a62"),
    ],
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Charcoal", hex: "#3D3D3D" },
      { name: "Navy", hex: "#1B2A4A" },
    ],
    rating: 4.7,
    reviewCount: 83,
    stock: 29,
    sku: "LUN-LAP-001",
    tags: ["laptop", "office", "professional", "organised"],
    material: "Ballistic nylon, faux leather trim",
    dimensions: "40cm × 30cm × 12cm",
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    reviews: [
      makeReview("r25", "Nisha J.", 5, "Every working woman needs this", "Fits my 15\" MacBook perfectly. The organisation inside is brilliant.", 9),
      makeReview("r26", "Archana L.", 5, "Professional and stylish", "Looks sharp in meetings. Colleagues keep asking where I got it.", 25),
      makeReview("r27", "Surbhi D.", 4, "Great but heavy when full", "Excellent quality. Gets heavy with a laptop and water bottle, but that's expected.", 48),
    ],
  },

  {
    id: "p010",
    slug: "vegan-leather-laptop-tote",
    name: "Vegan Leather Laptop Tote",
    shortDescription: "Work-ready luxury, ethically crafted.",
    description:
      "The perfect fusion of boardroom-ready sophistication and ethical production. Crafted from plant-based vegan leather that looks and feels like the real thing. The structured silhouette houses a padded 14\" laptop compartment, while the roomy main section handles your daily essentials. Features a gold-tone zip for a polished finish.",
    category: "laptop-bags",
    price: 3499,
    originalPrice: 3999,
    discount: 13,
    images: [
      img("1560472354-b33ff0ad4a2a"),
      img("1611532736597-de2d4265fba3"),
      img("1547949003-9792a18a2601"),
    ],
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Tan", hex: "#C4956A" },
    ],
    rating: 4.8,
    reviewCount: 47,
    stock: 21,
    sku: "LUN-LAP-002",
    tags: ["vegan", "leather", "laptop", "ethical", "work"],
    material: "Plant-based vegan leather, recycled lining",
    dimensions: "38cm × 28cm × 12cm",
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    reviews: [
      makeReview("r28", "Anika B.", 5, "Ethical and gorgeous", "Love that it's vegan. Feels premium and looks incredible.", 11),
      makeReview("r29", "Devika T.", 5, "Best laptop bag I've owned", "Finally a laptop bag that doesn't look like a laptop bag!", 27),
      makeReview("r30", "Richa M.", 4, "Nearly perfect", "Stunning bag. Wish the laptop pocket was slightly larger for my 15\" screen.", 43),
    ],
  },

  // ── Travel Bags ────────────────────────────────────────────────────────────
  {
    id: "p011",
    slug: "weekend-travel-duffle",
    name: "Weekend Travel Duffle",
    shortDescription: "Pack your weekend into one effortlessly stylish bag.",
    description:
      "Adventure-ready without sacrificing elegance. The Weekend Travel Duffle is built for 2-3 day trips, featuring a main compartment with a shoe pocket, a wet-dry separation compartment, and multiple interior organiser pockets. The padded shoulder strap and reinforced top handles make it comfortable to carry through airports and hotels alike.",
    category: "travel-bags",
    price: 4499,
    images: [
      img("1513475382585-d06e58bcb0e0"),
      img("1547949003-9792a18a2601"),
      img("1611532736597-de2d4265fba3"),
    ],
    colors: [
      { name: "Black", hex: "#1A1A1A" },
      { name: "Brown", hex: "#6B4226" },
      { name: "Olive", hex: "#6B6B3A" },
    ],
    rating: 4.7,
    reviewCount: 38,
    stock: 16,
    sku: "LUN-TRV-001",
    tags: ["travel", "duffle", "weekend", "gym", "luggage"],
    material: "Canvas, genuine leather accents",
    dimensions: "55cm × 28cm × 28cm | 35L",
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    reviews: [
      makeReview("r31", "Smriti A.", 5, "Perfect weekend bag", "Used this for a Goa trip. Fits everything, looks great at the airport, no damage.", 16),
      makeReview("r32", "Kiran P.", 5, "Built to last", "The canvas quality is exceptional. Feels like it'll last years.", 34),
      makeReview("r33", "Nalini G.", 4, "Love it, slight concern", "Great bag. The bottom reinforcement feels solid. A dedicated dirty clothes pocket would be nice.", 58),
    ],
  },

  // ── Accessories ────────────────────────────────────────────────────────────
  {
    id: "p012",
    slug: "mini-coin-pouch-set",
    name: "Mini Coin Pouch Set",
    shortDescription: "Three elegant pouches for cards, coins, and daily essentials.",
    description:
      "This curated set of three zippered pouches is a must-have for every handbag. Use the large pouch for makeup, the medium for cables and earphones, and the small for cards and coins. All three are made from the same premium vegan leather as our bags, with a matching branded zip pull. A perfect gift too.",
    category: "accessories",
    price: 799,
    originalPrice: 999,
    discount: 20,
    images: [
      img("1601924994987-69e26d50dc26"),
      img("1491637639811-60e2756cc1c7"),
      img("1548036161-18d672841aa6"),
    ],
    colors: [
      { name: "Black Set", hex: "#1A1A1A" },
      { name: "Blush Set", hex: "#E8C4B8" },
      { name: "Tan Set", hex: "#C4956A" },
    ],
    rating: 4.5,
    reviewCount: 211,
    stock: 120,
    sku: "LUN-ACC-001",
    tags: ["pouch", "organiser", "gift", "set", "accessories"],
    material: "Vegan leather, zip closure",
    dimensions: "Small: 10×8cm | Medium: 18×12cm | Large: 22×15cm",
    isFeatured: false,
    isNew: false,
    isBestseller: true,
    reviews: [
      makeReview("r34", "Kritika V.", 5, "Best gift ever", "Gifted this to my mom and she uses all three daily. Excellent quality.", 5),
      makeReview("r35", "Bhavna J.", 5, "Highly recommend", "The set is perfectly sized. The zipper is smooth and the leather is soft.", 19),
      makeReview("r36", "Mitali R.", 4, "Very practical", "Love the organisation this adds to my tote. The blush set is gorgeous.", 37),
    ],
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return PRODUCTS;
  try {
    const stored = localStorage.getItem("lunora_admin_products");
    return stored ? JSON.parse(stored) : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

/** Return all products */
export function getAllProducts(): Product[] {
  return getStoredProducts();
}

/** Return a single product by slug, or null */
export function getProductBySlug(slug: string): Product | null {
  return getStoredProducts().find((p) => p.slug === slug) ?? null;
}

/** Return featured products */
export function getFeaturedProducts(): Product[] {
  return getStoredProducts().filter((p) => p.isFeatured);
}

/** Return bestseller products */
export function getBestsellers(): Product[] {
  return getStoredProducts().filter((p) => p.isBestseller);
}

/** Return related products (same category, excluding self) */
export function getRelatedProducts(
  productId: string,
  category: Category,
  limit = 4
): Product[] {
  return getStoredProducts().filter(
    (p) => p.category === category && p.id !== productId
  ).slice(0, limit);
}

/** Apply filters, sort, and paginate. Returns sliced page + pagination info. */
export function queryProducts(filters: Omit<import("@/types").ShopFilters, never>): {
  products: Product[];
  pagination: import("@/types").PaginationInfo;
} {
  let result = [...getStoredProducts()];

  // Category filter
  if (filters.category) {
    result = result.filter((p) => p.category === filters.category);
  }

  // Search query
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Price range
  if (filters.priceMin !== undefined) {
    result = result.filter((p) => p.price >= filters.priceMin!);
  }
  if (filters.priceMax !== undefined) {
    result = result.filter((p) => p.price <= filters.priceMax!);
  }

  // Sort
  const sort: SortOption = filters.sort ?? "featured";
  switch (sort) {
    case "newest":
      result = result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    case "price-asc":
      result = result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result = result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result = result.sort((a, b) => b.rating - a.rating);
      break;
    case "featured":
    default:
      result = result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      break;
  }

  // Pagination
  const totalItems = result.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(
    Math.max(1, filters.page ?? 1),
    totalPages
  );
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const products = result.slice(start, start + PRODUCTS_PER_PAGE);

  return {
    products,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
  };
}

/** Format price in Indian Rupees */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
