"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthContext";
import { getOrders } from "@/lib/services/storeDb";
import { Order } from "@/lib/types";
import {
  Package,
  ArrowLeft,
  Truck,
  FileText,
  Calendar,
  CreditCard,
  MapPin,
  ExternalLink,
  Gift,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (user) {
      setLoading(true);
      getOrders().then((data) => {
        const userOrders = data.filter(
          (o) =>
            o.userId === user.uid ||
            (user.email && o.customerEmail.toLowerCase() === user.email.toLowerCase())
        );
        setOrders(userOrders);
        setLoading(false);
      });
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "all") return true;
    return o.orderStatus === filterStatus;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-3 text-xs text-stone-500">
        <Link href="/account" className="hover:text-rose-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">My Gift Orders</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-rose-600" />
            <span>My Gift Orders</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track status, view custom engraving details, and download tax invoices for your gifting orders.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { label: "All Orders", val: "all" },
            { label: "Processing", val: "processing" },
            { label: "Shipped", val: "shipped" },
            { label: "Delivered", val: "delivered" },
          ].map((status) => (
            <button
              key={status.val}
              onClick={() => setFilterStatus(status.val)}
              className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-colors ${
                filterStatus === status.val
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading your gift orders...</div>
      ) : !user ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Sign in to view orders</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Please sign in to your Glimglee account to track your orders, view shipping status, and download receipts.
          </p>
          <Link
            href="/login"
            className="inline-flex px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
          >
            Sign In to Account
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-900">No orders found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {filterStatus === "all"
              ? "You haven't placed any gift orders yet. Find the perfect personalized keepsake today!"
              : `No orders currently matching status: ${filterStatus}`}
          </p>
          <Link
            href="/shop"
            className="inline-flex px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
          >
            Explore Gifting Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isDelivered = order.orderStatus === "delivered";
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-stone-50/70 p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Order Placed</span>
                      <span className="font-semibold text-stone-800">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Amount</span>
                      <span className="font-bold text-stone-900">₹{order.total.toLocaleString("en-IN")}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Ship To</span>
                      <span className="font-medium text-stone-700 truncate max-w-[150px] inline-block">
                        {order.shippingAddress?.fullName || order.customerName || "Recipient"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-stone-500">{order.orderNumber}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-800"
                          : order.orderStatus === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {order.orderStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="p-4 sm:p-6 divide-y divide-stone-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 justify-between">
                      <div className="flex gap-4">
                        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative flex-shrink-0 flex items-center justify-center">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Gift className="w-6 h-6 text-rose-300 stroke-[1.5]" />
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-stone-500">
                            Qty: <strong className="text-stone-700">{item.quantity}</strong> × ₹{item.price.toLocaleString("en-IN")}
                          </p>

                          {/* Personalization Details if present */}
                          {item.personalizationData && Object.keys(item.personalizationData).length > 0 && (
                            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 text-[11px] text-stone-700 space-y-1 mt-2">
                              <span className="font-bold text-rose-800 flex items-center gap-1">
                                <Gift className="w-3 h-3 text-rose-600" /> Bespoke Customization:
                              </span>
                              {Object.entries(item.personalizationData).map(([key, val]) => (
                                <div key={key} className="flex gap-1.5 text-[10px]">
                                  <span className="capitalize font-semibold text-stone-500">{key}:</span>
                                  <span className="font-medium text-stone-800 truncate max-w-xs">{String(val)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {order.giftWrap > 0 && (
                            <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              🎁 Gift Wrapped with Greeting Card
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right sm:self-center">
                        <span className="text-xs sm:text-sm font-bold text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer Actions */}
                <div className="bg-stone-50/50 p-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-stone-500 text-[11px]">
                    <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                    <span>Paid via {order.paymentMethod}</span>
                    {order.trackingNumber && (
                      <>
                        <span>•</span>
                        <Truck className="w-3.5 h-3.5 text-stone-400" />
                        <span>AWB: {order.trackingNumber}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}/invoice`}
                      className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:bg-white text-stone-700 font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      <span>Tax Invoice</span>
                    </Link>

                    <Link
                      href={`/orders/track?orderId=${order.orderNumber}`}
                      className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5 text-white" />
                      <span>Track Delivery</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
