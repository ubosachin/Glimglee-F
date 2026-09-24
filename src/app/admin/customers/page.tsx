"use client";

import React, { useState, useEffect } from "react";
import { getOrders } from "@/lib/services/storeDb";
import { Order } from "@/lib/types";
import { Users, Search, ShoppingBag } from "lucide-react";

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  // Aggregate customers from orders
  const customerMap = new Map<string, {
    name: string;
    email: string;
    phone: string;
    ordersCount: number;
    totalSpent: number;
    lastOrderDate: string;
    city: string;
  }>();

  for (const o of orders) {
    const key = o.customerEmail.toLowerCase();
    const existing = customerMap.get(key);
    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += o.total;
      if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = o.createdAt;
      }
    } else {
      customerMap.set(key, {
        name: o.customerName,
        email: o.customerEmail,
        phone: o.customerPhone,
        ordersCount: 1,
        totalSpent: o.total,
        lastOrderDate: o.createdAt,
        city: o.shippingAddress.city,
      });
    }
  }

  const customerList = Array.from(customerMap.values()).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            CRM & Buyers
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Customer Directory ({customerList.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Analyze customer lifetime value (LTV), purchase frequency, and city distribution.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full text-xs bg-white pl-8 pr-3 py-2 rounded-xl border border-stone-200 outline-none"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-stone-100">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {customerList.map((c, idx) => (
                <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-stone-900">{c.name}</td>
                  <td className="py-3.5 px-4 text-stone-600 font-mono">{c.email}</td>
                  <td className="py-3.5 px-4 text-stone-600">{c.phone}</td>
                  <td className="py-3.5 px-4 text-stone-600">{c.city}</td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">{c.ordersCount}</td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    ₹{c.totalSpent.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      Active Buyer
                    </span>
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
