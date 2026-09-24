import { NextResponse } from "next/server";
import { getProductById, validateCoupon } from "@/lib/services/storeDb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, couponCode, giftWrapTotal } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Cost optimization: Only fetch the specific products present in the cart concurrently
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
          {
            error: `Insufficient stock for ${realProduct.name}. Only ${realProduct.inventory} available.`,
          },
          { status: 400 }
        );
      }

      const verifiedPrice = realProduct.price;
      serverSubtotal += verifiedPrice * clientItem.quantity;

      verifiedItems.push({
        productId: realProduct.id,
        productName: realProduct.name,
        productSlug: realProduct.slug,
        productImage: realProduct.images[0] || realProduct.thumbnail,
        price: verifiedPrice,
        compareAtPrice: realProduct.compareAtPrice,
        quantity: clientItem.quantity,
        selectedVariant: clientItem.selectedVariant,
        personalizationData: clientItem.personalizationData,
      });
    }

    // Server-side coupon verification
    let serverDiscount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, serverSubtotal);
      if (couponRes.valid && couponRes.coupon) {
        serverDiscount = couponRes.discountAmount;
        appliedCoupon = couponRes.coupon;
      }
    }

    const FREE_SHIPPING_THRESHOLD = 999;
    const STANDARD_SHIPPING_RATE = 70;
    const serverShipping = serverSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_RATE;
    const verifiedGiftWrap = Number(giftWrapTotal) || 0;
    const serverTotal = Math.max(0, serverSubtotal - serverDiscount) + verifiedGiftWrap + serverShipping;

    return NextResponse.json({
      verified: true,
      items: verifiedItems,
      subtotal: serverSubtotal,
      discount: serverDiscount,
      giftWrap: verifiedGiftWrap,
      shipping: serverShipping,
      tax: 0, // prices are GST inclusive
      total: serverTotal,
      appliedCoupon,
    });
  } catch (error) {
    console.error("Checkout verify error:", error);
    return NextResponse.json({ error: "Server verification failed" }, { status: 500 });
  }
}
