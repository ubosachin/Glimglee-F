import { HomepageCMS, StoreSettings } from "@/lib/types";

export const defaultCMS: HomepageCMS = {
  announcement: "✨ Free Luxury Gift Wrapping on Orders Above ₹999",
  heroBadge: "Modern Gifting, Made Personal",
  heroHeading: "Make Every Moment Glow With Thoughtful Gifts.",
  heroSubheading: "Curated gift hampers, artisan soy candles, and custom keepsakes hand-finished with love for birthdays, anniversaries, and life's sweetest milestones.",
  heroPrimaryCtaText: "Explore Gifting",
  heroPrimaryCtaLink: "/shop",
  heroSecondaryCtaText: "Browse Collections",
  heroSecondaryCtaLink: "/categories",
  heroImage: "",
  trustHighlights: [
    {
      icon: "Sparkles",
      title: "Handcrafted With Care",
      description: "Every keepsake & hamper is carefully hand-packed with wax seals and ribbons.",
    },
    {
      icon: "ShieldCheck",
      title: "Safe Pan-India Delivery",
      description: "Bubble-armored courier packaging guaranteeing zero breakages across 20,000+ pincodes.",
    },
    {
      icon: "HeartHandshake",
      title: "Custom Personalization",
      description: "Live photo previews, laser engravings, and bespoke handwritten calligraphy notes.",
    },
    {
      icon: "Truck",
      title: "Express 24-48h Shipping",
      description: "Priority air dispatch available for celebrations and birthdays.",
    },
  ],
};

export const defaultStoreSettings: StoreSettings = {
  storeName: "Glimglee",
  supportEmail: "",
  supportPhone: "",
  currency: "INR",
  currencySymbol: "₹",
  taxRatePercent: 18,
  freeShippingThreshold: 999,
  standardShippingRate: 70,
  expressShippingRate: 150,
  giftWrapRate: 99,
  address: "",
};
