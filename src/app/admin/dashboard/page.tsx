"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getStoreAnalytics, StoreAnalytics, getProducts, updateOrderStatus } from "@/lib/services/storeDb";
import { Order, Product } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  useEffect(() => {
    async function load() {
      // Fetch pre-aggregated statistics and limited recent orders to avoid downloading entire collections
      const [stats, prod] = await Promise.all([
        getStoreAnalytics(),
        getProducts({ limitCount: 20 }),
      ]);
      setAnalytics(stats);
      setRecentOrders(stats.recentOrders);
      setProducts(prod);
    }
    load();
  }, []);

  // Financial calculations from bounded analytics
  const totalRevenue = analytics?.totalRevenue || 0;
  const totalOrdersCount = analytics?.totalOrders || 0;
  const pendingOrdersCount = analytics?.pendingOrdersCount || 0;
  const aov = analytics?.averageOrderValue || 0;
  const lowStockProducts = products.filter((p) => p.inventory <= p.lowStockThreshold);

  const handleStatusChange = async (orderId: string, newStatus: Order["orderStatus"]) => {
    const updated = await updateOrderStatus(orderId, { orderStatus: newStatus });
    if (updated) {
      setRecentOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast(`Order status changed to ${newStatus}`, "success");
    }
  };

  // Revenue chart data points calculated from live recent orders
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split("T")[0];
    const label = dayNames[d.getDay()];

    const dayOrders = recentOrders.filter((o) => {
      const oDate = (o.createdAt || "").split("T")[0];
      return oDate === dayStr && (o.paymentStatus === "paid" || o.orderStatus === "delivered");
    });
    const rev = dayOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    return { label, rev, count: dayOrders.length };
  });
  const maxChartRev = Math.max(...chartData.map((d) => d.rev), 1);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Overview Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Glimglee Executive Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time sales, artisan workshop fulfillment, and pan-India courier status.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shadow-sm text-xs font-bold self-start sm:self-auto">
          {(["7d", "30d", "90d", "1y"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === r ? "bg-stone-900 text-white shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider">
            <span>Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-stone-900">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-0.5">
              +18.4%
            </span>
          </div>
          <p className="text-[11px] text-stone-400">Paid orders across all channels</p>
        </div>

        {/* Orders Placed */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-stone-900">
              {totalOrdersCount}
            </span>
            <span className="text-xs font-bold text-rose-600">
              {pendingOrdersCount} pending
            </span>
          </div>
          <p className="text-[11px] text-stone-400">Average value: ₹{aov.toLocaleString("en-IN")}</p>
        </div>

        {/* Catalog Products */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider">
            <span>Active Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-stone-900">
              {products.length}
            </span>
            <span className="text-xs font-bold text-amber-700">
              {products.filter((p) => p.personalization?.enabled).length} customizable
            </span>
          </div>
          <p className="text-[11px] text-stone-400">Across 8 gifting categories</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider">
            <span>Inventory Alert</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">
              {lowStockProducts.length}
            </span>
            <span className="text-xs font-bold text-stone-500">items low</span>
          </div>
          <p className="text-[11px] text-stone-400">Requires artisan re-stocking</p>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Velocity Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-stone-900">Revenue Velocity</h3>
              <p className="text-xs text-stone-500">Daily gross celebration sales trend</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              +24% vs last week
            </span>
          </div>

          {/* Dynamic SVG / HTML Bar Visualization */}
          <div className="h-56 flex items-end gap-3 sm:gap-6 pt-6 pb-2 border-b border-stone-100">
            {chartData.map((d, i) => {
              const heightPercent = Math.round((d.rev / maxChartRev) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-bold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{d.rev / 1000}k
                  </span>
                  <div
                    className="w-full bg-rose-100 group-hover:bg-rose-600 rounded-t-xl transition-all duration-300 relative"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-900">Top Selling Keepsakes</h3>
          <p className="text-xs text-stone-500">Highest grossing gifts this month</p>

          <div className="space-y-3.5 pt-2">
            {products.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No products added yet.</p>
            ) : (
              products.slice(0, 4).map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 text-xs font-bold text-stone-400">#{idx + 1}</span>
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200 flex items-center justify-center">
                    {p.images?.[0] || p.thumbnail ? (
                      <Image src={p.images?.[0] || p.thumbnail || ""} alt={p.name} fill className="object-cover" />
                    ) : (
                      <Package className="w-4 h-4 text-stone-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">{p.name}</h4>
                    <span className="text-[11px] text-stone-500">{p.reviewCount} orders • ₹{p.price}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-900">Live Orders Pipeline</h3>
            <p className="text-xs text-stone-500">Instant status updates trigger customer tracking updates.</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
          >
            <span>View All Orders ({totalOrdersCount})</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-stone-900">
                    <div>{order.customerName}</div>
                    <span className="text-[10px] text-stone-400">{order.customerEmail}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    ₹{order.total.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order["orderStatus"])}
                      className="text-xs bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 font-semibold text-stone-800 focus:outline-none cursor-pointer"
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href="/admin/orders"
                      className="px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition-colors inline-block"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
