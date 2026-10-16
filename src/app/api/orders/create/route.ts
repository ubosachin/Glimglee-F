import { NextResponse } from "next/server";
import { getProductById, validateCoupon, createOrder, recordCouponUsage } from "@/lib/services/storeDb";
import { cashfreeService } from "@/lib/payment/cashfree";

// In-memory idempotency cache to prevent duplicate order placements upon retries/double-clicks
const idempotencyMap = new Map<string, { order: any; paymentSessionId?: string; timestamp: number }>();
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      couponCode,
      paymentMethod = "cashfree",
      giftWrapTotal,
      idempotencyKey,
    } = body;

    // Check idempotency header or body key
    const key = idempotencyKey || req.headers.get("x-idempotency-key");
    if (key && idempotencyMap.has(key)) {
      const existing = idempotencyMap.get(key)!;
      if (Date.now() - existing.timestamp < IDEMPOTENCY_TTL_MS) {
        return NextResponse.json({
          success: true,
          order: existing.order,
          paymentSessionId: existing.paymentSessionId,
          idempotentReplay: true,
        });
      }
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items to order" }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.pincode) {
      return NextResponse.json({ error: "Incomplete shipping address" }, { status: 400 });
    }

    // Verify products & recalculate prices strictly on server using targeted product lookups
    const productPromises = items.map((clientItem: any) => getProductById(clientItem.productId));
    const fetchedProducts = await Promise.all(productPromises);
    const verifiedItems = [];
    let serverSubtotal = 0;

    for (let i = 0; i < items.length; i++) {
      const clientItem = items[i];
      const realProduct = fetchedProducts[i];
      if (!realProduct) {
        return NextResponse.json(
          { error: `Product not found: ${clientItem.productId}` },
          { status: 400 }
        );
      }

      if (realProduct.inventory < clientItem.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${realProduct.name}` },
          { status: 400 }
        );
      }

      serverSubtotal += realProduct.price * clientItem.quantity;
      verifiedItems.push({
        productId: realProduct.id,
        productName: realProduct.name,
        productSlug: realProduct.slug,
        productImage: realProduct.images[0] || realProduct.thumbnail || "",
        price: realProduct.price,
        compareAtPrice: realProduct.compareAtPrice,
        quantity: clientItem.quantity,
        selectedVariant: clientItem.selectedVariant,
        personalizationData: clientItem.personalizationData,
      });
    }

    let serverDiscount = 0;
    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, serverSubtotal);
      if (couponRes.valid) {
        serverDiscount = couponRes.discountAmount;
      }
    }

    const serverShipping = serverSubtotal >= 999 ? 0 : 70;
    const verifiedGiftWrap = Number(giftWrapTotal) || 0;
    const serverTotal = Math.max(0, serverSubtotal - serverDiscount) + verifiedGiftWrap + serverShipping;

    // Strict: Cash on Delivery is disabled. Only Cashfree online payment is accepted.
    if (paymentMethod === "cod") {
      return NextResponse.json(
        { error: "Cash on Delivery is disabled. Only secure online payment (Cashfree) is accepted." },
        { status: 400 }
      );
    }

    const newOrder = await createOrder({
      userId: userId || "guest",
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: verifiedItems,
      subtotal: serverSubtotal,
      discount: serverDiscount,
      giftWrap: verifiedGiftWrap,
      shipping: serverShipping,
      tax: 0,
      total: serverTotal,
      couponCode: couponCode || undefined,
      paymentStatus: "pending",
      paymentMethod: "cashfree",
      orderStatus: "pending_payment",
      idempotencyKey: key || undefined,
    });

    if (couponCode) {
      recordCouponUsage(couponCode).catch((err) =>
        console.warn("Could not record coupon usage:", err)
      );
    }

    let paymentSessionId: string | undefined;

    try {
      const origin = (req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
      const cfOrder = await cashfreeService.createOrder({
        orderId: newOrder.id,
        orderAmount: newOrder.total,
        orderCurrency: "INR",
        customer: {
          customer_id: customerEmail.replace(/[^a-zA-Z0-9]/g, "_"),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        returnUrl: `${origin}/api/payment/cashfree/verify?order_id=${encodeURIComponent(newOrder.id)}`,
        orderNote: `Glimglee Order #${newOrder.orderNumber}`,
      });
      paymentSessionId = cfOrder.payment_session_id;
    } catch (cfErr: any) {
      console.error("Cashfree order generation error:", cfErr);
      const { updateOrderStatus } = await import("@/lib/services/orders");
      await updateOrderStatus(newOrder.id, {
        paymentStatus: "failed",
        orderStatus: "cancelled",
      });
      return NextResponse.json(
        { error: cfErr?.message || "Could not initialize secure online payment gateway. Please check network and retry." },
        { status: 400 }
      );
    }

    if (!paymentSessionId) {
      const { updateOrderStatus } = await import("@/lib/services/orders");
      await updateOrderStatus(newOrder.id, {
        paymentStatus: "failed",
        orderStatus: "cancelled",
      });
      return NextResponse.json(
        { error: "Payment gateway did not provide a valid session. Please try again." },
        { status: 400 }
      );
    }

    if (key) {
      idempotencyMap.set(key, { order: newOrder, paymentSessionId, timestamp: Date.now() });
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      paymentSessionId,
    });
  } catch (error) {
    console.error("Order creation server error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
