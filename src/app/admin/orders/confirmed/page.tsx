"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getOrders, updateOrderStatus, logAdminAction } from "@/lib/services/storeDb";
import { Order } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import OrdersNavigationTabs from "@/components/admin/orders/OrdersNavigationTabs";
import {
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Truck,
  Printer,
  X,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Gift,
  Phone,
  Mail,
  ExternalLink,
  PackageCheck,
  Send,
  Boxes,
  Clock,
  ShieldCheck,
  Check,
  ArrowRight,
  Save,
} from "lucide-react";

const COURIER_PRESETS = [
  "Delhivery Surface Express",
  "Blue Dart Air",
  "DTDC Express",
  "Shadowfax Logistics",
  "Shiprocket Priority",
  "India Speed Post",
  "Ekart Logistics",
  "Smartr Logistics",
];

export default function ConfirmedOrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  // Edit form state inside inspection modal
  const [editStatus, setEditStatus] = useState<Order["orderStatus"]>("confirmed");
  const [editCourier, setEditCourier] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState<Order["paymentStatus"]>("paid");
  const [editNotes, setEditNotes] = useState("");
  const [savingChanges, setSavingChanges] = useState(false);

  // Pagination state (15 orders per page)
  const PAGE_SIZE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const data = await getOrders({ type: "confirmed", limitCount: 200 });
      // Ensure only confirmed / active orders are displayed
      const confirmedOnly = data.filter(
        (o) =>
          (o.orderStatus !== "cancelled" && o.orderStatus !== "pending_payment") ||
          (o.paymentStatus === "paid" && o.orderStatus !== "cancelled")
      );
      setOrders(confirmedOnly);
    } catch (e) {
      console.warn("Failed to fetch confirmed orders:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => fetchOrders();
    window.addEventListener("glimglee_orders_updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("glimglee_orders_updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  // Sync edit form whenever inspected order changes
  useEffect(() => {
    if (inspectedOrder) {
      setEditStatus(inspectedOrder.orderStatus);
      setEditCourier(inspectedOrder.courierPartner || "Delhivery Surface Express");
      setEditTracking(inspectedOrder.trackingNumber || "");
      setEditPaymentStatus(inspectedOrder.paymentStatus);
      setEditNotes(inspectedOrder.notes || "");
    }
  }, [inspectedOrder]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, stageFilter, paymentFilter]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.shippingAddress.city.toLowerCase().includes(q) ||
        o.shippingAddress.pincode.includes(q);

      const matchStage = stageFilter === "all" || o.orderStatus === stageFilter;
      const matchPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;

      return matchSearch && matchStage && matchPayment;
    });
  }, [orders, search, stageFilter, paymentFilter]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Summary KPI computations
  const metrics = useMemo(() => {
    const total = orders.length;
    const readyToPack = orders.filter((o) => o.orderStatus === "placed" || o.orderStatus === "confirmed").length;
    const processing = orders.filter((o) => o.orderStatus === "processing").length;
    const packed = orders.filter((o) => o.orderStatus === "packed").length;
    const inTransit = orders.filter((o) => o.orderStatus === "shipped" || o.orderStatus === "out_for_delivery").length;
    const delivered = orders.filter((o) => o.orderStatus === "delivered").length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    return { total, readyToPack, processing, packed, inTransit, delivered, totalRevenue };
  }, [orders]);

  // Quick 1-click status advance
  const handleQuickAdvance = async (order: Order, nextStatus: Order["orderStatus"]) => {
    try {
      const updated = await updateOrderStatus(order.id, { orderStatus: nextStatus });
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
        if (inspectedOrder?.id === order.id) {
          setInspectedOrder(updated);
        }
        await logAdminAction(
          user?.email || "admin@glimglee.com",
          "ADVANCE_ORDER_STATUS",
          "order",
          order.id,
          { from: order.orderStatus, to: nextStatus }
        );
        toast(`Order ${order.orderNumber} advanced to ${nextStatus.replace(/_/g, " ")}`, "success");
      }
    } catch {
      toast("Failed to update status", "error");
    }
  };

  // Full Save from Modal
  const handleSaveChanges = async () => {
    if (!inspectedOrder) return;
    setSavingChanges(true);

    try {
      const updates: Partial<Order> = {
        orderStatus: editStatus,
        courierPartner: editCourier.trim(),
        trackingNumber: editTracking.trim(),
        paymentStatus: editPaymentStatus,
        notes: editNotes.trim(),
      };

      const updated = await updateOrderStatus(inspectedOrder.id, updates);
      if (updated) {
        setOrders((prev) => {
          // If status was changed to cancelled, remove from confirmed list
          if (updated.orderStatus === "cancelled") {
            return prev.filter((o) => o.id !== updated.id);
          }
          return prev.map((o) => (o.id === updated.id ? updated : o));
        });
        setInspectedOrder(updated.orderStatus === "cancelled" ? null : updated);

        await logAdminAction(
          user?.email || "admin@glimglee.com",
          "UPDATE_CONFIRMED_ORDER",
          "order",
          inspectedOrder.id,
          updates
        );

        toast(`Order ${inspectedOrder.orderNumber} successfully updated!`, "success");
      }
    } catch (e) {
      console.error("Save order error:", e);
      toast("Failed to save changes", "error");
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Paid Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            Confirmed Orders ({orders.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track gift packaging, personalize keepsakes, assign courier AWBs, and manage delivery status.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <OrdersNavigationTabs onRefresh={fetchOrders} isRefreshing={refreshing} />

      {/* Top KPI Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Total Confirmed</span>
          <p className="text-2xl font-black text-stone-900">{metrics.total}</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> Ready for fulfillment
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">To Pack</span>
          <p className="text-2xl font-black text-amber-900">{metrics.readyToPack}</p>
          <span className="text-[10px] text-stone-400">Needs Keepsake Box</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Personalizing</span>
          <p className="text-2xl font-black text-blue-900">{metrics.processing}</p>
          <span className="text-[10px] text-stone-400">Custom print/engrave</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Packed</span>
          <p className="text-2xl font-black text-purple-900">{metrics.packed}</p>
          <span className="text-[10px] text-stone-400">Ready for dispatch</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">In Transit</span>
          <p className="text-2xl font-black text-sky-900">{metrics.inTransit}</p>
          <span className="text-[10px] text-stone-400">Out with Courier</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1 bg-gradient-to-br from-emerald-50/50 to-white">
          <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Delivered Value</span>
          <p className="text-2xl font-black text-emerald-800">₹{metrics.totalRevenue.toLocaleString("en-IN")}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{metrics.delivered} fulfilled</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Customer, Phone, City, Pincode..."
            className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-semibold">Fulfillment Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 font-semibold text-stone-800 cursor-pointer"
            >
              <option value="all">All Stages ({orders.length})</option>
              <option value="placed">Order Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing & Personalizing</option>
              <option value="packed">Packed in Box</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered Successfully</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-semibold">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 font-semibold text-stone-800 cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table & Mobile Responsive Cards */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-stone-100">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer & Recipient</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Courier / AWB</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedOrders.map((order) => {
                const isPaid = order.paymentStatus === "paid";
                return (
                  <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      <div>{order.orderNumber}</div>
                      {order.couponCode && (
                        <span className="inline-block px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 text-[10px] font-semibold">
                          🏷️ {order.couponCode}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-stone-900">{order.customerName}</p>
                      <span className="text-[11px] text-stone-500 block">
                        {order.shippingAddress.city}, {order.shippingAddress.state} ({order.shippingAddress.pincode})
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">{order.customerPhone}</span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-stone-900">₹{order.total.toLocaleString("en-IN")}</p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {order.trackingNumber ? (
                        <div>
                          <span className="font-mono font-bold text-stone-900 text-xs block">
                            {order.trackingNumber}
                          </span>
                          <span className="text-[10px] text-stone-500 truncate block max-w-[140px]">
                            {order.courierPartner || "Delhivery"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic text-[11px]">No AWB assigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          order.orderStatus === "delivered"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : order.orderStatus === "shipped" || order.orderStatus === "out_for_delivery"
                            ? "bg-sky-50 text-sky-800 border-sky-200"
                            : order.orderStatus === "packed"
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : order.orderStatus === "processing"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {order.orderStatus.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* Contextual Quick Advance Button */}
                      {order.orderStatus === "confirmed" && (
                        <button
                          type="button"
                          onClick={() => handleQuickAdvance(order, "packed")}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                          title="Advance to Packed in Box"
                        >
                          <Boxes className="w-3 h-3" />
                          <span>Pack</span>
                        </button>
                      )}
                      {order.orderStatus === "packed" && (
                        <button
                          type="button"
                          onClick={() => handleQuickAdvance(order, "shipped")}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                          title="Advance to Shipped"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Ship</span>
                        </button>
                      )}
                      {order.orderStatus === "shipped" && (
                        <button
                          type="button"
                          onClick={() => handleQuickAdvance(order, "delivered")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                          title="Mark Delivered"
                        >
                          <PackageCheck className="w-3 h-3" />
                          <span>Delivered</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setInspectedOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Update</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-stone-300 stroke-[1.5]" />
                    <p className="font-bold text-stone-700 text-sm">No confirmed orders found</p>
                    <p className="text-xs text-stone-400 mt-1">
                      {search ? "Try adjusting your search criteria" : "New verified customer orders will appear here automatically."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="lg:hidden divide-y divide-stone-100">
          {filteredOrders.length === 0 && !loading ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No confirmed orders found matching criteria.
            </div>
          ) : (
            paginatedOrders.map((order) => (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    {order.orderNumber}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "short" })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-stone-900">{order.customerName}</p>
                    <span className="text-[11px] text-stone-500">
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </span>
                  </div>
                  <span className="text-base font-black text-stone-900">
                    ₹{order.total.toLocaleString("en-IN")}
                  </span>
                </div>

                {order.trackingNumber && (
                  <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg flex items-center justify-between">
                    <span className="font-mono font-semibold">AWB: {order.trackingNumber}</span>
                    <span className="text-[10px] text-stone-400">{order.courierPartner || "Delhivery"}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span
                    className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                      order.orderStatus === "delivered"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : order.orderStatus === "shipped" || order.orderStatus === "out_for_delivery"
                        ? "bg-sky-50 text-sky-800 border-sky-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {order.orderStatus.replace(/_/g, " ")}
                  </span>

                  <button
                    type="button"
                    onClick={() => setInspectedOrder(order)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect & Update</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        {filteredOrders.length > PAGE_SIZE && (
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <div>
              Showing <span className="font-bold text-stone-900">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
              <span className="font-bold text-stone-900">{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}</span> of{" "}
              <span className="font-bold text-stone-900">{filteredOrders.length}</span> confirmed orders
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-stone-800 px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FULL INSPECTION & LIVE UPDATE MODAL */}
      {inspectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            onClick={() => setInspectedOrder(null)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between px-5 sm:px-8 py-4 border-b border-stone-100 bg-white flex-shrink-0 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-stone-900 font-mono">
                    Order {inspectedOrder.orderNumber}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase">
                    {inspectedOrder.orderStatus.replace(/_/g, " ")}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold uppercase">
                    {inspectedOrder.paymentStatus}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Placed on {new Date(inspectedOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/orders/${inspectedOrder.id}/invoice`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-600" />
                  <span>Tax Invoice</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setInspectedOrder(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6">
              {/* ADMINISTRATIVE UPDATE FORM (HERO SECTION) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100/60 border border-stone-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-black text-stone-900 text-xs uppercase tracking-wider">
                      Fulfillment & Tracking Controls (Admin Edit)
                    </h3>
                  </div>
                  <span className="text-[10px] text-stone-500">Live syncs to customer account</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {/* Fulfillment Status */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Fulfillment Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as Order["orderStatus"])}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-bold text-stone-900 outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="confirmed">Confirmed (Payment Verified)</option>
                      <option value="processing">Processing & Personalizing</option>
                      <option value="packed">Packed in Keepsake Box</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered Successfully</option>
                      <option value="cancelled">Cancel this Order</option>
                    </select>
                  </div>

                  {/* Courier Partner */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Courier Partner</label>
                    <select
                      value={COURIER_PRESETS.includes(editCourier) ? editCourier : "custom"}
                      onChange={(e) => {
                        if (e.target.value !== "custom") {
                          setEditCourier(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-bold text-stone-900 outline-none focus:ring-1 focus:ring-emerald-500 mb-1"
                    >
                      {COURIER_PRESETS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                      <option value="custom">Other / Custom Courier</option>
                    </select>
                    {!COURIER_PRESETS.includes(editCourier) && (
                      <input
                        type="text"
                        placeholder="Enter custom courier name..."
                        value={editCourier}
                        onChange={(e) => setEditCourier(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs"
                      />
                    )}
                  </div>

                  {/* Tracking Number / AWB */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Tracking Number / AWB</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. DLV8492019482"
                        value={editTracking}
                        onChange={(e) => setEditTracking(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-mono text-xs font-bold text-stone-900 outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Payment Status</label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value as Order["paymentStatus"])}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-bold text-stone-900 outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="paid">Paid (Verified)</option>
                      <option value="refunded">Refunded</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  {/* Internal Admin Notes */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">Internal Fulfillment Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Wrapped with gold satin ribbon; dispatched via Delhivery express van"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-stone-500">
                    {editTracking ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> AWB ready to track
                      </span>
                    ) : (
                      "Please provide tracking number once parcel is handed over"
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={savingChanges}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/25 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingChanges ? "Saving Updates..." : "Save Order Updates"}</span>
                  </button>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Delivery Recipient Card */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
                  <span className="font-bold text-stone-900 flex items-center gap-1 text-xs uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" /> Recipient & Shipping Address
                  </span>
                  <div>
                    <p className="font-extrabold text-stone-900 text-sm">{inspectedOrder.shippingAddress.fullName}</p>
                    <p className="text-stone-600">{inspectedOrder.shippingAddress.addressLine1}</p>
                    {inspectedOrder.shippingAddress.addressLine2 && (
                      <p className="text-stone-600">{inspectedOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p className="text-stone-600 font-semibold">
                      {inspectedOrder.shippingAddress.city}, {inspectedOrder.shippingAddress.state} - {inspectedOrder.shippingAddress.pincode}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                    <a
                      href={`tel:${inspectedOrder.shippingAddress.phone}`}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Phone className="w-3 h-3 text-stone-500" />
                      <span>{inspectedOrder.shippingAddress.phone}</span>
                    </a>
                    {inspectedOrder.customerEmail && (
                      <a
                        href={`mailto:${inspectedOrder.customerEmail}`}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Mail className="w-3 h-3 text-stone-500" />
                        <span>{inspectedOrder.customerEmail}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Financial Summary Card */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
                  <span className="font-bold text-stone-900 flex items-center gap-1 text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Payment & Billing
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-stone-600">
                      <span>Payment Method:</span>
                      <strong className="uppercase text-stone-900">{inspectedOrder.paymentMethod}</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Payment Status:</span>
                      <strong className="text-emerald-700 uppercase">{inspectedOrder.paymentStatus}</strong>
                    </div>
                    {inspectedOrder.paymentId && (
                      <div className="flex justify-between text-stone-600">
                        <span>Gateway Txn ID:</span>
                        <span className="font-mono text-stone-800 text-[11px]">{inspectedOrder.paymentId}</span>
                      </div>
                    )}
                    {inspectedOrder.couponCode && (
                      <div className="flex justify-between text-stone-600">
                        <span>Coupon Voucher:</span>
                        <strong className="text-rose-600 font-mono">🏷️ {inspectedOrder.couponCode}</strong>
                      </div>
                    )}
                    {inspectedOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount Applied:</span>
                        <span>-₹{inspectedOrder.discount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-900 font-extrabold text-sm pt-2 border-t border-stone-100">
                      <span>Total Paid:</span>
                      <span>₹{inspectedOrder.total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items & Customization Specifications */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-rose-500" />
                  Gifts & Customization Specifications ({inspectedOrder.items.length})
                </h3>

                <div className="divide-y divide-stone-100 bg-white rounded-2xl border border-stone-200/80 p-4">
                  {inspectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200 flex items-center justify-center">
                        {item.productImage ? (
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                        ) : (
                          <Gift className="w-6 h-6 text-rose-300 stroke-[1.5]" />
                        )}
                      </div>

                      <div className="flex-1 text-xs space-y-2">
                        <div className="flex justify-between">
                          <h4 className="font-bold text-stone-900 text-sm">{item.productName}</h4>
                          <span className="font-black text-stone-900 text-sm">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-stone-500">Qty: {item.quantity}</p>

                        {/* PERSONALIZATION DATA VIEWER */}
                        {item.personalizationData && Object.keys(item.personalizationData).length > 0 && (
                          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2.5">
                            <span className="font-bold flex items-center gap-1 text-amber-900 text-[11px] uppercase tracking-wider">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Customer Personalization Details:
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.entries(item.personalizationData).map(([k, v]) => {
                                if (k === "photo_data" && typeof v === "string") {
                                  return (
                                    <div key={k} className="sm:col-span-2 pt-1">
                                      <span className="text-[10px] text-stone-500 block mb-1 font-bold">
                                        Customer Uploaded Keepsake Photo:
                                      </span>
                                      <div className="relative w-36 h-36 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md">
                                        <Image src={v} alt="Uploaded photo" fill className="object-cover" />
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                  <div key={k} className="bg-white/80 p-2 rounded-lg border border-amber-200/50">
                                    <span className="capitalize text-stone-500 text-[10px] block font-semibold">
                                      {k.replace(/_/g, " ")}:
                                    </span>
                                    <span className="font-bold text-stone-900">{String(v)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
