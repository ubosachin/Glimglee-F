import { NextRequest, NextResponse } from "next/server";
import { recordCouponUsage } from "@/lib/services/coupons";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    await recordCouponUsage(code);
    return NextResponse.json({ success: true, message: `Usage recorded for ${code}` });
  } catch (err: any) {
    console.error("POST /api/coupons/usage error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
