export interface OccasionConfig {
  slug: string;
  queryTerm: string;
  name: string;
  h1: string;
  badge: string;
  description: string;
  seoDescription: string;
  keywords: string[];
  faqs: { q: string; a: string }[];
}

export const OCCASIONS_DATA: Record<string, OccasionConfig> = {
  "birthday-gifts": {
    slug: "birthday-gifts",
    queryTerm: "Birthday",
    name: "Birthday Gifts",
    h1: "Handcrafted Birthday Gifts & Luxury Hampers",
    badge: "Celebrate Another Beautiful Year",
    description:
      "Make their birthday unforgettable with personalized floating glass frames, artisan scented soy candles, and curated luxury gift hampers finished with handwritten cards.",
    seoDescription:
      "Shop handcrafted personalized birthday gifts & luxury hampers at Glimglee. Custom photo frames, scented candles & gift boxes with express pan-India delivery.",
    keywords: [
      "birthday gifts",
      "birthday gift hampers",
      "personalized birthday gifts India",
      "birthday gift for girlfriend",
      "birthday gift for boyfriend",
      "custom birthday gifts",
    ],
    faqs: [
      {
        q: "Can I customize birthday gifts with photos and personal messages?",
        a: "Yes! Most Glimglee birthday keepsakes—such as our floating glass frames and custom candle labels—allow you to upload high-resolution photos and input custom engraved text before ordering.",
      },
      {
        q: "What is the delivery timeline for birthday gift hampers?",
        a: "Orders in India typically arrive within 3–5 business days with live courier tracking. Orders above ₹1,500 enjoy free pan-India express shipping.",
      },
      {
        q: "Is luxury gift packaging included for birthdays?",
        a: "Every gift arrives wrapped in our signature matte black gift box, cushioned with crinkle shred, and finished with a complimentary handwritten birthday greeting card.",
      },
    ],
  },
  "anniversary-gifts": {
    slug: "anniversary-gifts",
    queryTerm: "Anniversary",
    name: "Anniversary Gifts",
    h1: "Romantic Anniversary Gifts & Keepsakes for Couples",
    badge: "Cherish Every Milestone Together",
    description:
      "Celebrate your journey with timeless personalized keepsakes. Hand-poured aroma candles, preserved memories in glass, and romantic couple hampers designed to rekindle the glow.",
    seoDescription:
      "Celebrate your love with personalized anniversary gifts & luxury hampers from Glimglee. Custom couple frames & candles with express pan-India delivery.",
    keywords: [
      "anniversary gifts",
      "couple anniversary gifts India",
      "wedding anniversary hampers",
      "romantic gifts for couple",
      "personalized anniversary frame",
    ],
    faqs: [
      {
        q: "What are the most popular anniversary gifts at Glimglee?",
        a: "Our handcrafted Floating Glass Photo Frames featuring couple portraits and our hand-poured Soy Aroma Candles are among our most cherished anniversary gifts.",
      },
      {
        q: "Can I include an anniversary date in the engraving?",
        a: "Yes! Our live customization fields let you specify your wedding or anniversary date, names, and a personal love quote.",
      },
    ],
  },
  "corporate-gifting": {
    slug: "corporate-gifting",
    queryTerm: "Corporate",
    name: "Corporate Gifting",
    h1: "Premium Corporate Gift Hampers & Executive Keepsakes",
    badge: "Elevate Professional Relationships",
    description:
      "Imprint a lasting impression on clients, leadership, and team members with artisan luxury gift boxes, branded scented candles, and premium desk keepsakes.",
    seoDescription:
      "Premium corporate gift hampers and executive keepsakes from Glimglee. Bulk business gifting with custom branding and pan-India multi-address delivery.",
    keywords: [
      "corporate gifting hampers India",
      "business gift boxes",
      "executive gift hampers",
      "client appreciation gifts",
      "employee onboarding hampers",
    ],
    faqs: [
      {
        q: "Do you offer corporate logo customization and bulk discounts?",
        a: "Yes! We provide tiered corporate pricing and custom logo branded sleeves/cards for bulk orders. Contact our concierge via WhatsApp or our Contact page for a quote.",
      },
      {
        q: "Can you dispatch corporate hampers to multiple addresses across India?",
        a: "Absolutely. We manage multi-destination express courier dispatch for remote teams and distributed clients across 20,000+ Indian pincodes.",
      },
    ],
  },
  "couple-gifts": {
    slug: "couple-gifts",
    queryTerm: "Couple",
    name: "Couple Gifts",
    h1: "Personalized Gifts for Couples & Meaningful Moments",
    badge: "Made for Two Hearts",
    description:
      "Discover heartfelt presents for engagements, weddings, housewarmings, or romantic date nights. Handcrafted personalized gifts that speak love without words.",
    seoDescription:
      "Handcrafted personalized couple gifts & hampers from Glimglee. Custom frames, romantic candles & keepsakes with pan-India express shipping.",
    keywords: [
      "couple gifts",
      "gifts for boyfriend",
      "gifts for girlfriend",
      "wedding gifts for couples",
      "handcrafted couple keepsakes",
    ],
    faqs: [
      {
        q: "Are couple photo frames break-resistant during courier shipping?",
        a: "All Glimglee floating glass keepsakes are secured in multi-layered foam cushioning and premium rigid boxes, backed by our 100% Free Transit Replacement Guarantee.",
      },
    ],
  },
};
