"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/CartContext";
import {
  Trash2,
  Plus,
  Minus,
  Gift,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    giftWrapFee,
    shippingFee,
    total,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    toggleGiftWrap,
    amountNeededForFreeShipping,
    freeShippingProgress,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg("");
    const res = await applyCouponCode(couponCode.trim());
    setCouponLoading(false);
    setCouponMsg(res.message);
    if (res.success) setCouponCode("");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <Gift className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h1 className="text-2xl font-black text-stone-900">Your Gift Bag Is Waiting</h1>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Explore our handcrafted hampers and personalized keepsakes to find something truly memorable.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all"
        >
          <span>Explore Trending Gifts</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200/80 pb-6 gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Shopping Gift Bag
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Review your gift items, personalized notes, and apply coupons.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 self-start sm:self-auto"
        >
          Clear entire bag
        </button>
      </div>

      {/* Free Shipping Notification */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs font-bold text-rose-900 mb-1.5">
          {amountNeededForFreeShipping > 0 ? (
            <span>
              Add <strong className="text-rose-600">₹{amountNeededForFreeShipping}</strong> more to unlock <strong>FREE Delivery</strong> across India!
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              You unlocked FREE Pan-India Shipping!
            </span>
          )}
          <span>{freeShippingProgress}%</span>
        </div>
        <div className="w-full bg-rose-200/70 h-2 rounded-full overflow-hidden">
          <div
            className="bg-rose-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Items Table */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-5"
            >
              {/* Product Image */}
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                <Image
                  src={item.product.images[0] || item.product.thumbnail || ""}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-bold text-stone-900 hover:text-rose-600 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-300 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Personalization Info */}
                  {item.personalizationData && Object.keys(item.personalizationData).length > 0 && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-amber-800">
                        <Sparkles className="w-3.5 h-3.5" /> Customized Details:
                      </span>
                      {Object.entries(item.personalizationData).map(([key, val]) => (
                        <div key={key} className="text-[11px] truncate">
                          <span className="capitalize text-stone-500">{key.replace(/_/g, " ")}: </span>
                          <span className="font-semibold text-stone-900">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Gift Wrap Toggle */}
                  <div className="mt-2.5">
                    <button
                      onClick={() => toggleGiftWrap(item.id)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all inline-flex items-center gap-1.5 ${
                        item.giftWrap
                          ? "bg-rose-100 border-rose-300 text-rose-800 font-bold"
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5 text-rose-500" />
                      <span>{item.giftWrap ? "Luxury Gift Wrap Added (+₹99)" : "Add Luxury Gift Wrap (+₹99)"}</span>
                    </button>
                  </div>
                </div>

                {/* Price & Quantity Controls */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 px-2 hover:bg-stone-100 text-stone-500"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-stone-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 px-2 hover:bg-stone-100 text-stone-500"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-stone-900">
                      ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                    {item.product.compareAtPrice && (
                      <span className="block text-xs text-stone-400 line-through">
                        ₹{(item.product.compareAtPrice * item.quantity).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping For More Gifts
          </Link>
        </div>

        {/* Right: Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Order Summary
            </h3>

            {/* Coupon Box */}
            <div>
              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-800">Coupon {appliedCoupon.code}</span>
                    <p className="text-[11px] text-emerald-600">Saved ₹{discountAmount} on your gifts</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-700 underline font-bold text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon (e.g. GLOW10)"
                    className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-stone-200 outline-none uppercase font-bold"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}
              {couponMsg && <p className="text-[11px] text-stone-600 mt-1">{couponMsg}</p>}
            </div>

            {/* Calculations breakdown */}
            <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              {giftWrapFee > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>Signature Gift Wrapping</span>
                  <span className="font-semibold">+₹{giftWrapFee.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span className="font-semibold text-stone-900">₹{shippingFee}</span>
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-extrabold text-stone-900">
                <span>Grand Total</span>
                <span className="text-xl text-rose-600">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[10px] text-stone-400 text-right">Includes all taxes and GST</p>
            </div>

            {/* Checkout Button */}
            <div className="pt-2">
              <Link
                href="/checkout"
                className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-xl shadow-rose-600/25 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Encrypted & Safe Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
