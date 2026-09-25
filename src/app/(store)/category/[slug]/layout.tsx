import React from "react";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/services/categories";
import { SITE_URL } from "@/lib/config/site";

interface CategoryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = SITE_URL;

  try {
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return {
        title: "Collection Not Found | Glimglee Gifting",
        description: "Explore our collection of handcrafted luxury gifts, scented soy candles, and personalized keepsakes at Glimglee.",
        robots: { index: false, follow: true },
      };
    }

    const title = `${category.name} Gifts & Hampers — Buy Online | Glimglee`;
    const description =
      category.description?.slice(0, 160) ||
      `Explore Glimglee's handcrafted ${category.name} collection. Personalized gift hampers, custom keepsakes, and luxury gifts with pan-India express delivery.`;

    const canonicalUrl = `${siteUrl}/category/${category.slug}`;
    const primaryImage =
      category.imageUrl ||
      category.image ||
      `${siteUrl}/opengraph-image`;

    return {
      title,
      description,
      keywords: [
        category.name,
        `${category.name} gifts`,
        `${category.name} hampers`,
        "personalized gifting India",
        "luxury gifts",
        "Glimglee",
      ],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "Glimglee",
        type: "website",
        locale: "en_IN",
        images: [
          {
            url: primaryImage,
            width: 1200,
            height: 630,
            alt: `${category.name} Collection — Glimglee`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [primaryImage],
        creator: "@glimglee",
      },
    };
  } catch (error) {
    console.error("Failed to generate category metadata:", error);
    return {
      title: "Gift Collections & Hampers | Glimglee",
      description: "Handcrafted luxury gifting, personalized frames, and scented soy candles.",
    };
  }
}

export default async function CategoryLayout({
  children,
  params,
}: CategoryLayoutProps) {
  const { slug } = await params;
  const siteUrl = SITE_URL;

  let collectionSchema = null;
  let breadcrumbSchema = null;

  try {
    const category = await getCategoryBySlug(slug);

    if (category) {
      const canonicalUrl = `${siteUrl}/category/${category.slug}`;

      collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#collection`,
        name: `${category.name} Gifts & Hampers`,
        description:
          category.description ||
          `Handcrafted ${category.name} gift collection at Glimglee.`,
        url: canonicalUrl,
        isPartOf: {
          "@type": "WebSite",
          name: "Glimglee",
          url: siteUrl,
        },
      };

      breadcrumbSchema = {
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
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: canonicalUrl,
          },
        ],
      };
    }
  } catch (error) {
    console.error("Failed to generate category schema:", error);
  }

  return (
    <>
      {collectionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionSchema),
          }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
      )}
      {children}
    </>
  );
}
