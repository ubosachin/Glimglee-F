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

export const metadata: Metadata = {
  title: "Glimglee — Modern Gifting, Made Personal",
  description: "Thoughtfully crafted luxury hampers, scented soy candles, artisan greeting cards, and personalized frames hand-finished with love.",
  keywords: ["gifts", "gift hampers", "candles", "greeting cards", "personalized frames", "couple gifts", "india gifting", "glimglee"],
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
  openGraph: {
    title: "Glimglee — Modern Gifting, Made Personal",
    description: "Make every moment glow with India's favorite personalized gifting brand.",
    siteName: "Glimglee",
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
