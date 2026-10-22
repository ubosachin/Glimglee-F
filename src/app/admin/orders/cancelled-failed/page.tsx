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
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
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
  MessageCircle,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Save,
  HelpCircle,
  DollarSign,
  Copy,
  Check,
} from "lucide-react";

export default function CancelledFailedOrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [issueFilter, setIssueFilter] = useState<string>("all");
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  // Edit / Recovery form state in modal
  const [recoveryUtr, setRecoveryUtr] = useState("");
  const [editStatus, setEditStatus] = useState<Order["orderStatus"]>("cancelled");
  const [editPaymentStatus, setEditPaymentStatus] = useState<Order["paymentStatus"]>("failed");
  const [editNotes, setEditNotes] = useState("");
  const [savingChanges, setSavingChanges] = useState(false);
  const [recoveringOrder, setRecoveringOrder] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Pagination state (15 orders per page)
  const PAGE_SIZE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      let data = await getOrders({ type: "cancelled-failed", limitCount: 200 });

      // Fallback: If type filter returned empty but orders exist in pipeline, fetch all and filter client-side
      if (!data || data.length === 0) {
        const all = await getOrders({ limitCount: 200 });
        data = all.filter(
          (o) =>
            o.orderStatus === "cancelled" ||
            o.paymentStatus === "failed" ||
            o.paymentStatus === "refunded" ||
            (o.orderStatus === "pending_payment" && o.paymentStatus !== "paid")
        );
      }

      // Filter for cancelled, failed, or unpaid pending orders
      const failedList = (data || []).filter(
        (o) =>
          o.orderStatus === "cancelled" ||
          o.paymentStatus === "failed" ||
          o.paymentStatus === "refunded" ||
          (o.orderStatus === "pending_payment" && o.paymentStatus !== "paid")
      );
      setOrders(failedList);
    } catch (e) {
      console.warn("Failed to fetch cancelled/failed orders:", e);
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
      setEditPaymentStatus(inspectedOrder.paymentStatus);
      setEditNotes(inspectedOrder.notes || "");
      setRecoveryUtr("");
      setCopiedText(false);
    }
  }, [inspectedOrder]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, issueFilter]);

  // Categorize helper for badge & filter
  const getOrderIssueType = (o: Order) => {
    if (o.paymentStatus === "failed") return "failed_payment";
    if (o.orderStatus === "cancelled") return "cancelled";
    if (o.paymentStatus === "refunded") return "refunded";
    if (o.orderStatus === "pending_payment" && o.paymentStatus !== "paid") return "abandoned";
    return "other";
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.shippingAddress?.city && o.shippingAddress.city.toLowerCase().includes(q));

      const issueType = getOrderIssueType(o);
      const matchIssue =
        issueFilter === "all" ||
        (issueFilter === "failed_payment" && issueType === "failed_payment") ||
        (issueFilter === "abandoned" && issueType === "abandoned") ||
        (issueFilter === "cancelled" && issueType === "cancelled") ||
        (issueFilter === "refunded" && issueType === "refunded");

      return Boolean(matchSearch && matchIssue);
    });
  }, [orders, search, issueFilter]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = orders.length;
    const paymentFailed = orders.filter((o) => o.paymentStatus === "failed").length;
    const abandoned = orders.filter((o) => o.orderStatus === "pending_payment" && o.paymentStatus !== "paid").length;
    const cancelled = orders.filter((o) => o.orderStatus === "cancelled").length;
    const refunded = orders.filter((o) => o.paymentStatus === "refunded").length;
    const lostValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    return { total, paymentFailed, abandoned, cancelled, refunded, lostValue };
  }, [orders]);

  // Construct WhatsApp recovery message
  const getWhatsAppLink = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(
      `Hello ${order.customerName}! 🌸 We noticed your gift order ${order.orderNumber} for ${order.shippingAddress.city} was interrupted during payment on Glimglee. If money was debited from your bank or you need quick assistance with UPI/card payment, please let us know so we can secure your order right away!`
    );
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  // MANUAL RECOVERY: Convert failed order to confirmed & paid
  const handleRecoverOrder = async () => {
    if (!inspectedOrder) return;
    setRecoveringOrder(true);

    try {
      const now = new Date().toISOString();
      const utrText = recoveryUtr.trim() || `MANUAL-${Date.now().toString().slice(-6)}`;
      const noteEntry = `[${now}] Manually recovered & confirmed by ${user?.email || "Admin"} with UTR/Ref: ${utrText}. ${editNotes.trim()}`;

      const updates: Partial<Order> = {
        orderStatus: "confirmed",
        paymentStatus: "paid",
        paymentId: utrText,
        notes: noteEntry,
      };

      const updated = await updateOrderStatus(inspectedOrder.id, updates);
      if (updated) {
        // Remove from failed list because it is now confirmed
        setOrders((prev) => prev.filter((o) => o.id !== updated.id));
        setInspectedOrder(null);

        await logAdminAction(
          user?.email || "admin@glimglee.com",
          "MANUAL_RECOVER_ORDER",
          "order",
          inspectedOrder.id,
          { utr: utrText, previousStatus: inspectedOrder.orderStatus }
        );

        toast(`Order ${inspectedOrder.orderNumber} successfully recovered and marked as Confirmed!`, "success");
      }
    } catch (e) {
      console.error("Recover order error:", e);
      toast("Failed to recover order", "error");
    } finally {
      setRecoveringOrder(false);
    }
  };

  // Regular Save (change status / notes)
  const handleSaveChanges = async () => {
    if (!inspectedOrder) return;
    setSavingChanges(true);

    try {
      const updates: Partial<Order> = {
        orderStatus: editStatus,
        paymentStatus: editPaymentStatus,
        notes: editNotes.trim(),
      };

      const updated = await updateOrderStatus(inspectedOrder.id, updates);
      if (updated) {
        // If status changed to confirmed, remove from failed list
        if (updated.orderStatus === "confirmed" && updated.paymentStatus === "paid") {
          setOrders((prev) => prev.filter((o) => o.id !== updated.id));
          setInspectedOrder(null);
          toast(`Order ${inspectedOrder.orderNumber} moved to Confirmed Orders!`, "success");
        } else {
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          setInspectedOrder(updated);
          toast(`Order ${inspectedOrder.orderNumber} updated!`, "success");
        }

        await logAdminAction(
          user?.email || "admin@glimglee.com",
          "UPDATE_FAILED_ORDER",
          "order",
          inspectedOrder.id,
          updates
        );
      }
    } catch (e) {
      console.error("Save error:", e);
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
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Issues & Incomplete Orders
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            Cancelled & Failed Orders ({orders.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Review abandoned checkouts, reach out to customers on WhatsApp, and manually recover payments.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <OrdersNavigationTabs onRefresh={fetchOrders} isRefreshing={refreshing} />

      {/* Top KPI Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Total Incomplete</span>
          <p className="text-2xl font-black text-stone-900">{metrics.total}</p>
          <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
            <AlertTriangle className="w-3 h-3" /> Unfulfilled orders
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Payment Failed</span>
          <p className="text-2xl font-black text-rose-900">{metrics.paymentFailed}</p>
          <span className="text-[10px] text-stone-400">Gateway/Bank decline</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Abandoned Cart</span>
          <p className="text-2xl font-black text-amber-900">{metrics.abandoned}</p>
          <span className="text-[10px] text-stone-400">Left at payment screen</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-600 tracking-wider">Cancelled</span>
          <p className="text-2xl font-black text-stone-800">{metrics.cancelled}</p>
          <span className="text-[10px] text-stone-400">Customer/Admin voided</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Refunded</span>
          <p className="text-2xl font-black text-blue-900">{metrics.refunded}</p>
          <span className="text-[10px] text-stone-400">Amount returned</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-1 bg-gradient-to-br from-rose-50/50 to-white">
          <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Recoverable Value</span>
          <p className="text-2xl font-black text-rose-800">₹{metrics.lostValue.toLocaleString("en-IN")}</p>
          <span className="text-[10px] text-rose-600 font-bold">Potential sales</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Customer, Phone, Email..."
            className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-medium"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-semibold">Issue Classification:</span>
            <select
              value={issueFilter}
              onChange={(e) => setIssueFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 font-semibold text-stone-800 cursor-pointer"
            >
              <option value="all">All Incomplete ({orders.length})</option>
              <option value="failed_payment">Gateway Payment Failed</option>
              <option value="abandoned">Abandoned at Checkout</option>
              <option value="cancelled">Cancelled Orders</option>
              <option value="refunded">Refunded Orders</option>
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
                <th className="py-3.5 px-4">Customer & Phone</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Issue Type</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4 text-right">Recovery Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedOrders.map((order) => {
                const issueType = getOrderIssueType(order);
                const waLink = getWhatsAppLink(order);

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
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono font-semibold">{order.customerPhone}</span>
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
                      <span className="text-[10px] text-stone-400">{order.items.length} items</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          issueType === "failed_payment"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : issueType === "abandoned"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : issueType === "cancelled"
                            ? "bg-stone-100 text-stone-700 border-stone-200"
                            : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {issueType === "failed_payment"
                          ? "Payment Failed"
                          : issueType === "abandoned"
                          ? "Abandoned Checkout"
                          : issueType.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.paymentStatus === "failed"
                            ? "bg-rose-100 text-rose-800"
                            : order.paymentStatus === "refunded"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* WhatsApp Reachout Button */}
                      {order.customerPhone && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1 border border-emerald-200 transition-colors"
                          title="Message customer on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => setInspectedOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Recover</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 stroke-[1.5]" />
                    <p className="font-bold text-stone-700 text-sm">No failed or cancelled orders found</p>
                    <p className="text-xs text-stone-400 mt-1">
                      All recent checkouts have completed successfully!
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
              No cancelled or failed orders found.
            </div>
          ) : (
            paginatedOrders.map((order) => {
              const issueType = getOrderIssueType(order);
              const waLink = getWhatsAppLink(order);

              return (
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
                      <span className="text-[11px] text-stone-500 font-mono">
                        {order.customerPhone}
                      </span>
                    </div>
                    <span className="text-base font-black text-rose-700">
                      ₹{order.total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        issueType === "failed_payment"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : issueType === "abandoned"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      {issueType.replace(/_/g, " ")}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {order.customerPhone && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setInspectedOrder(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Recover</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Bar */}
        {filteredOrders.length > PAGE_SIZE && (
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <div>
              Showing <span className="font-bold text-stone-900">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
              <span className="font-bold text-stone-900">{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}</span> of{" "}
              <span className="font-bold text-stone-900">{filteredOrders.length}</span> records
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

      {/* FULL INSPECTION, RECOVERY & UPDATE MODAL */}
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
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold uppercase">
                    {inspectedOrder.orderStatus}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold uppercase">
                    Payment: {inspectedOrder.paymentStatus}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Placed on {new Date(inspectedOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex items-center gap-2">
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
              {/* 1. HERO RECOVERY CARD: MANUAL PAYMENT CONFIRMATION */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-2 border-emerald-300 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="font-black text-emerald-950 text-sm">
                        Manual Payment Recovery (Mark as Confirmed & Paid)
                      </h3>
                      <p className="text-[11px] text-emerald-700">
                        Use this if customer paid via direct UPI / Google Pay / PhonePe / Bank Transfer, or if Cashfree debited the account offline.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto">
                    Payable: ₹{inspectedOrder.total.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">
                      Bank Transaction ID / UTR / Reference Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI-593029104820 or ICICI-NEFT-92817"
                      value={recoveryUtr}
                      onChange={(e) => setRecoveryUtr(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 font-mono text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleRecoverOrder}
                      disabled={recoveringOrder}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{recoveringOrder ? "Confirming..." : "Confirm & Mark Paid"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. CUSTOMER WHATSAPP OUTREACH ASSISTANT */}
              {inspectedOrder.customerPhone && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      Customer WhatsApp Outreach Assistant
                    </span>
                    <a
                      href={getWhatsAppLink(inspectedOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open WhatsApp Web</span>
                    </a>
                  </div>

                  <p className="text-stone-600 text-[11px]">
                    Pre-filled message template to assist the customer with their order:
                  </p>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-stone-800 font-sans text-xs relative group">
                    <p>
                      Hello <strong>{inspectedOrder.customerName}</strong>! 🌸 We noticed your gift order <strong>{inspectedOrder.orderNumber}</strong> for {inspectedOrder.shippingAddress.city} was interrupted during payment on Glimglee. If money was debited from your bank or you need quick assistance with UPI/card payment, please let us know so we can secure your order right away!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `Hello ${inspectedOrder.customerName}! 🌸 We noticed your gift order ${inspectedOrder.orderNumber} for ${inspectedOrder.shippingAddress.city} was interrupted during payment on Glimglee. If money was debited from your bank or you need quick assistance with UPI/card payment, please let us know so we can secure your order right away!`;
                        navigator.clipboard.writeText(msg);
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                        toast("Message copied to clipboard!", "success");
                      }}
                      className="mt-2 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      {copiedText ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedText ? "Copied!" : "Copy Template Text"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. ORDER STATUS & ADMINISTRATIVE AUDIT CONTROLS */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <h3 className="font-black text-stone-900 uppercase tracking-wider">
                    Status & Administrative Notes
                  </h3>
                  <span className="text-[10px] text-stone-500">Record customer call notes & refund statuses</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Order Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as Order["orderStatus"])}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-bold text-stone-900 outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="cancelled">Cancelled (Voided)</option>
                      <option value="pending_payment">Pending Payment (Awaiting Retry)</option>
                      <option value="confirmed">Confirmed (Recovered)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Payment Status</label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value as Order["paymentStatus"])}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-bold text-stone-900 outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="failed">Failed (Declined at Gateway)</option>
                      <option value="refunded">Refunded (Amount Returned)</option>
                      <option value="pending">Pending (Unpaid)</option>
                      <option value="paid">Paid (Manually Verified)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">Support & Audit Notes</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Customer called support; bank server was down. Sent QR code via WhatsApp."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={savingChanges}
                    className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingChanges ? "Saving..." : "Save Status & Notes"}</span>
                  </button>
                </div>
              </div>

              {/* 4. Customer Contact & Address Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
                  <span className="font-bold text-stone-900 flex items-center gap-1 text-xs uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" /> Customer & Delivery Details
                  </span>
                  <div>
                    <p className="font-extrabold text-stone-900 text-sm">{inspectedOrder.shippingAddress.fullName}</p>
                    <p className="text-stone-600">{inspectedOrder.shippingAddress.addressLine1}</p>
                    <p className="text-stone-600 font-semibold">
                      {inspectedOrder.shippingAddress.city}, {inspectedOrder.shippingAddress.state} - {inspectedOrder.shippingAddress.pincode}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                    <a
                      href={`tel:${inspectedOrder.shippingAddress.phone}`}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono text-[11px] font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-stone-500" />
                      <span>{inspectedOrder.shippingAddress.phone}</span>
                    </a>
                    {inspectedOrder.customerEmail && (
                      <a
                        href={`mailto:${inspectedOrder.customerEmail}`}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-medium flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3 text-stone-500" />
                        <span>{inspectedOrder.customerEmail}</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
                  <span className="font-bold text-stone-900 flex items-center gap-1 text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Order Financial Breakdown
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-stone-600">
                      <span>Attempted Payment:</span>
                      <strong className="uppercase text-stone-900">{inspectedOrder.paymentMethod}</strong>
                    </div>
                    {inspectedOrder.couponCode && (
                      <div className="flex justify-between text-stone-600">
                        <span>Coupon Voucher:</span>
                        <strong className="text-rose-600 font-mono">🏷️ {inspectedOrder.couponCode}</strong>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal:</span>
                      <span>₹{inspectedOrder.subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {inspectedOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount:</span>
                        <span>-₹{inspectedOrder.discount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-rose-700 font-extrabold text-sm pt-2 border-t border-stone-100">
                      <span>Unpaid Balance:</span>
                      <span>₹{inspectedOrder.total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Items the Customer Intended to Purchase */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-rose-500" />
                  Cart Items & Personalization Intended ({inspectedOrder.items.length})
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
                          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
                            <span className="font-bold flex items-center gap-1 text-amber-900 text-[11px] uppercase tracking-wider">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Personalization Configuration:
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.entries(item.personalizationData).map(([k, v]) => {
                                if (k === "photo_data" && typeof v === "string") {
                                  return (
                                    <div key={k} className="sm:col-span-2 pt-1">
                                      <span className="text-[10px] text-stone-500 block mb-1 font-bold">
                                        Uploaded Keepsake Photo:
                                      </span>
                                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md">
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
