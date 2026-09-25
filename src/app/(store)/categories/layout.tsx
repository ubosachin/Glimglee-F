import React from "react";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://glimglee.com";

export const metadata: Metadata = {
  title: "Gift Collections & Curated Hampers by Occasion",
  description:
    "Discover luxury gifting collections curated by occasion and relationship: Birthdays, Anniversaries, Romantic Dates, Scented Candles, and Corporate Gift Hampers.",
  keywords: [
    "gift collections",
    "birthday gift hampers",
    "anniversary gifts",
    "scented candles India",
    "personalized frames",
    "couple gift boxes",
    "luxury gifting brand",
  ],
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "Gift Collections & Curated Hampers | Glimglee",
    description:
      "Browse gifts by occasion, recipient, and category. Handcrafted keepsakes made personal in India.",
    url: `${siteUrl}/categories`,
    siteName: "Glimglee",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gift Collections & Curated Hampers | Glimglee",
    description: "Browse gifts by occasion, recipient, and category. Hand-finished with love.",
  },
};

const categoriesSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${siteUrl}/categories#collection`,
  name: "All Gift Collections & Curated Hampers",
  description:
    "Explore luxury gifting collections by occasion, recipient, and craft.",
  url: `${siteUrl}/categories`,
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
      name: "Categories",
      item: `${siteUrl}/categories`,
    },
  ],
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categoriesSchema),
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
