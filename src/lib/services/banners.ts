import { Banner } from "@/lib/types";

const LOCAL_KEY = "glimglee_live_banners";
const LEGACY_KEY = "glimglee_db_banners";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let bannersCache: CacheEntry<Banner[]> | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60s TTL

export function invalidateBannersCache() {
  bannersCache = null;
}

function getLocalBanners(): Banner[] {
  if (typeof window === "undefined") return [];
  try {
    if (localStorage.getItem(LEGACY_KEY)) {
      localStorage.removeItem(LEGACY_KEY);
    }
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list;
  } catch {
    return [];
  }
}

function saveLocalBanners(banners: Banner[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(banners));
    } catch (e) {
      console.error("Failed to save local banners:", e);
    }
  }
}

export async function getBanners(placement?: Banner["placement"]): Promise<Banner[]> {
  const now = Date.now();
  let list: Banner[] = [];

  if (bannersCache && now - bannersCache.timestamp < CACHE_TTL_MS) {
    list = bannersCache.data;
  } else {
    if (typeof window === "undefined") {
      try {
        const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
        if (isMongoConfigured) {
          const db = await getDb();
          const filter: any = {};
          if (placement) filter.placement = placement;
          const docs = await db
            .collection<Banner>("banners")
            .find(filter)
            .sort({ priority: 1, createdAt: -1 })
            .toArray();
          list = docs;
        }
      } catch (e) {
        console.warn("Direct mongo getBanners error:", e);
      }
    } else {
      try {
        const url = placement ? `/api/banners?placement=${encodeURIComponent(placement)}` : "/api/banners";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.banners)) {
            list = data.banners;
          }
        }
      } catch (e) {
        console.warn("Fetch /api/banners error:", e);
      }
    }

    if (list.length === 0) {
      list = getLocalBanners();
    }

    if (list.length > 0) {
      bannersCache = {
        data: list,
        timestamp: now,
      };
      if (typeof window !== "undefined") {
        saveLocalBanners(list);
      }
    }
  }

  const sorted = [...list].sort((a, b) => (a.priority ?? 10) - (b.priority ?? 10));

  if (placement) {
    return sorted.filter((b) => b.placement === placement);
  }

  return sorted;
}

export async function getActiveBanners(placement?: Banner["placement"]): Promise<Banner[]> {
  const all = await getBanners(placement);
  return all.filter((b) => b.active !== false);
}

export async function saveBanner(banner: Partial<Banner> & { id?: string }): Promise<Banner> {
  const id = banner.id || `bnr_${Date.now()}`;
  const fullBanner: Banner = {
    id,
    title: banner.title || "Special Gifting Offer",
    subtitle: banner.subtitle || "",
    badge: banner.badge,
    imageUrl: banner.imageUrl || "",
    mobileImageUrl: banner.mobileImageUrl,
    ctaText: banner.ctaText || "Explore Gifts",
    ctaLink: banner.ctaLink || "/shop",
    priority: banner.priority ?? 1,
    active: banner.active ?? true,
    placement: banner.placement || "hero",
  };

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullBanner),
      });
    } catch (e) {
      console.warn("POST /api/banners error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("banners").updateOne(
          { id },
          { $set: fullBanner },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn("Direct mongo saveBanner error:", e);
    }
  }

  const local = getLocalBanners();
  const idx = local.findIndex((b) => b.id === id);
  if (idx >= 0) {
    local[idx] = fullBanner;
  } else {
    local.push(fullBanner);
  }
  saveLocalBanners(local);
  invalidateBannersCache();
  return fullBanner;
}

export async function deleteBanner(id: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.warn("DELETE /api/banners error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("banners").deleteOne({ id });
      }
    } catch (e) {
      console.warn("Direct mongo deleteBanner error:", e);
    }
  }

  const local = getLocalBanners().filter((b) => b.id !== id);
  saveLocalBanners(local);
  invalidateBannersCache();
  return true;
}
