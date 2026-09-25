import React from "react";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://glimglee.com";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) — Orders & Delivery",
  description:
    "Find answers to common questions about Glimglee product personalization, delivery timelines across India, luxury packaging, and our 100% Happiness Guarantee.",
  keywords: [
    "Glimglee FAQ",
    "gifting questions",
    "personalized gift delivery time",
    "custom order help",
    "Glimglee replacement guarantee",
  ],
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | Glimglee",
    description:
      "All your questions answered about custom engravings, express courier transit, and luxury packaging.",
    url: `${siteUrl}/faq`,
    siteName: "Glimglee",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions (FAQ) | Glimglee",
    description: "All your questions answered about custom engravings, express transit, and luxury packaging.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does product personalization work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When you choose a customizable gift (such as our floating glass frames or custom candle labels), you will see live fields to upload your favorite photo, write a personalized message, and choose engraving fonts. Our team reviews your uploaded photo for clarity before high-resolution printing.",
      },
    },
    {
      "@type": "Question",
      name: "What are your delivery timelines and shipping rates across India & Worldwide?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We deliver across India and worldwide! For India, orders above ₹1,500 enjoy FREE Delivery (flat ₹100 for orders under ₹1,500), typically arriving in 3–5 business days. For International orders (190+ countries), orders above ₹5,000 get FREE Worldwide Delivery (flat ₹400 for orders under ₹5,000), arriving in 7–12 business days via express air courier.",
      },
    },
    {
      "@type": "Question",
      name: "Is luxury gift packaging included with every order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Every Glimglee hamper and keepsake is presented in our signature gift box, cushioned with festive crinkle shred, and finished with a complimentary handwritten greeting card.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Glimglee Happiness Guarantee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If any item arrives damaged or glass breaks during courier transit, send us a quick photo on WhatsApp (+91 80000 45464) or email care@glimglee.com. We dispatch an instant free replacement without hassle.",
      },
    },
    {
      "@type": "Question",
      name: "Can I place bulk orders for corporate gifting or weddings?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely! We customize corporate hampers with company logos, personalized gift sleeves, and bulk pan-India multi-address dispatch. Reach out through our Contact page or WhatsApp for bulk tier pricing.",
      },
    },
  ],
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
      name: "FAQ",
      item: `${siteUrl}/faq`,
    },
  ],
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
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
