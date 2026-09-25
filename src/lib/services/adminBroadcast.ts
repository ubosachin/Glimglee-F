import { BroadcastProductItem } from "@/lib/types";

export interface BroadcastPayload {
  action: "test_connection" | "save_settings" | "send_test" | "send_broadcast" | "preview_html";
  gmailUser?: string;
  gmailAppPassword?: string;
  gmailSenderName?: string;
  testEmail?: string;
  subject?: string;
  preheader?: string;
  badge?: string;
  heading?: string;
  bodyText?: string;
  heroImageUrl?: string;
  featuredProducts?: BroadcastProductItem[];
  promoCouponCode?: string;
  couponDiscountText?: string;
  ctaText?: string;
  ctaLink?: string;
}

export async function getBroadcastInfo() {
  try {
    const res = await fetch("/api/admin/broadcast", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load broadcast info");
    return await res.json();
  } catch (error: any) {
    console.error("getBroadcastInfo error:", error);
    return {
      totalRecipients: 0,
      settings: { gmailUser: "", gmailSenderName: "Glimglee Gifting", hasGoogleAppPassword: false },
      history: [],
    };
  }
}

export async function postBroadcast(payload: BroadcastPayload) {
  const res = await fetch("/api/admin/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Broadcast action failed");
  }
  return data;
}
