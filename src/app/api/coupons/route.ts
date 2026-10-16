import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { Coupon } from "@/lib/types";
import { DEFAULT_COUPONS } from "@/lib/services/coupons";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const availableOnly = searchParams.get("available") === "true" || searchParams.get("active") === "true";

    if (!isMongoConfigured) {
      if (code) {
        const found = DEFAULT_COUPONS.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
        return NextResponse.json({ coupon: found || null });
      }
      if (availableOnly) {
        const now = new Date();
        const available = DEFAULT_COUPONS.filter((c) => c.active && (!c.expiryDate || new Date(c.expiryDate) >= now));
        return NextResponse.json({ coupons: available });
      }
      return NextResponse.json({ coupons: DEFAULT_COUPONS });
    }

    const db = await getDb();
    const col = db.collection<Coupon>("coupons");

    // Check count and seed default coupons if completely empty
    const count = await col.countDocuments();
    if (count === 0) {
      try {
        await col.insertMany(DEFAULT_COUPONS as any);
      } catch (seedErr) {
        console.warn("Coupon seeding error:", seedErr);
      }
    }

    if (code) {
      const clean = code.trim().toUpperCase();
      const coupon = await col.findOne({ code: clean });
      return NextResponse.json({ coupon: coupon || null });
    }

    if (availableOnly) {
      const now = new Date();
      const allActive = await col.find({ active: true }).sort({ autoApply: -1, createdAt: -1 }).toArray();
      const available = allActive.filter((c) => {
        if (!c.expiryDate) return true;
        const exp = new Date(c.expiryDate.includes("T") ? c.expiryDate : `${c.expiryDate}T23:59:59.999Z`);
        return exp >= now;
      });
      return NextResponse.json({ coupons: available });
    }

    const coupons = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ coupons });
  } catch (err: any) {
    console.error("GET /api/coupons error:", err);
    return NextResponse.json({ error: err?.message, coupons: DEFAULT_COUPONS }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const coupon: Coupon = await req.json();

    if (!coupon || !coupon.code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const id = coupon.id || `cpn_${Date.now()}`;
    const payload: Coupon = {
      ...coupon,
      id,
      code: coupon.code.trim().toUpperCase(),
      discountValue: Number(coupon.discountValue || 0),
      minOrderValue: Number(coupon.minOrderValue || 0),
      maxDiscount: Number(coupon.maxDiscount || 0),
      usageLimit: Number(coupon.usageLimit || 1000),
      usageCount: Number(coupon.usageCount || 0),
      active: coupon.active ?? true,
      autoApply: Boolean(coupon.autoApply),
      updatedAt: new Date().toISOString(),
    };

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true, coupon: payload });
    }

    const db = await getDb();
    const col = db.collection("coupons");

    await col.updateOne({ id }, { $set: payload }, { upsert: true });

    return NextResponse.json({ success: true, coupon: payload });
  } catch (err: any) {
    console.error("POST /api/coupons error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Coupon id is required" }, { status: 400 });
    }

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true });
    }

    const db = await getDb();
    await db.collection("coupons").deleteOne({ id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/coupons error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
