import { NextResponse } from "next/server";
import { cashfreeService } from "@/lib/payment/cashfree";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderId,
      amount,
      currency = "INR",
      customerName,
      customerEmail,
      customerPhone,
      returnUrl,
      orderNote,
    } = body;

    if (!orderId || !amount || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required order parameters (orderId, amount, customerEmail)" },
        { status: 400 }
      );
    }

    const orderResponse = await cashfreeService.createOrder({
      orderId: String(orderId),
      orderAmount: Number(amount),
      orderCurrency: currency,
      customer: {
        customer_id: customerEmail.replace(/[^a-zA-Z0-9]/g, "_") || `cust_${Date.now()}`,
        customer_name: customerName || "Glimglee Customer",
        customer_email: customerEmail,
        customer_phone: customerPhone || "9999999999",
      },
      returnUrl,
      orderNote,
    });

    return NextResponse.json({
      success: true,
      paymentSessionId: orderResponse.payment_session_id,
      cfOrderId: orderResponse.cf_order_id,
      orderId: orderResponse.order_id,
      orderAmount: orderResponse.order_amount,
    });
  } catch (error: unknown) {
    console.error("Cashfree create-order API error:", error);
    const message = error instanceof Error ? error.message : "Failed to create payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
