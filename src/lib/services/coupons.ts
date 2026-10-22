import { Coupon } from "@/lib/types";

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "cpn_glow10",
    code: "GLOW10",
    description: "Get 10% off on your handcrafted gifting order (Max discount ₹250)",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 499,
    maxDiscount: 250,
    startDate: "2025-01-01T00:00:00.000Z",
    expiryDate: "2027-12-31T23:59:59.999Z",
    usageLimit: 1000,
    usageCount: 14,
    active: true,
    autoApply: false,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "cpn_welcome50",
    code: "WELCOME50",
    description: "Flat ₹50 OFF for all new celebration seekers",
    discountType: "fixed",
    discountValue: 50,
    minOrderValue: 299,
    maxDiscount: 50,
    startDate: "2025-01-01T00:00:00.000Z",
    expiryDate: "2027-12-31T23:59:59.999Z",
    usageLimit: 500,
    usageCount: 32,
    active: true,
    autoApply: false,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "cpn_festive500",
    code: "FESTIVE500",
    description: "Flat ₹500 OFF on luxury festive hampers above ₹2,499",
    discountType: "fixed",
    discountValue: 500,
    minOrderValue: 2499,
    maxDiscount: 500,
    startDate: "2025-01-01T00:00:00.000Z",
    expiryDate: "2027-12-31T23:59:59.999Z",
    usageLimit: 200,
    usageCount: 8,
    active: true,
    autoApply: false,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "cpn_magic15",
    code: "MAGIC15",
    description: "Auto-applies 15% discount for orders above ₹1,499",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 1499,
    maxDiscount: 400,
    startDate: "2025-01-01T00:00:00.000Z",
    expiryDate: "2027-12-31T23:59:59.999Z",
    usageLimit: 300,
    usageCount: 21,
    active: true,
    autoApply: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

const LOCAL_KEY = "glimglee_live_coupons";
const LEGACY_KEY = "glimglee_db_coupons";

function getLocalCoupons(): Coupon[] {
  if (typeof window === "undefined") return DEFAULT_COUPONS;
  try {
    if (localStorage.getItem(LEGACY_KEY)) {
      localStorage.removeItem(LEGACY_KEY);
    }
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(DEFAULT_COUPONS));
      return DEFAULT_COUPONS;
    }
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(DEFAULT_COUPONS));
      return DEFAULT_COUPONS;
    }
    return list;
  } catch {
    return DEFAULT_COUPONS;
  }
}

function saveLocalCoupons(coupons: Coupon[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(coupons));
      window.dispatchEvent(new CustomEvent("glimglee_coupons_updated", { detail: coupons }));
    } catch (e) {
      console.error("Failed to save local coupons:", e);
    }
  }
}

function normalizeExpiry(dateStr?: string): Date | null {
  if (!dateStr) return null;
  // If only YYYY-MM-DD, set to 23:59:59.999
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return new Date(`${dateStr.trim()}T23:59:59.999Z`);
  }
  return new Date(dateStr);
}

export async function getCoupons(): Promise<Coupon[]> {
  let list: Coupon[] = [];

  if (typeof window === "undefined") {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const docs = await db.collection<Coupon>("coupons").find({}).sort({ createdAt: -1 }).toArray();
        if (docs.length > 0) {
          list = docs;
        } else {
          // Seed defaults
          try {
            await db.collection("coupons").insertMany(DEFAULT_COUPONS as any);
            list = DEFAULT_COUPONS;
          } catch {
            list = DEFAULT_COUPONS;
          }
        }
      } else {
        list = DEFAULT_COUPONS;
      }
    } catch (e) {
      console.warn("Direct mongo getCoupons error:", e);
      list = DEFAULT_COUPONS;
    }
  } else {
    try {
      const res = await fetch("/api/coupons", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.coupons) && data.coupons.length > 0) {
          list = data.coupons;
        }
      }
    } catch (e) {
      console.warn("Fetch /api/coupons error:", e);
    }
  }

  if (list.length === 0) {
    list = getLocalCoupons();
  }

  return list;
}

/**
 * Returns only active, unexpired coupons available for customers
 */
export async function getAvailableCoupons(): Promise<Coupon[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/coupons?available=true", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.coupons)) {
          return data.coupons;
        }
      }
    } catch (e) {
      console.warn("Client getAvailableCoupons live fetch error:", e);
    }
  }

  const coupons = await getCoupons();
  const now = new Date();

  return coupons.filter((c) => {
    if (!c.active) return false;
    const expiry = normalizeExpiry(c.expiryDate);
    if (expiry && expiry < now) return false;
    if (c.startDate && new Date(c.startDate) > now) return false;
    if (c.usageLimit && (c.usageCount || 0) >= c.usageLimit) return false;
    return true;
  });
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  const clean = (code || "").trim().toUpperCase();

  if (!clean) {
    return { valid: false, discountAmount: 0, message: "Please enter a coupon code." };
  }

  // Live real-time check against MongoDB via API in browser
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean, subtotal }),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn("Client live coupon validation API error, using local fallback:", e);
    }
  }

  const coupons = await getCoupons();
  const found = coupons.find((c) => c.code.toUpperCase() === clean);

  if (!found) {
    return { valid: false, discountAmount: 0, message: `Coupon "${clean}" is invalid.` };
  }

  if (!found.active) {
    return { valid: false, discountAmount: 0, message: `Coupon "${found.code}" is no longer active.` };
  }

  const now = new Date();
  const expiry = normalizeExpiry(found.expiryDate);
  if (expiry && expiry < now) {
    return { valid: false, discountAmount: 0, message: `Coupon "${found.code}" has expired.` };
  }

  if (found.startDate && new Date(found.startDate) > now) {
    return { valid: false, discountAmount: 0, message: `Coupon "${found.code}" is not yet active.` };
  }

  if (found.minOrderValue && subtotal < found.minOrderValue) {
    const diff = found.minOrderValue - subtotal;
    return {
      valid: false,
      discountAmount: 0,
      message: `Add ₹${diff.toLocaleString("en-IN")} more to use coupon "${found.code}" (Min order ₹${found.minOrderValue.toLocaleString("en-IN")}).`,
    };
  }

  if (found.usageLimit && (found.usageCount || 0) >= found.usageLimit) {
    return { valid: false, discountAmount: 0, message: `Coupon "${found.code}" usage limit has been reached.` };
  }

  let discountAmount = 0;
  if (found.discountType === "percentage") {
    discountAmount = Math.round((subtotal * found.discountValue) / 100);
    if (found.maxDiscount && found.maxDiscount > 0 && discountAmount > found.maxDiscount) {
      discountAmount = found.maxDiscount;
    }
  } else {
    discountAmount = Math.min(found.discountValue, subtotal);
  }

  return {
    valid: true,
    coupon: found,
    discountAmount,
    message: `Coupon ${found.code} applied! Saved ₹${discountAmount.toLocaleString("en-IN")}.`,
  };
}

/**
 * Finds the best active auto-applicable coupon for a given cart subtotal
 */
export async function getAutoApplicableCoupon(subtotal: number): Promise<CouponValidationResult | null> {
  const coupons = await getCoupons();
  const now = new Date();

  // Filter valid auto-apply coupons
  const candidates = coupons.filter((c) => {
    if (!c.active || !c.autoApply) return false;
    const expiry = normalizeExpiry(c.expiryDate);
    if (expiry && expiry < now) return false;
    if (c.startDate && new Date(c.startDate) > now) return false;
    if (c.minOrderValue && subtotal < c.minOrderValue) return false;
    if (c.usageLimit && (c.usageCount || 0) >= c.usageLimit) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  // Calculate discount for each candidate and pick the best savings
  let bestCoupon: Coupon | null = null;
  let maxDiscount = 0;

  for (const c of candidates) {
    let disc = 0;
    if (c.discountType === "percentage") {
      disc = Math.round((subtotal * c.discountValue) / 100);
      if (c.maxDiscount && c.maxDiscount > 0 && disc > c.maxDiscount) {
        disc = c.maxDiscount;
      }
    } else {
      disc = Math.min(c.discountValue, subtotal);
    }

    if (disc > maxDiscount) {
      maxDiscount = disc;
      bestCoupon = c;
    }
  }

  if (!bestCoupon || maxDiscount <= 0) return null;

  return {
    valid: true,
    coupon: bestCoupon,
    discountAmount: maxDiscount,
    message: `Auto-applied: ${bestCoupon.code} (Saved ₹${maxDiscount.toLocaleString("en-IN")})`,
  };
}

export async function saveCoupon(coupon: Partial<Coupon> & { id?: string }): Promise<Coupon> {
  const id = coupon.id || `cpn_${Date.now()}`;
  const now = new Date().toISOString();

  const fullCoupon: Coupon = {
    id,
    code: (coupon.code || "SAVE10").toUpperCase().trim(),
    discountType: coupon.discountType || "percentage",
    discountValue: Number(coupon.discountValue ?? 10),
    minOrderValue: Number(coupon.minOrderValue ?? 0),
    maxDiscount: Number(coupon.maxDiscount ?? 500),
    startDate: coupon.startDate || now,
    expiryDate: coupon.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    usageLimit: Number(coupon.usageLimit ?? 1000),
    usageCount: Number(coupon.usageCount ?? 0),
    active: coupon.active ?? true,
    autoApply: coupon.autoApply ?? false,
    description: coupon.description || "",
    applicableCategories: coupon.applicableCategories || [],
    createdAt: coupon.createdAt || now,
    updatedAt: now,
  };

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullCoupon),
      });
    } catch (e) {
      console.warn("POST /api/coupons error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const { _id, ...safeCoupon } = fullCoupon as any;
        await db.collection("coupons").updateOne(
          { id },
          { $set: safeCoupon },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn("Direct mongo saveCoupon error:", e);
    }
  }

  const local = getLocalCoupons();
  const idx = local.findIndex((c) => c.id === id);
  if (idx >= 0) {
    local[idx] = fullCoupon;
  } else {
    local.unshift(fullCoupon);
  }
  saveLocalCoupons(local);

  return fullCoupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.warn("DELETE /api/coupons error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("coupons").deleteOne({
          $or: [{ id }, { code: id.trim().toUpperCase() }],
        });
      }
    } catch (e) {
      console.warn("Direct mongo deleteCoupon error:", e);
    }
  }

  const local = getLocalCoupons().filter((c) => c.id !== id);
  saveLocalCoupons(local);
  return true;
}

/**
 * Increments coupon usage count when an order is created or confirmed
 */
export async function recordCouponUsage(code?: string): Promise<void> {
  if (!code) return;
  const clean = code.trim().toUpperCase();

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/coupons/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean }),
      });
    } catch (e) {
      console.warn("Failed to call /api/coupons/usage:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("coupons").updateOne(
          { code: clean },
          { $inc: { usageCount: 1 } }
        );
      }
    } catch (e) {
      console.warn("Direct mongo coupon usage error:", e);
    }
  }

  // Update local storage
  if (typeof window !== "undefined") {
    const local = getLocalCoupons();
    const item = local.find((c) => c.code.toUpperCase() === clean);
    if (item) {
      item.usageCount = (item.usageCount || 0) + 1;
      saveLocalCoupons(local);
    }
  }
}

/**
 * Random code generator utility for admin
 */
export function generateCouponCode(type: "percentage" | "fixed" = "percentage", value: number = 10): string {
  const prefixes = ["GLOW", "SAVE", "FESTIVE", "MAGIC", "GIFT", "SPECIAL", "TREAT"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = value > 0 ? value : Math.floor(100 + Math.random() * 900);
  return `${prefix}${suffix}`;
}
