import React from "react";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://glimglee.com";

export const metadata: Metadata = {
  title: "Track Your Order — Live Courier Tracking",
  description:
    "Track your Glimglee gift order in real time. Enter your Order ID or phone number to check live dispatch and delivery updates.",
  keywords: [
    "track order",
    "Glimglee order tracking",
    "delivery status",
    "courier tracking India",
  ],
  alternates: {
    canonical: "/orders/track",
  },
  openGraph: {
    title: "Track Your Order | Glimglee Gifting",
    description: "Real-time delivery status and courier tracking for your Glimglee order.",
    url: `${siteUrl}/orders/track`,
    siteName: "Glimglee",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Your Order | Glimglee Gifting",
    description: "Real-time delivery status and courier tracking for your Glimglee order.",
  },
};

export default function OrderTrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
