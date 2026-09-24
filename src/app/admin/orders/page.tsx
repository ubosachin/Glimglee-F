"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getOrders, updateOrderStatus, logAdminAction } from "@/lib/services/storeDb";
import { Order } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
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
} from "lucide-react";

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  // Pagination state (15 orders per page)
  const PAGE_SIZE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Fetch with reasonable limit to prevent unbounded collection scans
    getOrders({ limitCount: 100 }).then(setOrders);
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, paymentFilter]);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    const matchPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleUpdateStatus = async (orderId: string, status: Order["orderStatus"]) => {
    const updated = await updateOrderStatus(orderId, { orderStatus: status });
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (inspectedOrder?.id === orderId) {
        setInspectedOrder(updated);
      }
      await logAdminAction(user?.email || "admin@glimglee.com", "UPDATE_ORDER_STATUS", "order", orderId, { status });
      toast(`Order status changed to "${status}"`, "success");
    }
  };

  const handleSaveTracking = async (orderId: string, trackingNumber: string, courierPartner: string) => {
    const updated = await updateOrderStatus(orderId, { trackingNumber, courierPartner });
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (inspectedOrder?.id === orderId) {
        setInspectedOrder(updated);
      }
      toast("Tracking information updated!", "success");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Fulfillment Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Orders Pipeline ({orders.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Inspect customer gift personalizations, uploaded photos, tracking AWBs, and invoices.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Customer Name, or Email..."
            className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 font-semibold text-stone-800"
            >
              <option value="all">All Statuses</option>
              <option value="placed">Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-semibold">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 font-semibold text-stone-800"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table & Mobile Cards */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-stone-100">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-stone-900">{order.customerName}</p>
                    <span className="text-[11px] text-stone-400">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "short" })}
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
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold uppercase">
                      {order.orderStatus.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setInspectedOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="font-semibold text-stone-700 text-xs">No orders recorded yet</p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Customer orders placed on the storefront will appear here instantly.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="md:hidden divide-y divide-stone-100">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No orders found matching the filter criteria.
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
                  <span className="text-base font-extrabold text-stone-900">
                    ₹{order.total.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {order.paymentStatus}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold uppercase">
                      {order.orderStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  <button
                    onClick={() => setInspectedOrder(order)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls Bar */}
        {filteredOrders.length > PAGE_SIZE && (
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <div>
              Showing <span className="font-bold text-stone-900">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
              <span className="font-bold text-stone-900">{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}</span> of{" "}
              <span className="font-bold text-stone-900">{filteredOrders.length}</span> orders
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
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
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* COMPREHENSIVE ORDER INSPECTOR MODAL */}
      {inspectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            onClick={() => setInspectedOrder(null)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Placed on {new Date(inspectedOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/orders/${inspectedOrder.id}/invoice`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 flex items-center gap-1 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
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

            {/* Scrollable Order Details Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6">

            {/* Status & Courier Update Bar */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Advance Order Status</label>
                <select
                  value={inspectedOrder.orderStatus}
                  onChange={(e) =>
                    handleUpdateStatus(inspectedOrder.id, e.target.value as Order["orderStatus"])
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-bold text-stone-900"
                >
                  <option value="placed">Order Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing & Personalizing</option>
                  <option value="packed">Packed in Keepsake Box</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered Successfully</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tracking Number / AWB</label>
                <input
                  type="text"
                  placeholder="e.g. DLV9281746201"
                  defaultValue={inspectedOrder.trackingNumber || ""}
                  onBlur={(e) =>
                    handleSaveTracking(
                      inspectedOrder.id,
                      e.target.value,
                      inspectedOrder.courierPartner || "Delhivery Surface Express"
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Customer & Delivery Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 flex items-center gap-1 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" /> Delivery Address
                </span>
                <p className="font-bold text-stone-900">{inspectedOrder.shippingAddress.fullName}</p>
                <p className="text-stone-600">{inspectedOrder.shippingAddress.addressLine1}</p>
                <p className="text-stone-600">
                  {inspectedOrder.shippingAddress.city}, {inspectedOrder.shippingAddress.state} - {inspectedOrder.shippingAddress.pincode}
                </p>
                <p className="text-stone-500 font-mono">Phone: {inspectedOrder.shippingAddress.phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 text-xs">Payment Information</span>
                <p className="text-stone-600">Method: <strong className="uppercase">{inspectedOrder.paymentMethod}</strong></p>
                <p className="text-stone-600">Status: <strong className="text-emerald-700 uppercase">{inspectedOrder.paymentStatus}</strong></p>
                {inspectedOrder.couponCode && (
                  <p className="text-stone-600">Coupon Used: <strong className="text-rose-600">{inspectedOrder.couponCode}</strong></p>
                )}
                <p className="text-stone-900 font-bold text-sm pt-1">
                  Total Paid: ₹{inspectedOrder.total.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Ordered Gifts with Personalization Inspection */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Gifts & Customization Specifications ({inspectedOrder.items.length})
              </h3>

              <div className="divide-y divide-stone-100">
                {inspectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 flex flex-col sm:flex-row gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200 flex items-center justify-center">
                      {item.productImage ? (
                        <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <Gift className="w-6 h-6 text-rose-300 stroke-[1.5]" />
                      )}
                    </div>

                    <div className="flex-1 text-xs space-y-2">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-stone-900">{item.productName}</h4>
                        <span className="font-bold text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-stone-500">Qty: {item.quantity}</p>

                      {/* PERSONALIZATION DATA VIEWER */}
                      {item.personalizationData && Object.keys(item.personalizationData).length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                          <span className="font-bold flex items-center gap-1 text-amber-800">
                            <Sparkles className="w-3.5 h-3.5" /> Customer Personalization Data:
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(item.personalizationData).map(([k, v]) => {
                              if (k === "photo_data" && typeof v === "string") {
                                return (
                                  <div key={k} className="sm:col-span-2 pt-1">
                                    <span className="text-[10px] text-stone-500 block mb-1">Customer Uploaded Photo:</span>
                                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md">
                                      <Image src={v} alt="Uploaded photo" fill className="object-cover" />
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div key={k}>
                                  <span className="capitalize text-stone-500 text-[11px] block">{k.replace(/_/g, " ")}:</span>
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
