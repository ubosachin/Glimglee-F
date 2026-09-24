"use client";

import React, { useState, useEffect } from "react";
import { getReviews, updateReviewStatus } from "@/lib/services/storeDb";
import { Review } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { Star, CheckCircle2, EyeOff, Check, Trash2, MessageSquare } from "lucide-react";

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    getReviews().then(setReviews);
  }, []);

  const handleStatus = async (id: string, status: Review["status"]) => {
    await updateReviewStatus(id, status);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    toast(`Review status updated to "${status}"`, "success");
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Social Proof Moderation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Customer Reviews ({reviews.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Approve, hide, or feature authentic customer feedback and gift unboxing reviews.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-xs text-stone-700">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{rev.userName}</h4>
                    {rev.verifiedPurchase && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Verified Gifting Buyer
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-stone-900">{rev.title}</h5>
                <p className="text-xs text-stone-600 leading-relaxed mt-1">{rev.comment}</p>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-400">
                <span>Product ID: {rev.productId}</span>
                <span>•</span>
                <span>Status: <strong className="uppercase text-stone-700">{rev.status}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              {rev.status !== "approved" && (
                <button
                  onClick={() => handleStatus(rev.id, "approved")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              {rev.status !== "hidden" && (
                <button
                  onClick={() => handleStatus(rev.id, "hidden")}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Hide
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
