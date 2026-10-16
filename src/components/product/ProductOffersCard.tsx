"use client";

import React, { useState, useEffect } from "react";
import { Coupon } from "@/lib/types";
import { getAvailableCoupons } from "@/lib/services/coupons";
import { AvailableCouponsModal } from "@/components/cart/AvailableCouponsModal";
import { useCart } from "@/lib/cart/CartContext";
import { Ticket, Copy, Check, ArrowRight, Sparkles, Tag } from "lucide-react";

interface ProductOffersCardProps {
  className?: string;
}

export const ProductOffersCard: React.FC<ProductOffersCardProps> = ({ className = "" }) => {
  const { subtotal, appliedCoupon, applyCouponCode, removeCoupon } = useCart();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchOffers = () => {
      getAvailableCoupons().then((list) => {
        // Pick top 2 most attractive coupons for display
        setCoupons(list.slice(0, 2));
      });
    };

    fetchOffers();

    window.addEventListener("glimglee_coupons_updated", fetchOffers);
    return () => {
      window.removeEventListener("glimglee_coupons_updated", fetchOffers);
    };
  }, []);

  if (coupons.length === 0) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br from-rose-50/40 via-amber-50/20 to-white border border-rose-100/80 shadow-xs space-y-3 ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
          <Ticket className="w-4 h-4 text-rose-600" />
          <span>Available Offers & Coupons</span>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-2.5 rounded-xl bg-white border border-stone-200/80 flex items-center justify-between gap-2 shadow-xs"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                  {c.code}
                </span>
                <span className="text-[11px] font-bold text-rose-600 truncate">
                  {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                </span>
              </div>
              <p className="text-[10px] text-stone-500 truncate mt-0.5">
                {c.minOrderValue > 0 ? `Orders ₹${c.minOrderValue}+` : "No min order"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(c.code)}
              className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors flex-shrink-0"
              title="Copy Code"
            >
              {copiedCode === c.code ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AvailableCouponsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        subtotal={subtotal}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={applyCouponCode}
        onRemoveCoupon={removeCoupon}
      />
    </div>
  );
};
