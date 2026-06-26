import type { MetadataRoute } from "next";
import { API_BASE } from "@/lib/api-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // List of static paths
  const staticPaths = [
    "",
    "/shop",
    "/wishlist",
    "/cart",
    "/login",
    "/register",
  ];

  const sitemapEntries = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1.0 : 0.8,
  }));

  try {
    // Fetch products from backend for dynamic URL indexation
    const res = await fetch(`${API_BASE}/products?limit=100`);
    const data = await res.json();
    if (data.success && data.data.products) {
      const productEntries = data.data.products.map((p: any) => ({
        url: `${baseUrl}/shop/${p.slug}`,
        lastModified: new Date(p.updatedAt || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
      return [...sitemapEntries, ...productEntries];
    }
  } catch (err) {
    console.error("Sitemap Generator: Failed to fetch products dynamically. Falling back to static paths.", err);
  }

  return sitemapEntries;
}
