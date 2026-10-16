import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  const standardDisallow = [
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
    "/order-success/",
    "/login",
    "/register",
    "/forgot-password",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: standardDisallow,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: standardDisallow,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: standardDisallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
