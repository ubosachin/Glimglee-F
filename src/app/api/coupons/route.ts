import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { Coupon } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!isMongoConfigured) {
      return NextResponse.json({ coupons: [] });
    }

    const db = await getDb();
    const col = db.collection<Coupon>("coupons");

    if (code) {
      const coupon = await col.findOne({ code: code.toUpperCase() });
      return NextResponse.json({ coupon: coupon || null });
    }

    const coupons = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ coupons });
  } catch (err: any) {
    console.error("GET /api/coupons error:", err);
    return NextResponse.json({ error: err?.message, coupons: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const coupon: Coupon = await req.json();

    if (!coupon || !coupon.code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const id = coupon.id || `cpn_${Date.now()}`;
    const payload = {
      ...coupon,
      id,
      code: coupon.code.toUpperCase(),
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
