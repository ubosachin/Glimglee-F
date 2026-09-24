"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { getOrderById } from "@/lib/services/storeDb";
import { Order } from "@/lib/types";
import {
  CheckCircle2,
  Package,
  Printer,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Gift,
} from "lucide-react";

export default function OrderSuccessPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (id) {
      getOrderById(id).then(setOrder);
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

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
