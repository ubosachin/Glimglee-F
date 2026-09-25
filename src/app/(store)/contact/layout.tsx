import React from "react";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://glimglee.com";

export const metadata: Metadata = {
  title: "Contact Gifting Concierge & Support",
  description:
    "Get in touch with Glimglee for custom order assistance, corporate gifting hampers, bulk wedding orders, or tracking your gift. Friendly pan-India support via WhatsApp, phone & email.",
  keywords: [
    "contact Glimglee",
    "gifting customer support",
    "corporate gift inquiries",
    "wedding gift customization",
    "Glimglee phone number",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Gifting Concierge | Glimglee",
    description:
      "We're here to help you craft the perfect gift. Reach out for custom designs, corporate hampers, and priority support.",
    url: `${siteUrl}/contact`,
    siteName: "Glimglee",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Gifting Concierge | Glimglee",
    description: "Reach out for custom designs, corporate hampers, and priority gifting support.",
  },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${siteUrl}/contact#webpage`,
  url: `${siteUrl}/contact`,
  name: "Contact Glimglee Gifting Concierge",
  description:
    "Direct contact details and support channels for Glimglee customer care and corporate gifting.",
  mainEntity: {
    "@type": "Organization",
    name: "Glimglee",
    url: siteUrl,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+918000045464",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
        email: "care@glimglee.com",
      },
    ],
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
      name: "Contact Us",
      item: `${siteUrl}/contact`,
    },
  ],
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactSchema),
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
