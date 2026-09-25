import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { CartProvider } from "@/lib/cart/CartContext";
import { WishlistProvider } from "@/lib/wishlist/WishlistContext";
import { ToastProvider } from "@/components/ui/Toast";
import { StorageAutoPurger } from "@/components/ui/StorageAutoPurger";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://glimglee.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": `${siteUrl}/#organization`,
  name: "Glimglee",
  url: siteUrl,
  logo: `${siteUrl}/apple-icon.png`,
  description: "India's premier personalized luxury gifting brand. Handcrafted hampers, scented soy candles, floating glass frames, and artisan greeting cards.",
  email: "care@glimglee.com",
  telephone: "+918000045464",
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Credit Card, Debit Card, UPI, Net Banking, Cash on Delivery",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
  sameAs: [
    "https://instagram.com/glimglee",
    "https://facebook.com/glimglee",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+918000045464",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: "Glimglee",
  alternateName: "Glimglee Gifting",
  publisher: {
    "@id": `${siteUrl}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Glimglee — Modern Gifting, Made Personal | Luxury Hampers & Keepsakes",
    template: "%s | Glimglee",
  },
  description: "Thoughtfully crafted luxury hampers, scented soy candles, artisan greeting cards, and personalized floating glass frames hand-finished with love across India.",
  keywords: [
    "gifts",
    "personalized gifts",
    "gift hampers",
    "scented soy candles",
    "greeting cards",
    "personalized frames",
    "floating glass frame",
    "couple gifts",
    "birthday gifts India",
    "anniversary gift hampers",
    "luxury gifting brand",
    "glimglee",
  ],
  authors: [{ name: "Glimglee", url: siteUrl }],
  creator: "Glimglee",
  publisher: "Glimglee",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Glimglee — Modern Gifting, Made Personal",
    description: "Make every celebration unforgettable with curated luxury hampers, custom keepsakes, and personalized gifts crafted with love in India.",
    url: siteUrl,
    siteName: "Glimglee",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glimglee — Modern Gifting, Made Personal",
    description: "Luxury hampers, scented candles, custom frames & personalized gifts hand-finished in India.",
    creator: "@glimglee",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Glimglee",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#faf8f5] max-w-full overflow-x-hidden">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var keysToRemove = [];
                for (var i = 0; i < localStorage.length; i++) {
                  var k = localStorage.key(i);
                  if (k && (k.indexOf("glimglee_db_") === 0 || k === "glimglee_mock_orders")) {
                    keysToRemove.push(k);
                  }
                }
                for (var j = 0; j < keysToRemove.length; j++) {
                  localStorage.removeItem(keysToRemove[j]);
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${fontSans.variable} font-sans min-h-full flex flex-col text-stone-900 antialiased max-w-full overflow-x-hidden`}>
        <StorageAutoPurger />
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                {children}
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
