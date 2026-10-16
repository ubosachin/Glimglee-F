import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/services/coupons";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: "Please enter a valid coupon code." },
        { status: 400 }
      );
    }

    const numSubtotal = Number(subtotal) || 0;
    const result = await validateCoupon(code, numSubtotal);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json(
      { valid: false, discountAmount: 0, message: "Coupon verification service encountered an issue." },
      { status: 500 }
    );
  }
}
