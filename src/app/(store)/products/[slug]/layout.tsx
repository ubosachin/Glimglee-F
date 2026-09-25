import React from "react";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/services/products";

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://glimglee.com";

  try {
    const product = await getProductBySlug(slug);

    if (!product) {
      return {
        title: "Product Not Found | Glimglee Gifting",
        description: "Explore our collection of handcrafted luxury gifts, scented soy candles, and personalized keepsakes at Glimglee.",
        robots: { index: false, follow: true },
      };
    }

    const title = `${product.name} — Buy Online | Glimglee Personalized Gifts`;
    const description =
      product.shortDescription ||
      product.description?.slice(0, 160) ||
      `Buy ${product.name} online at Glimglee. Handcrafted personalized gifting with luxury gift box packaging and fast pan-India express delivery.`;

    const canonicalUrl = `${siteUrl}/products/${product.slug}`;
    const primaryImage = product.images?.[0] || `${siteUrl}/opengraph-image`;

    return {
      title,
      description,
      keywords: [
        product.name,
        product.category || "Personalized Gifts",
        "buy online India",
        "custom gift",
        "luxury gift hamper",
        "Glimglee gifts",
        ...(product.tags || []),
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
            width: 800,
            height: 800,
            alt: product.name,
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
    console.error("Failed to generate product metadata:", error);
    return {
      title: "Handcrafted Luxury Gift | Glimglee",
      description: "Discover curated personalized gifts, hampers, and scented candles at Glimglee.",
    };
  }
}

export default async function ProductLayout({
  children,
  params,
}: ProductLayoutProps) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://glimglee.com";

  let productSchema = null;
  let breadcrumbSchema = null;

  try {
    const product = await getProductBySlug(slug);

    if (product) {
      const canonicalUrl = `${siteUrl}/products/${product.slug}`;
      const categorySlug = product.categoryId || "gifts";
      const categoryName = product.category || "Gifts";

      productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        name: product.name,
        description:
          product.shortDescription ||
          product.description?.slice(0, 300) ||
          product.name,
        image: product.images && product.images.length > 0 ? product.images : [`${siteUrl}/opengraph-image`],
        sku: product.id,
        mpn: product.sku || product.id,
        brand: {
          "@type": "Brand",
          name: "Glimglee",
        },
        offers: {
          "@type": "Offer",
          url: canonicalUrl,
          priceCurrency: "INR",
          price: product.price,
          priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          availability:
            (product.inventory ?? 10) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: "Glimglee",
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              value: product.price >= 1500 ? 0 : 100,
              currency: "INR",
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "IN",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              businessDays: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ],
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: 2,
                maxValue: 5,
                unitCode: "d",
              },
            },
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "IN",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 7,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating || 5.0,
          reviewCount: Math.max(product.reviewCount || 1, 1),
          bestRating: "5",
          worstRating: "1",
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
            name: categoryName,
            item: `${siteUrl}/category/${categorySlug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: canonicalUrl,
          },
        ],
      };
    }
  } catch (error) {
    console.error("Failed to generate product schema:", error);
  }

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
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
