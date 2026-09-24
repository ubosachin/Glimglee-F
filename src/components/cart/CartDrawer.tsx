"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/CartContext";
import { X, Plus, Minus, Trash2, Gift, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
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

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const res = await applyCouponCode(couponInput.trim());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer content */}
      <div className="relative z-10 w-full max-w-md bg-white h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#fbfaf8]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-lg font-bold text-stone-900 tracking-tight">Your Gift Bag</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="bg-rose-50/70 px-5 py-3 border-b border-rose-100">
          <div className="flex items-center justify-between text-xs font-medium text-rose-900 mb-1.5">
            {amountNeededForFreeShipping > 0 ? (
              <span>Add <strong className="text-rose-600 font-bold">₹{amountNeededForFreeShipping}</strong> more for <strong>FREE Delivery</strong> across India!</span>
            ) : (
              <span className="flex items-center gap-1 font-bold text-emerald-700">
                <Sparkles className="w-3.5 h-3.5" /> Congratulations! You unlocked FREE Delivery!
              </span>
            )}
            <span className="font-semibold text-rose-700">{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-rose-200/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-stone-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-4">
                <Gift className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Your gift bag is empty</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Explore our handcrafted hampers and personalized keepsakes to make someone's day special.
              </p>
              <button
                onClick={closeCart}
                className="mt-5 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Browse Trending Gifts
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5">
                {/* Image */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200 flex items-center justify-center">
                  {item.product.images?.[0] || item.product.thumbnail ? (
                    <Image
                      src={item.product.images?.[0] || item.product.thumbnail || ""}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-50 text-stone-300">
                      <Sparkles className="w-5 h-5 text-rose-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-300 hover:text-rose-500 p-0.5 ml-2 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Personalization snippet */}
                    {item.personalizationData && Object.keys(item.personalizationData).length > 0 && (
                      <div className="mt-1 p-1.5 bg-amber-50/60 rounded-md border border-amber-100 text-[10px] text-amber-900 space-y-0.5">
                        <span className="font-semibold block text-amber-800">✨ Personalized Details:</span>
                        {Object.entries(item.personalizationData).map(([key, val]) => (
                          <div key={key} className="truncate">
                            <span className="capitalize text-stone-500">{key.replace(/_/g, " ")}: </span>
                            <span className="font-medium text-stone-800">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Gift wrap toggle */}
                    <button
                      onClick={() => toggleGiftWrap(item.id)}
                      className={`mt-1.5 flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                        item.giftWrap
                          ? "bg-rose-100 border-rose-300 text-rose-800 font-semibold"
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      <Gift className="w-3 h-3 text-rose-500" />
                      <span>{item.giftWrap ? "Luxury Gift Wrap Added (+₹99)" : "Add Gift Wrap (+₹99)"}</span>
                    </button>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-stone-100 text-stone-500 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-stone-800 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-stone-100 text-stone-500 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-stone-900">
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                      {item.product.compareAtPrice && (
                        <span className="block text-[10px] text-stone-400 line-through">
                          ₹{(item.product.compareAtPrice * item.quantity).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Calculations */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-100 bg-[#fdfcfb] space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {/* Promo Code Form */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>
                      Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{discountAmount})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 underline text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon (e.g. GLOW10)"
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-rose-500 uppercase font-medium"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 mt-1 pl-1">{couponError}</p>}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-1">
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
                  <span>Luxury Gift Wrapping</span>
                  <span className="font-semibold">+₹{giftWrapFee.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="font-semibold text-emerald-600">FREE</span>
                  ) : (
                    <span className="font-semibold text-stone-900">₹{shippingFee}</span>
                  )}
                </span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-extrabold text-stone-900">
                <span>Grand Total</span>
                <span className="text-base text-rose-600">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[10px] text-stone-400 text-right">Inclusive of all taxes & GST</p>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Safe & Secure Checkout • India-wide Delivery</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
