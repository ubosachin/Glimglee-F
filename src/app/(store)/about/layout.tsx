import React from "react";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config/site";

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  title: "About Our Brand & Artisan Story",
  description:
    "Discover the story behind Glimglee. Handcrafted luxury gifting, personalized keepsakes, hand-poured soy candles, and meaningful moments created with love in India.",
  keywords: [
    "about Glimglee",
    "gifting brand story",
    "handcrafted gifts India",
    "luxury hampers India",
    "personalized gift artisans",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Glimglee — Modern Gifting, Made Personal",
    description:
      "Crafting tangible sparks of joy, warmth, and emotion that linger long after the unwrapping.",
    url: `${siteUrl}/about`,
    siteName: "Glimglee",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Glimglee — Modern Gifting, Made Personal",
    description: "Crafting tangible sparks of joy, warmth, and emotion with luxury personalized gifting.",
  },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${siteUrl}/about#webpage`,
  url: `${siteUrl}/about`,
  name: "About Glimglee Gifting",
  description:
    "The journey and artisan values of Glimglee — India's premier personalized luxury gifting brand.",
  mainEntity: {
    "@type": "Organization",
    name: "Glimglee",
    url: siteUrl,
    logo: `${siteUrl}/apple-icon.png`,
    description: "Modern Gifting, Made Personal.",
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
      name: "About Us",
      item: `${siteUrl}/about`,
    },
  ],
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutSchema),
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
