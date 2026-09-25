import { Coupon } from "@/lib/types";

const LOCAL_KEY = "glimglee_live_coupons";
const LEGACY_KEY = "glimglee_db_coupons";

function getLocalCoupons(): Coupon[] {
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

function saveLocalCoupons(coupons: Coupon[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(coupons));
    } catch (e) {
      console.error("Failed to save local coupons:", e);
    }
  }
}

export async function getCoupons(): Promise<Coupon[]> {
  let list: Coupon[] = [];

  if (typeof window === "undefined") {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const docs = await db.collection<Coupon>("coupons").find({}).sort({ createdAt: -1 }).toArray();
        list = docs;
      }
    } catch (e) {
      console.warn("Direct mongo getCoupons error:", e);
    }
  } else {
    try {
      const res = await fetch("/api/coupons", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.coupons)) {
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

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  const coupons = await getCoupons();
  const clean = code.trim().toUpperCase();
  const found = coupons.find((c) => c.code.toUpperCase() === clean);

  if (!found) {
    return { valid: false, discountAmount: 0, message: "Invalid coupon code." };
  }

  if (!found.active) {
    return { valid: false, discountAmount: 0, message: "This coupon is no longer active." };
  }

  const now = new Date();
  if (found.expiryDate && new Date(found.expiryDate) < now) {
    return { valid: false, discountAmount: 0, message: "This coupon has expired." };
  }

  if (found.minOrderValue && subtotal < found.minOrderValue) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum order value of ₹${found.minOrderValue} required for this coupon.`,
    };
  }

  if (found.usageLimit && found.usageCount >= found.usageLimit) {
    return { valid: false, discountAmount: 0, message: "Coupon usage limit has been reached." };
  }

  let discountAmount = 0;
  if (found.discountType === "percentage") {
    discountAmount = Math.round((subtotal * found.discountValue) / 100);
    if (found.maxDiscount && discountAmount > found.maxDiscount) {
      discountAmount = found.maxDiscount;
    }
  } else {
    discountAmount = Math.min(found.discountValue, subtotal);
  }

  return {
    valid: true,
    coupon: found,
    discountAmount,
    message: `Coupon ${found.code} applied! Saved ₹${discountAmount}.`,
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
    if (c.expiryDate && new Date(c.expiryDate) < now) return false;
    if (c.startDate && new Date(c.startDate) > now) return false;
    if (c.minOrderValue && subtotal < c.minOrderValue) return false;
    if (c.usageLimit && c.usageCount >= c.usageLimit) return false;
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
      if (c.maxDiscount && disc > c.maxDiscount) disc = c.maxDiscount;
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
    message: `Auto-applied: ${bestCoupon.code} (Saved ₹${maxDiscount})`,
  };
}

export async function saveCoupon(coupon: Partial<Coupon> & { id?: string }): Promise<Coupon> {
  const id = coupon.id || `cpn_${Date.now()}`;
  const fullCoupon: Coupon = {
    id,
    code: (coupon.code || "SAVE10").toUpperCase().trim(),
    discountType: coupon.discountType || "percentage",
    discountValue: coupon.discountValue ?? 10,
    minOrderValue: coupon.minOrderValue ?? 0,
    maxDiscount: coupon.maxDiscount ?? 500,
    startDate: coupon.startDate || new Date().toISOString(),
    expiryDate: coupon.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    usageLimit: coupon.usageLimit ?? 1000,
    usageCount: coupon.usageCount ?? 0,
    active: coupon.active ?? true,
    autoApply: coupon.autoApply ?? false,
    description: coupon.description || "",
    applicableCategories: coupon.applicableCategories || [],
    createdAt: coupon.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
        await db.collection("coupons").updateOne(
          { id },
          { $set: fullCoupon },
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
    local.push(fullCoupon);
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
        await db.collection("coupons").deleteOne({ id });
      }
    } catch (e) {
      console.warn("Direct mongo deleteCoupon error:", e);
    }
  }

  const local = getLocalCoupons().filter((c) => c.id !== id);
  saveLocalCoupons(local);
  return true;
}
