import { NextResponse } from "next/server";
import { cashfreeService } from "@/lib/payment/cashfree";
import { updateOrderStatus } from "@/lib/services/orders";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id") || url.searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.redirect(new URL("/checkout?error=missing_order_id", req.url));
  }

  try {
    const result = await cashfreeService.verifyOrderPayment(orderId);

    if (result.isPaid) {
      // Update order in database
      await updateOrderStatus(orderId, {
        paymentStatus: "paid",
        orderStatus: "confirmed",
        paymentId: result.payment ? String(result.payment.cf_payment_id) : `cf_${orderId}`,
        paymentMethod: "cashfree",
      });

      return NextResponse.redirect(
        new URL(`/order-success/${encodeURIComponent(orderId)}`, req.url)
      );
    } else {
      await updateOrderStatus(orderId, {
        paymentStatus: "failed",
      });

      return NextResponse.redirect(
        new URL(
          `/checkout?error=payment_declined&order_id=${encodeURIComponent(orderId)}`,
          req.url
        )
      );
    }
  } catch (error) {
    console.error("Cashfree return_url verification error:", error);
    return NextResponse.redirect(
      new URL(`/checkout?error=verification_failed&order_id=${encodeURIComponent(orderId)}`, req.url)
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const result = await cashfreeService.verifyOrderPayment(orderId);

    if (result.isPaid) {
      await updateOrderStatus(orderId, {
        paymentStatus: "paid",
        orderStatus: "confirmed",
        paymentId: result.payment ? String(result.payment.cf_payment_id) : `cf_${orderId}`,
        paymentMethod: "cashfree",
      });
    }

    return NextResponse.json({
      success: true,
      isPaid: result.isPaid,
      order: result.order,
      payment: result.payment,
      message: result.message,
    });
  } catch (error: unknown) {
    console.error("Cashfree verify POST API error:", error);
    const message = error instanceof Error ? error.message : "Payment verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
