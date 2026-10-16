"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOrders } from "@/lib/services/storeDb";
import { Order } from "@/lib/types";
import {
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
} from "lucide-react";

interface OrdersNavigationTabsProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function OrdersNavigationTabs({
  onRefresh,
  isRefreshing = false,
}: OrdersNavigationTabsProps) {
  const pathname = usePathname();
  const [counts, setCounts] = useState<{
    all: number;
    confirmed: number;
    failedCancelled: number;
  }>({
    all: 0,
    confirmed: 0,
    failedCancelled: 0,
  });

  const loadCounts = async () => {
    try {
      const allOrders: Order[] = await getOrders({ limitCount: 200 });
      const confirmed = allOrders.filter(
        (o) =>
          (o.orderStatus !== "cancelled" && o.orderStatus !== "pending_payment") ||
          (o.paymentStatus === "paid" && o.orderStatus !== "cancelled")
      ).length;

      const failedCancelled = allOrders.filter(
        (o) =>
          o.orderStatus === "cancelled" ||
          o.paymentStatus === "failed" ||
          o.paymentStatus === "refunded" ||
          (o.orderStatus === "pending_payment" && o.paymentStatus !== "paid")
      ).length;

      setCounts({
        all: allOrders.length,
        confirmed,
        failedCancelled,
      });
    } catch (e) {
      console.warn("Failed to load order counts:", e);
    }
  };

  useEffect(() => {
    loadCounts();

    const handleUpdate = () => loadCounts();
    window.addEventListener("glimglee_orders_updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("glimglee_orders_updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  const tabs = [
    {
      label: "All Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      count: counts.all,
      exact: true,
      badgeColor: "bg-stone-100 text-stone-700 border-stone-200",
      activeBg: "bg-stone-900 text-white shadow-stone-900/20",
    },
    {
      label: "Confirmed Orders",
      href: "/admin/orders/confirmed",
      icon: CheckCircle2,
      count: counts.confirmed,
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      activeBg: "bg-emerald-600 text-white shadow-emerald-600/25",
    },
    {
      label: "Failed & Cancelled",
      href: "/admin/orders/cancelled-failed",
      icon: AlertTriangle,
      count: counts.failedCancelled,
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      activeBg: "bg-rose-600 text-white shadow-rose-600/25",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200/80 shadow-inner">
      <div className="flex flex-wrap items-center gap-1.5 flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? `${tab.activeBg} shadow-md`
                  : "text-stone-600 hover:text-stone-900 hover:bg-white/80"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  isActive
                    ? "bg-white/20 text-white border-white/30"
                    : tab.badgeColor
                }`}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 px-2 pb-1 sm:pb-0">
        <button
          type="button"
          onClick={() => {
            loadCounts();
            if (onRefresh) onRefresh();
          }}
          disabled={isRefreshing}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          title="Refresh real-time order records"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-rose-600" : "text-stone-500"}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}
