"use client";

import React, { useState } from "react";
import { Coupon } from "@/lib/types";
import { AvailableCouponsModal } from "./AvailableCouponsModal";
import { Ticket, Sparkles, X, Check, ArrowRight, Tag } from "lucide-react";

interface CouponApplySectionProps {
  appliedCoupon: Coupon | null;
  discountAmount: number;
  subtotal: number;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  compact?: boolean;
  className?: string;
}

export const CouponApplySection: React.FC<CouponApplySectionProps> = ({
  appliedCoupon,
  discountAmount,
  subtotal,
  applyCouponCode,
  removeCoupon,
  compact = false,
  className = "",
}) => {
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleApply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputCode.trim();
    if (!clean) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await applyCouponCode(clean);
      if (res.success) {
        setInputCode("");
        setMessage({ text: res.message, type: "success" });
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to validate coupon code. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFromModal = async (code: string) => {
    return await applyCouponCode(code);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {appliedCoupon ? (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/40 border border-emerald-200 text-xs shadow-xs transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-emerald-950 uppercase">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-bold uppercase">
                    Applied
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {discountAmount > 0
                    ? `Saved ₹${discountAmount.toLocaleString("en-IN")} on your order!`
                    : appliedCoupon.description || "Coupon discount applied"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeCoupon}
              className="text-stone-400 hover:text-rose-600 p-1 rounded-lg hover:bg-white/80 transition-colors text-[11px] font-bold"
              title="Remove Coupon"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Coupon Entry Form */}
          <form onSubmit={handleApply} className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase());
                  if (message) setMessage(null);
                }}
                placeholder="Enter Coupon (e.g. GLOW10)"
                className="w-full text-xs pl-8.5 pr-3 py-2.5 rounded-xl border border-stone-200 outline-none uppercase font-mono font-bold text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
            >
              {loading ? "..." : "Apply"}
            </button>
          </form>

          {/* Feedback Message */}
          {message && (
            <p
              className={`text-[11px] font-medium transition-all ${
                message.type === "success" ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Browse Available Offers trigger */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full py-1.5 px-2.5 rounded-xl bg-rose-50/60 hover:bg-rose-50 border border-rose-200/60 text-rose-700 text-[11px] font-bold flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-rose-600" />
              <span>View Available Offers & Coupons</span>
            </div>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}

      {/* Available Coupons Modal */}
      <AvailableCouponsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        subtotal={subtotal}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyFromModal}
        onRemoveCoupon={removeCoupon}
      />
    </div>
  );
};
