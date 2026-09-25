import React from "react";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config/site";

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  title: "Shop All Luxury Gifts, Scented Candles & Hampers",
  description:
    "Explore Glimglee's complete collection of personalized gifts, hand-poured soy candles, artisan greeting cards, and floating glass keepsakes with pan-India express delivery.",
  keywords: [
    "shop gifts online",
    "personalized gift hampers",
    "scented soy candles India",
    "floating glass frames",
    "birthday gifts",
    "anniversary hampers",
    "buy gifts online India",
    "luxury gifting brand",
  ],
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop All Luxury Gifts & Hampers | Glimglee",
    description:
      "Curated luxury gifts, scented soy candles, and custom keepsakes hand-finished with love.",
    url: `${siteUrl}/shop`,
    siteName: "Glimglee",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop All Luxury Gifts & Hampers | Glimglee",
    description: "Curated luxury gifts, scented candles, and custom keepsakes hand-finished in India.",
  },
};

const shopSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${siteUrl}/shop#collection`,
  name: "Shop All Luxury Gifts & Hampers",
  description:
    "Explore Glimglee's complete collection of personalized gifts, scented candles, and keepsake frames.",
  url: `${siteUrl}/shop`,
  isPartOf: {
    "@type": "WebSite",
    name: "Glimglee",
    url: siteUrl,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Shop",
      item: `${siteUrl}/shop`,
    },
  ],
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(shopSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {children}
    </>
  );
}
