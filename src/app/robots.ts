import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://glimglee.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/products/",
          "/category/",
          "/categories",
          "/about",
          "/contact",
          "/faq",
          "/orders/track",
          "/privacy-policy",
          "/terms",
          "/shipping-policy",
          "/return-policy",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/checkout",
          "/checkout/",
          "/cart",
          "/account",
          "/account/",
          "/wishlist",
          "/orders",
          "/orders/",
          "/login",
          "/register",
          "/forgot-password",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/checkout/",
          "/cart",
          "/account/",
          "/wishlist",
          "/login",
          "/register",
          "/forgot-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
