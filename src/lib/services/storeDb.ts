export * from "./products";
export * from "./categories";
export * from "./orders";
export * from "./coupons";
export * from "./banners";
export * from "./inventory";

import {
  defaultCMS,
  defaultStoreSettings,
} from "@/lib/config/defaults";
import {
  Review,
  AuditLog,
  HomepageCMS,
  StoreSettings,
} from "@/lib/types";

// In-browser / server cache keys
const STORAGE_PREFIX = "glimglee_live_";
const LEGACY_PREFIX = "glimglee_db_";

class LocalDbStore {
  private memoryCache: Record<string, unknown> = {};

  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  private getKey(collectionName: string): string {
    return `${STORAGE_PREFIX}${collectionName}`;
  }

  public get<T>(collectionName: string, defaultValue: T): T {
    if (this.memoryCache[collectionName]) {
      return this.memoryCache[collectionName] as T;
    }

    if (this.isBrowser()) {
      try {
        const legacyKey = `${LEGACY_PREFIX}${collectionName}`;
        if (localStorage.getItem(legacyKey)) {
          localStorage.removeItem(legacyKey);
        }

        const raw = localStorage.getItem(this.getKey(collectionName));
        if (raw) {
          const parsed = JSON.parse(raw);
          this.memoryCache[collectionName] = parsed;
          return parsed as T;
        }
      } catch (e) {
        console.error("LocalDbStore read error:", e);
      }
    }

    this.memoryCache[collectionName] = defaultValue;
    return defaultValue;
  }

  public set<T>(collectionName: string, value: T): void {
    this.memoryCache[collectionName] = value;
    if (this.isBrowser()) {
      try {
        localStorage.setItem(this.getKey(collectionName), JSON.stringify(value));
      } catch (e) {
        console.error("LocalDbStore write error:", e);
      }
    }
  }

  public clear(): void {
    this.memoryCache = {};
    if (this.isBrowser()) {
      try {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
        keys.forEach((k) => localStorage.removeItem(k));
      } catch (e) {
        console.error("LocalDbStore clear error:", e);
      }
    }
  }
}

export const localDb = new LocalDbStore();

// -------------------------------------------------------------
// INVENTORY BRIDGE (Backward Compatibility)
// -------------------------------------------------------------
export async function adjustProductStock(
  productId: string,
  delta: number,
  reason: any,
  adminEmail: string = "system"
): Promise<boolean> {
  const { adjustStock } = await import("./inventory");
  const res = await adjustStock(
    productId,
    delta,
    (reason === "Order Placed" ? "Sale" : reason) as any,
    adminEmail
  );
  return res.success;
}

// -------------------------------------------------------------
// CMS
// -------------------------------------------------------------
export async function getCMSContent(): Promise<HomepageCMS> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/cms", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.cms) {
          localDb.set("cms", data.cms);
          return data.cms;
        }
      }
    } catch (e) {
      console.warn("Fetch /api/cms error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const doc = await db.collection("cms").findOne({ _id: "homepage" as any });
        if (doc) {
          const { _id, ...cms } = doc as any;
          return cms;
        }
      }
    } catch (e) {
      console.warn("Direct mongo getCMSContent error:", e);
    }
  }

  return localDb.get<HomepageCMS>("cms", defaultCMS);
}

export async function updateCMSContent(cms: HomepageCMS): Promise<HomepageCMS> {
  localDb.set("cms", cms);
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cms),
      });
    } catch (e) {
      console.error("POST /api/cms error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("cms").updateOne(
          { _id: "homepage" as any },
          { $set: { ...cms, updatedAt: new Date().toISOString() } },
          { upsert: true }
        );
      }
    } catch (e) {
      console.error("Direct mongo updateCMSContent error:", e);
    }
  }
  return cms;
}

// -------------------------------------------------------------
// STORE SETTINGS
// -------------------------------------------------------------
export async function getStoreSettings(): Promise<StoreSettings> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          localDb.set("settings", data.settings);
          return data.settings;
        }
      }
    } catch (e) {
      console.warn("Fetch /api/settings error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const doc = await db.collection("settings").findOne({ _id: "store" as any });
        if (doc) {
          const { _id, ...settings } = doc as any;
          return settings;
        }
      }
    } catch (e) {
      console.warn("Direct mongo getStoreSettings error:", e);
    }
  }

  return localDb.get<StoreSettings>("settings", defaultStoreSettings);
}

export async function updateStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
  localDb.set("settings", settings);
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch (e) {
      console.error("POST /api/settings error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("settings").updateOne(
          { _id: "store" as any },
          { $set: { ...settings, updatedAt: new Date().toISOString() } },
          { upsert: true }
        );
      }
    } catch (e) {
      console.error("Direct mongo updateStoreSettings error:", e);
    }
  }
  return settings;
}

// -------------------------------------------------------------
// REVIEWS
// -------------------------------------------------------------
export async function getReviews(productId?: string): Promise<Review[]> {
  let list: Review[] = [];

  if (typeof window !== "undefined") {
    try {
      const url = productId ? `/api/reviews?productId=${encodeURIComponent(productId)}` : "/api/reviews";
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.reviews)) {
          list = data.reviews;
        }
      }
    } catch (e) {
      console.warn("Fetch /api/reviews error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const filter: any = {};
        if (productId) filter.productId = productId;
        const docs = await db.collection<Review>("reviews").find(filter).sort({ createdAt: -1 }).toArray();
        list = docs;
      }
    } catch (e) {
      console.warn("Direct mongo getReviews error:", e);
    }
  }

  if (list.length === 0) {
    list = localDb.get<Review[]>("reviews", []);
  }

  if (productId) {
    return list.filter((r) => r.productId === productId && r.status === "approved");
  }
  return list;
}

export async function addReview(
  reviewData: Omit<Review, "id" | "createdAt" | "status">
): Promise<Review> {
  const newReview: Review = {
    ...reviewData,
    id: `rev-${Date.now()}`,
    status: "approved",
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });
    } catch (e) {
      console.error("POST /api/reviews error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("reviews").insertOne(newReview);
      }
    } catch (e) {
      console.error("Direct mongo addReview error:", e);
    }
  }

  const reviews = localDb.get<Review[]>("reviews", []);
  reviews.unshift(newReview);
  localDb.set("reviews", reviews);

  return newReview;
}

export async function updateReviewStatus(
  reviewId: string,
  status: Review["status"]
): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId, status }),
      });
    } catch (e) {
      console.error("PATCH /api/reviews error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("reviews").updateOne({ id: reviewId }, { $set: { status } });
      }
    } catch (e) {
      console.error("Direct mongo updateReviewStatus error:", e);
    }
  }

  const reviews = localDb.get<Review[]>("reviews", []);
  const rev = reviews.find((r) => r.id === reviewId);
  if (rev) {
    rev.status = status;
    localDb.set("reviews", reviews);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// AUDIT LOGS
// -------------------------------------------------------------
export async function logAdminAction(
  adminEmail: string,
  action: string,
  resource: AuditLog["resource"],
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> {
  const log: AuditLog = {
    id: `aud-${Date.now()}`,
    adminEmail,
    action,
    resource,
    resourceId,
    timestamp: new Date().toISOString(),
    details,
  };
  const logs = localDb.get<AuditLog[]>("auditLogs", []);
  logs.unshift(log);
  localDb.set("auditLogs", logs);
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return localDb.get<AuditLog[]>("auditLogs", []);
}
