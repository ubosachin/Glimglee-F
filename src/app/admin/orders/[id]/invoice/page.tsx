"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOrders } from "@/lib/services/storeDb";
import { Order } from "@/lib/types";
import { Printer, ArrowLeft, Download, ShieldCheck } from "lucide-react";

export default function StandaloneTaxInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      getOrders().then((orders) => {
        const found = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
        setOrder(found || null);
        setLoading(false);
      });
    }
  }, [orderId]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-stone-500 font-sans">Generating Tax Invoice...</div>;
  }

  if (!order) {
    return (
      <div className="p-12 text-center text-xs text-stone-500 font-sans space-y-4">
        <p>Order not found for invoice generation.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Financial Computations
  const subtotal = order.subtotal || order.total;
  const discount = order.discount || 0;
  const giftWrapFee = order.giftWrap || 0;
  const shippingFee = order.shipping || 0;
  const netTaxable = Math.max(0, subtotal - discount);
  const cgst = Math.round(netTaxable * 0.09);
  const sgst = Math.round(netTaxable * 0.09);
  const invoiceNumber = `INV-${order.orderNumber.replace("#", "")}`;

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6 print:p-0 print:bg-white text-stone-900 font-sans">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Standard A4 Sheet Container */}
      <div className="max-w-4xl mx-auto bg-white border border-stone-200 shadow-xl rounded-2xl print:border-none print:shadow-none print:rounded-none p-8 sm:p-12 space-y-8">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b-2 border-stone-900 gap-6">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-stone-900">GLIMGLEE</span>
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block mb-1" />
            </div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mt-0.5">
              Modern Gifting & Keepsakes
            </p>
            <div className="text-xs text-stone-600 mt-3 space-y-0.5 leading-relaxed">
              <p className="font-semibold text-stone-800">Glimglee Technologies Private Limited</p>
              <p>Plot 48, Ground Floor, 100 Feet Road, Indiranagar</p>
              <p>Bengaluru, Karnataka — 560038, India</p>
              <p>GSTIN: <strong className="font-mono text-stone-800">29AAAAA0000A1Z5</strong> | State Code: 29</p>
              <p>Email: billing@glimglee.com | Phone: +91 98765 43210</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md">
              Tax Invoice
            </span>
            <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">(Original for Recipient)</p>
            <div className="text-xs space-y-1 pt-2 font-mono">
              <p>
                <span className="text-stone-500 font-sans">Invoice No: </span>
                <strong className="text-stone-900">{invoiceNumber}</strong>
              </p>
              <p>
                <span className="text-stone-500 font-sans">Invoice Date: </span>
                <span>{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
              </p>
              <p>
                <span className="text-stone-500 font-sans">Order Ref: </span>
                <strong>{order.orderNumber}</strong>
              </p>
              <p>
                <span className="text-stone-500 font-sans">Payment: </span>
                <span className="capitalize">{order.paymentMethod} (PAID)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Addresses Box (Billed to & Shipped to) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
              Billed To (Customer):
            </span>
            <p className="font-bold text-stone-900 text-sm">
              {order.shippingAddress?.fullName || order.customerName || "Recipient"}
            </p>
            <p className="text-stone-600">{order.customerEmail}</p>
            <p className="text-stone-600">Phone: {order.customerPhone || order.shippingAddress?.phone}</p>
            <p className="text-stone-600">
              State: {order.shippingAddress?.state || "Karnataka"} (Place of Supply)
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
              Shipped / Delivered To:
            </span>
            <p className="font-bold text-stone-900 text-sm">
              {order.shippingAddress?.fullName || order.customerName || "Recipient"}
            </p>
            <p className="text-stone-600">
              {order.shippingAddress?.addressLine1}
              {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
            </p>
            {order.shippingAddress?.landmark && (
              <p className="text-stone-500 text-[11px]">Landmark: {order.shippingAddress.landmark}</p>
            )}
            <p className="text-stone-800 font-medium">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
            </p>
            {order.trackingNumber && (
              <p className="text-[11px] font-mono text-rose-600 pt-1">
                Dispatch AWB: {order.trackingNumber}
              </p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-900 bg-stone-100 text-[11px] uppercase font-bold text-stone-700">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Item Description & Customization</th>
                <th className="py-2.5 px-3">HSN Code</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {order.items.map((item, idx) => (
                <tr key={idx} className="align-top">
                  <td className="py-3 px-3 font-mono text-stone-500">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-stone-900">{item.productName}</p>
                    {item.personalizationData && Object.keys(item.personalizationData).length > 0 && (
                      <div className="mt-1 text-[11px] text-stone-600 bg-rose-50/50 p-2 rounded border border-rose-100 space-y-0.5">
                        <span className="font-semibold text-rose-700 block">Personalization details:</span>
                        {Object.entries(item.personalizationData).map(([k, v]) => (
                          <div key={k} className="flex gap-1.5 text-[10px]">
                            <span className="capitalize text-stone-500">{k}:</span>
                            <span className="font-medium text-stone-800">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-stone-500">49119990</td>
                  <td className="py-3 px-3 text-center font-bold text-stone-800">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono text-stone-700">
                    {item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                    {(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}

              {order.giftWrap > 0 && (
                <tr className="align-top bg-stone-50/50">
                  <td className="py-2.5 px-3 font-mono text-stone-500">•</td>
                  <td className="py-2.5 px-3 font-medium text-stone-800">
                    Luxury Gift Wrap & Handwritten Artisan Greeting Card
                  </td>
                  <td className="py-2.5 px-3 font-mono text-stone-500">481910</td>
                  <td className="py-2.5 px-3 text-center font-bold text-stone-800">1</td>
                  <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                    {order.giftWrap.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                    {order.giftWrap.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation & Tax Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pt-4 border-t border-stone-200">
          <div className="text-xs space-y-2 max-w-sm">
            <span className="font-bold text-stone-900 block uppercase tracking-wide text-[11px]">
              Tax Analysis (Inclusive GST 18%)
            </span>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] space-y-1 font-mono text-stone-600">
              <div className="flex justify-between">
                <span>Central GST (CGST 9%):</span>
                <span>₹{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>State GST (SGST 9%):</span>
                <span>₹{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-800 border-t border-stone-200 pt-1">
                <span>Total Tax Amount:</span>
                <span>₹{(cgst + sgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 italic">
              Amount in words: Indian Rupees {order.total} Only.
            </p>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-mono">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Promo Discount ({order.couponCode || "COUPON"}):</span>
                <span className="font-mono">-₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {giftWrapFee > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Gift Wrapping:</span>
                <span className="font-mono">₹{giftWrapFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-600">
              <span>Shipping & Delivery:</span>
              <span className="font-mono">
                {shippingFee === 0 ? "FREE" : `₹${shippingFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              </span>
            </div>

            <div className="flex justify-between text-sm font-black text-stone-900 border-t-2 border-stone-900 pt-2">
              <span>Grand Total:</span>
              <span className="font-mono text-base text-rose-600">
                ₹{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Declaration & Signature */}
        <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-end justify-between gap-6 text-[11px] text-stone-500">
          <div className="space-y-1">
            <p className="font-bold text-stone-700">Terms & Conditions:</p>
            <p>1. Goods once sold are covered under Glimglee Happiness Guarantee.</p>
            <p>2. Any dispute shall be subject to the exclusive jurisdiction of Bengaluru courts.</p>
            <p className="text-stone-400">This is a system generated computer invoice and requires no physical signature.</p>
          </div>

          <div className="text-right space-y-2">
            <div className="w-32 h-10 border-b border-dashed border-stone-400 flex items-center justify-center text-stone-400 text-[10px]">
              [Authorized Signatory]
            </div>
            <p className="font-bold text-stone-800">For Glimglee Technologies Pvt. Ltd.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
