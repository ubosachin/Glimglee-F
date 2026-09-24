"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getOrders, subscribeToOrder } from "@/lib/services/orders";
import { Order } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Box,
  Home,
  ShieldCheck,
  Sparkles,
  Printer,
  Gift,
  ArrowRight,
} from "lucide-react";

const ORDER_STEPS = [
  { id: "placed", label: "Order Placed", desc: "Gift order confirmed by Glimglee curators" },
  { id: "confirmed", label: "Confirmed", desc: "Artisan workshop assigned" },
  { id: "processing", label: "Processing", desc: "Personalizing engravings & hand-writing card" },
  { id: "packed", label: "Packed", desc: "Bubble-armored in luxury gift box with wax seal" },
  { id: "shipped", label: "Shipped", desc: "Dispatched via Priority Express courier" },
  { id: "out_for_delivery", label: "Out for Delivery", desc: "Delivery executive on the way" },
  { id: "delivered", label: "Delivered", desc: "Gift successfully received with a smile!" },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("orderId") || "";

  const [searchCode, setSearchCode] = useState(urlOrderId || "GLM-10291");
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [livePulse, setLivePulse] = useState(false);

  useEffect(() => {
    getOrders().then((orders) => {
      setAllOrders(orders);
      if (orders.length > 0) {
        if (urlOrderId) {
          const match = orders.find(
            (o) =>
              o.orderNumber.toLowerCase() === urlOrderId.toLowerCase() ||
              o.id.toLowerCase() === urlOrderId.toLowerCase()
          );
          setSelectedOrder(match || orders[0]);
        } else {
          setSelectedOrder(orders[0]);
        }
      }
    });
  }, [urlOrderId]);

  // Real-time subscription to selected order
  useEffect(() => {
    if (!selectedOrder?.id) return;

    const unsubscribe = subscribeToOrder(selectedOrder.id, (updated) => {
      if (updated && updated.orderStatus !== selectedOrder.orderStatus) {
        setSelectedOrder(updated);
        setLivePulse(true);
        setTimeout(() => setLivePulse(false), 3000);
      }
    });

    return () => unsubscribe();
  }, [selectedOrder?.id, selectedOrder?.orderStatus]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const clean = searchCode.trim().toLowerCase();
    const found = allOrders.find(
      (o) =>
        o.orderNumber.toLowerCase() === clean ||
        o.orderNumber.toLowerCase() === `#${clean}` ||
        o.id.toLowerCase() === clean ||
        o.customerEmail.toLowerCase() === clean
    );

    if (found) {
      setSelectedOrder(found);
    } else {
      setErrorMsg("Order not found. Please verify your order number (e.g. GLM-10291).");
    }
  };

  const getStepIndex = (status: Order["orderStatus"]) => {
    return ORDER_STEPS.findIndex((s) => s.id === status);
  };

  const currentStepIdx = selectedOrder ? getStepIndex(selectedOrder.orderStatus) : -1;

  return (
    <div className="py-8 sm:py-16 space-y-8 sm:space-y-12">
      <Container size="md">
        {/* Title Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <Truck className="w-4 h-4" /> Live Real-Time Timeline
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Track Your Glimglee Gift
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            Enter your Order Number or registered email address to follow your gift's journey from our workshop to their hands.
          </p>

          {/* Search Box */}
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Order Number (e.g. GLM-10291)"
                className="w-full text-xs bg-white pl-9 pr-4 py-3 rounded-2xl border border-stone-200 shadow-xs focus:outline-none focus:border-rose-500 font-bold"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold transition-colors shadow-md"
            >
              Track Gift
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl max-w-md mx-auto border border-rose-100">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Order Details & Stepper */}
        {selectedOrder && (
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 sm:p-8 space-y-8 transition-all">
            {/* Real-time Status Alert Banner */}
            {livePulse && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Live Update: Your package status has just advanced!</span>
              </div>
            )}

            {/* Order Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-stone-900">
                    {selectedOrder.orderNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                    {selectedOrder.orderStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Link
                  href={`/orders/${selectedOrder.id}/invoice`}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </Link>
              </div>
            </div>

            {/* Courier Tracking Dispatch Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Carrier Network</span>
                <p className="font-bold text-stone-900">{selectedOrder.courierPartner || "Delhivery Air Express"}</p>
                <p className="text-[11px] text-stone-500">Priority Courier</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Air Waybill (AWB)</span>
                <p className="font-mono font-bold text-rose-700 text-xs truncate">
                  {selectedOrder.trackingNumber || "AWB-IN-9081248"}
                </p>
                <p className="text-[11px] text-stone-500">Live GPS tracking</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Destination</span>
                <p className="font-bold text-stone-900 truncate">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.pincode}
                </p>
                <p className="text-[11px] text-stone-500">{selectedOrder.shippingAddress?.fullName}</p>
              </div>
            </div>

            {/* 7-Stage Visual Order Stepper */}
            <div className="space-y-6 pt-4">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Fulfillment Journey
              </h3>

              {/* Vertical Stepper for Mobile, Horizontal for Desktop */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-stone-200">
                {ORDER_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.id} className="relative flex items-start gap-4 pl-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 transition-colors ${
                          isCompleted
                            ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                            : "bg-white border-2 border-stone-300 text-stone-400"
                        } ${isCurrent ? "ring-4 ring-rose-100" : ""}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="space-y-0.5 pt-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-bold ${isCompleted ? "text-stone-900" : "text-stone-400"}`}>
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-wider">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Package Contents */}
            <div className="pt-6 border-t border-stone-100 space-y-3">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Package Contents ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-stone-100">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0 flex items-center justify-center">
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Gift className="w-5 h-5 text-rose-300 stroke-[1.5]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{item.productName}</p>
                        <p className="text-[11px] text-stone-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 font-mono">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

import { Suspense } from "react";

export default function OrderTrackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-400">Loading tracking...</div>}>
      <TrackContent />
    </Suspense>
  );
}
