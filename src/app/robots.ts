import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

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
