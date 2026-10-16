import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/config/site";
import { OCCASIONS_DATA, OccasionConfig } from "@/lib/config/occasions";

interface OccasionLayoutProps {
  children: React.ReactNode;
  params: Promise<{ occasion: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ occasion: string }>;
}): Promise<Metadata> {
  const { occasion } = await params;
  const config = OCCASIONS_DATA[occasion];
  const siteUrl = SITE_URL;

  if (!config) {
    return {
      title: "Occasion Gifts Not Found | Glimglee Gifting",
      description: "Explore our collection of handcrafted luxury gifts, scented soy candles, and personalized keepsakes at Glimglee.",
      robots: { index: false, follow: true },
    };
  }

  const title = `${config.name} & Luxury Hampers`;
  const canonicalUrl = `${siteUrl}/occasions/${config.slug}`;

  return {
    title,
    description: config.seoDescription,
    keywords: config.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${config.name} & Luxury Hampers | Glimglee`,
      description: config.seoDescription,
      url: canonicalUrl,
      siteName: "Glimglee",
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${config.name} — Glimglee`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.name} & Luxury Hampers | Glimglee`,
      description: config.seoDescription,
      images: [`${siteUrl}/opengraph-image`],
      creator: "@glimglee",
    },
  };
}

export default async function OccasionLayout({
  children,
  params,
}: OccasionLayoutProps) {
  const { occasion } = await params;
  const config = OCCASIONS_DATA[occasion];
  const siteUrl = SITE_URL;

  if (!config) {
    notFound();
  }

  const canonicalUrl = `${siteUrl}/occasions/${config.slug}`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonicalUrl}#collection`,
    name: `${config.name} & Luxury Hampers`,
    description: config.seoDescription,
    url: canonicalUrl,
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
        name: "Occasions",
        item: `${siteUrl}/categories`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: config.name,
        item: canonicalUrl,
      },
    ],
  };

  const faqSchema =
    config.faqs && config.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: config.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}
      {children}
    </>
  );
}
