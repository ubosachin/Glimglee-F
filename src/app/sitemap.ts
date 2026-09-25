import { MetadataRoute } from "next";
import { getProducts } from "@/lib/services/products";
import { getCategories } from "@/lib/services/categories";
import { SITE_URL } from "@/lib/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/orders/track`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/shipping-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/return-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts({ limitCount: 1000 }),
    ]);

    categoryRoutes = categories.map((c) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    productRoutes = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
      changeFrequency: "daily",
      priority: 0.95,
      images: p.images && p.images.length > 0 ? p.images.slice(0, 3) : undefined,
    }));
  } catch (error) {
    console.error("Failed to generate dynamic sitemap routes:", error);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
