"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { getOrders } from "@/lib/services/storeDb";
import { Order } from "@/lib/types";
import {
  Package,
  Heart,
  MapPin,
  User,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Truck,
} from "lucide-react";

export default function AccountOverviewPage() {
  const { user, isAdmin, isManager } = useAuth();
  const { wishlist } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      getOrders().then((all) => {
        const userOrders = all.filter(
          (o) =>
            o.userId === user.uid ||
            (user.email && o.customerEmail.toLowerCase() === user.email.toLowerCase())
        );
        setOrders(userOrders);
      });
    } else {
      setOrders([]);
    }
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200/80 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-xl">
            {user ? user.displayName.charAt(0).toUpperCase() : "G"}
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {user ? user.displayName : "Welcome, Gifting Enthusiast"}
            </h1>
            <p className="text-xs text-stone-500">
              {user ? user.email : "Sign in to track your bespoke gifts"}
            </p>
          </div>
        </div>

        {!user && (
          <Link
            href="/login"
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors self-start sm:self-auto"
          >
            Sign In to Your Account
          </Link>
        )}

        {(isAdmin || isManager) && (
          <Link
            href="/admin/dashboard"
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20"
          >
            <SlidersHorizontal className="w-4 h-4 text-white" />
            <span>Open Admin Suite</span>
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Gift Orders</span>
            <p className="text-2xl font-black text-stone-900">{orders.length}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Saved In Wishlist</span>
            <p className="text-2xl font-black text-stone-900">{wishlist.length}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Membership Tier</span>
            <p className="text-base font-extrabold text-stone-900">Glimglee Gold Club</p>
          </div>
        </div>
      </div>

      {/* Account Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Link
          href="/account/orders"
          className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-rose-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 group-hover:text-rose-600 transition-colors">
                My Orders
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Past purchases, delivery status & invoices
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-rose-600">
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/orders/track"
          className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-rose-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 group-hover:text-rose-600 transition-colors">
                Track Order
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Live delivery status & AWB courier tracking
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-rose-600">
            <span>Track Delivery</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-rose-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 group-hover:text-rose-600 transition-colors">
                Saved Addresses
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Manage home, work & loved ones' addresses
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-rose-600">
            <span>Manage</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/account/profile"
          className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-rose-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 group-hover:text-rose-600 transition-colors">
                Profile & Reminders
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Name, phone & anniversary dates
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-rose-600">
            <span>Edit Profile</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/wishlist"
          className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-rose-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 group-hover:text-rose-600 transition-colors">
                My Wishlist
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Curated items saved for future celebrations
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-rose-600">
            <span>Saved ({wishlist.length})</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-base font-bold text-stone-900">Recent Gift Orders</h2>
            <p className="text-xs text-stone-500">Track delivery status & view past invoices.</p>
          </div>
          <Link href="/account/orders" className="text-xs font-bold text-rose-600 hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="divide-y divide-stone-100">
          {orders.slice(0, 4).map((order) => (
            <div key={order.id} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 font-mono">{order.orderNumber}</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold uppercase">
                    {order.orderStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-stone-500">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"} • Total: <strong>₹{order.total.toLocaleString("en-IN")}</strong>
                </p>
                <p className="text-[11px] text-stone-400">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/orders/${order.id}/invoice`}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors"
                >
                  Tax Invoice
                </Link>
                <Link
                  href={`/orders/track?orderId=${order.orderNumber}`}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                >
                  Track Package
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
