import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/services/orders";

export async function POST(req: Request) {
  try {
    const event = await req.json();

    // Verify webhook event
    if (event.type === "PAYMENT_SUCCESS_WEBHOOK" && event.data?.order?.order_id) {
      const orderId = event.data.order.order_id;
      const paymentId = String(event.data.payment?.cf_payment_id || `cf_wh_${Date.now()}`);

      await updateOrderStatus(orderId, {
        paymentStatus: "paid",
        orderStatus: "confirmed",
        paymentId,
        paymentMethod: "cashfree",
      });

      return NextResponse.json({ received: true });
    }

    if (event.type === "PAYMENT_FAILED_WEBHOOK" && event.data?.order?.order_id) {
      const orderId = event.data.order.order_id;
      await updateOrderStatus(orderId, {
        paymentStatus: "failed",
      });
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true, ignored: true });
  } catch (error) {
    console.error("Cashfree webhook error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 400 });
  }
}
