/**
 * Glimglee Site Configuration & Canonical URL Normalizer
 * Guarantees zero trailing slashes to prevent Googlebot 308 redirect loops and sitemap errors.
 */

const rawEnvUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

// The definitive production canonical origin is always https://www.glimglee.com
export const SITE_URL = (
  rawEnvUrl && !rawEnvUrl.includes("vercel.app")
    ? rawEnvUrl
    : "https://www.glimglee.com"
).replace(/\/+$/, "");

export const BRAND_NAME = "Glimglee";
export const BRAND_LEGAL_NAME = "Glimglee Technologies Pvt. Ltd.";
export const BRAND_TAGLINE = "Modern Gifting, Made Personal";
export const BRAND_DESCRIPTION =
  "Official Glimglee Store. India's premier personalized luxury gifting brand. Handcrafted hampers, scented soy candles, floating glass frames, and artisan greeting cards with pan-India & worldwide delivery.";

export const BRAND_PHONE = "+918000045464";
export const BRAND_EMAIL = "care@glimglee.com";

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/glimglee",
  facebook: "https://facebook.com/glimglee",
};

/**
 * Helper to produce valid, single-slashed canonical URLs
 */
export function getCanonicalUrl(path = ""): string {
  if (!path || path === "/") return SITE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}
