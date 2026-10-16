"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { getOrderById } from "@/lib/services/storeDb";
import { Order } from "@/lib/types";
import { useCart } from "@/lib/cart/CartContext";
import {
  CheckCircle2,
  Package,
  Printer,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Gift,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { clearCart } = useCart();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function checkOrder() {
      setLoading(true);
      try {
        const fetchedOrder = await getOrderById(id);
        if (!fetchedOrder) {
          if (isMounted) setLoading(false);
          return;
        }

        // 1. Online Orders already marked paid
        if (fetchedOrder.paymentStatus === "paid") {
          if (isMounted) {
            setOrder(fetchedOrder);
            setIsConfirmed(true);
            setLoading(false);
            clearCart();
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
          return;
        }

        // 3. Online Orders that are pending verification: query backend directly
        if (fetchedOrder.paymentStatus === "pending") {
          try {
            const verifyRes = await fetch("/api/payment/cashfree/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: fetchedOrder.id }),
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.isPaid) {
              const updated = {
                ...fetchedOrder,
                paymentStatus: "paid" as const,
                orderStatus: "confirmed" as const,
              };
              if (isMounted) {
                setOrder(updated);
                setIsConfirmed(true);
                setLoading(false);
                clearCart();
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                });
              }
              return;
            }
          } catch (verifyErr) {
            console.warn("Background order verification error:", verifyErr);
          }
        }

        // 4. Payment is failed or could not be verified
        if (isMounted) {
          setOrder(fetchedOrder);
          setIsConfirmed(false);
          setLoading(false);
          // DO NOT clearCart() here - preserve customer items!
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        if (isMounted) setLoading(false);
      }
    }

    checkOrder();

    return () => {
      isMounted = false;
    };
  }, [id, clearCart]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-base font-bold text-stone-900">Verifying payment status...</h2>
        <p className="text-xs text-stone-500">Checking secure confirmation with bank gateway.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-stone-900">Order Not Found</h2>
        <p className="text-xs text-stone-500">We could not locate this order. Please check the order reference.</p>
        <Link
          href="/shop"
          className="inline-block px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // PAYMENT FAILED / UNCONFIRMED STATE
  if (!isConfirmed) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        <div className="text-center space-y-4 bg-white p-8 sm:p-12 rounded-3xl border border-amber-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-9 h-9" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
            Payment Incomplete • Order Not Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Your Payment Was Not Completed
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            We did not receive a successful payment for this order, so it has <strong>not</strong> been processed or scheduled for dispatch. All your personalized keepsakes and cart items remain 100% intact!
          </p>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left text-xs text-amber-900 max-w-lg mx-auto space-y-1.5">
            <p className="font-bold">What happens next?</p>
            <p className="text-amber-800 text-[11px]">
              • If money was debited by your bank or UPI app, it will be automatically refunded by your banking partner within 24 to 48 hours.
            </p>
            <p className="text-amber-800 text-[11px]">
              • You can retry online payment right away via UPI (GPay, PhonePe, Paytm), Cards, or NetBanking without re-entering your address.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href={`/checkout?error=payment_declined&order_id=${encodeURIComponent(order.id)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Online Payment (Cashfree)</span>
            </Link>

            <Link
              href="/cart"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Shopping Bag</span>
            </Link>
          </div>

          <div className="inline-block mt-2 p-2 px-3 rounded-lg bg-stone-100 text-stone-600 font-mono text-[11px]">
            Reference: {order.orderNumber} • Status: <span className="font-bold uppercase text-amber-700">{order.paymentStatus}</span>
          </div>
        </div>
      </div>
    );
  }

  // CONFIRMED ORDER STATE (COD or Verified Paid)
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3 bg-white p-8 sm:p-12 rounded-3xl border border-stone-200/80 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          Order Confirmed & Sealed
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Thank You! Your Gifts Are Being Crafted.
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
          We have received your celebration order. Our master artisans are now preparing your handwritten cards and luxury keepsake box.
        </p>

        {order && (
          <div className="inline-block mt-2 p-2.5 px-4 rounded-xl bg-stone-100 text-stone-800 font-mono text-xs font-bold">
            Order Reference: <span className="text-rose-600">{order.orderNumber}</span>
          </div>
        )}
      </div>

      {order && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">Order Summary</h2>
              <p className="text-xs text-stone-500">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/orders/${order.id}/invoice`}
                className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors print:hidden"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download Tax Invoice</span>
              </Link>

              <Link
                href="/orders/track"
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors print:hidden"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Track Delivery</span>
              </Link>
            </div>
          </div>

          {/* Delivery & Payment Snapshots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
              <span className="font-bold text-stone-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" /> Delivery Address
              </span>
              <p className="font-semibold text-stone-900">{order.shippingAddress.fullName}</p>
              <p className="text-stone-600">{order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2}</p>
              <p className="text-stone-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="text-stone-500">Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
              <span className="font-bold text-stone-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Payment & Status
              </span>
              <p className="text-stone-700">Method: <strong className="uppercase">{order.paymentMethod}</strong></p>
              <p className="text-stone-700">Payment: <span className="font-bold text-emerald-700 uppercase">{order.paymentStatus}</span></p>
              <p className="text-stone-700">Status: <span className="font-bold text-rose-700 uppercase">{order.orderStatus}</span></p>
              <p className="text-stone-500">Courier: Delhivery Surface Express (Air)</p>
            </div>
          </div>

          {/* Ordered Gifts Items */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Ordered Keepsakes ({order.items.length})
            </h3>
            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 flex gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-stone-900">{item.productName}</h4>
                      <span className="font-bold text-stone-900">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span className="text-stone-500 block">Quantity: {item.quantity}</span>

                    {item.personalizationData && Object.keys(item.personalizationData).length > 0 && (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-[11px] text-amber-900 mt-1">
                        <strong className="block text-amber-800">Personalized Specifications:</strong>
                        {Object.entries(item.personalizationData).map(([k, v]) => (
                          <div key={k}>
                            <span className="capitalize text-stone-500">{k.replace(/_/g, " ")}: </span>
                            <span className="font-medium text-stone-900">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Calculation Footer */}
          <div className="pt-4 border-t border-stone-200 max-w-xs ml-auto space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-stone-900">₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({order.couponCode}):</span>
                <span className="font-semibold">-₹{order.discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {order.giftWrap > 0 && (
              <div className="flex justify-between text-rose-700">
                <span>Luxury Gift Wrap & Fast Shipping:</span>
                <span className="font-semibold">+₹{order.giftWrap.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900">
              <span>Total Paid:</span>
              <span className="text-base text-rose-600">₹{order.total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-center print:hidden">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all"
        >
          <span>Continue Gifting</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
