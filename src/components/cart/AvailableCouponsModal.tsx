"use client";

import React, { useState, useEffect } from "react";
import { Coupon } from "@/lib/types";
import { getAvailableCoupons } from "@/lib/services/coupons";
import {
  Ticket,
  X,
  Copy,
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
} from "lucide-react";

interface AvailableCouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  onRemoveCoupon: () => void;
}

export const AvailableCouponsModal: React.FC<AvailableCouponsModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAvailableCoupons()
        .then((data) => {
          setCoupons(data);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApply = async (code: string) => {
    setApplyingCode(code);
    try {
      const res = await onApplyCoupon(code);
      if (res.success) {
        onClose();
      }
    } finally {
      setApplyingCode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Ticket className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Available Offers & Coupons
              </h3>
              <p className="text-[11px] text-stone-500">
                Select an offer to apply instant savings to your gift bag
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coupon List Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500">Checking available festive offers...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Tag className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-700">No active offers available</p>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                Check back soon or sign up for our celebration newsletter to receive exclusive discount codes.
              </p>
            </div>
          ) : (
            coupons.map((coupon) => {
              const isApplied = appliedCoupon?.code.toUpperCase() === coupon.code.toUpperCase();
              const qualifies = subtotal >= (coupon.minOrderValue || 0);
              const shortfall = (coupon.minOrderValue || 0) - subtotal;
              const isApplying = applyingCode === coupon.code;

              return (
                <div
                  key={coupon.id}
                  className={`relative p-4 rounded-2xl border transition-all ${
                    isApplied
                      ? "bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20"
                      : qualifies
                      ? "bg-white border-stone-200/90 hover:border-rose-300 hover:shadow-md"
                      : "bg-stone-50/70 border-stone-200/60 opacity-80"
                  }`}
                >
                  {/* Top Bar: Code + Discount + Copy */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black tracking-wider text-stone-900 bg-stone-100 px-2.5 py-1 rounded-xl border border-stone-200/80">
                          {coupon.code}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleCopy(coupon.code, e)}
                          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {coupon.autoApply && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                            <Zap className="w-2.5 h-2.5 fill-current" />
                            <span>Auto-Applies</span>
                          </span>
                        )}
                      </div>

                      <div className="text-base font-black text-rose-600">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `Flat ₹${coupon.discountValue.toLocaleString("en-IN")} OFF`}
                      </div>
                    </div>

                    {/* Apply / Applied Button */}
                    <div>
                      {isApplied ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Applied</span>
                          </span>
                          <button
                            type="button"
                            onClick={onRemoveCoupon}
                            className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!qualifies || isApplying}
                          onClick={() => handleApply(coupon.code)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                            qualifies
                              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                              : "bg-stone-200 text-stone-400 cursor-not-allowed"
                          }`}
                        >
                          {isApplying ? (
                            <span className="animate-pulse">Applying...</span>
                          ) : (
                            <>
                              <span>Apply</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description & Terms */}
                  <div className="mt-2.5 pt-2 border-t border-stone-100 text-xs text-stone-600 space-y-1">
                    {coupon.description && (
                      <p className="font-medium text-stone-700">{coupon.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500">
                      {coupon.minOrderValue > 0 && (
                        <span>
                          Min Order: <strong>₹{coupon.minOrderValue.toLocaleString("en-IN")}</strong>
                        </span>
                      )}
                      {coupon.maxDiscount > 0 && coupon.discountType === "percentage" && (
                        <span>
                          Max Savings: <strong>₹{coupon.maxDiscount.toLocaleString("en-IN")}</strong>
                        </span>
                      )}
                      {coupon.expiryDate && (
                        <span>
                          Valid till:{" "}
                          <strong>
                            {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </strong>
                        </span>
                      )}
                    </div>

                    {!qualifies && shortfall > 0 && (
                      <p className="text-[11px] text-amber-700 font-semibold pt-1">
                        ✨ Add ₹{shortfall.toLocaleString("en-IN")} more to qualify for this discount!
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between text-[11px] text-stone-500 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Guaranteed genuine discounts at checkout</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-stone-700 hover:text-stone-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
