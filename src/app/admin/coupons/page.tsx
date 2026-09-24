"use client";

import React, { useState, useEffect } from "react";
import { getCoupons, saveCoupon, deleteCoupon, logAdminAction } from "@/lib/services/storeDb";
import { Coupon } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Plus, Ticket, Trash2, Edit, X, CheckCircle2 } from "lucide-react";

export default function AdminCouponsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getCoupons().then(setCoupons);
  }, []);

  const handleOpenCreate = () => {
    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: "",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 499,
      maxDiscount: 200,
      startDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      usageLimit: 100,
      usageCount: 0,
      active: true,
    };
    setEditingCoupon(newCoupon);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    await saveCoupon(editingCoupon);
    await logAdminAction(user?.email || "admin@glimglee.com", "SAVE_COUPON", "coupon", editingCoupon.id, {
      code: editingCoupon.code,
    });

    setCoupons((prev) => {
      const idx = prev.findIndex((c) => c.id === editingCoupon.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = editingCoupon;
        return u;
      }
      return [editingCoupon, ...prev];
    });

    setModalOpen(false);
    toast(`Promo code "${editingCoupon.code}" saved!`, "success");
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    await deleteCoupon(id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast(`Deleted coupon "${code}"`, "info");
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Marketing & Growth
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Promotional Coupons ({coupons.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure percentage or fixed INR discounts with minimum order thresholds.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-base font-black text-rose-600 tracking-wider">
                  {coupon.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    coupon.active ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {coupon.active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="text-sm font-extrabold text-stone-900">
                {coupon.discountType === "percentage"
                  ? `${coupon.discountValue}% OFF`
                  : `Flat ₹${coupon.discountValue} OFF`}
              </div>

              <div className="text-xs text-stone-500 space-y-1 mt-2">
                <p>Min Order: <strong>₹{coupon.minOrderValue}</strong></p>
                {coupon.maxDiscount && (
                  <p>Max Discount Cap: <strong>₹{coupon.maxDiscount}</strong></p>
                )}
                <p>Used: <strong>{coupon.usageCount}</strong> / {coupon.usageLimit}</p>
                <p className="text-[11px] text-stone-400">Expires: {coupon.expiryDate}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setEditingCoupon(coupon);
                  setModalOpen(true);
                }}
                className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(coupon.id, coupon.code)}
                className="p-2 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm space-y-3">
            <Ticket className="w-10 h-10 mx-auto text-stone-300" />
            <h3 className="text-sm font-bold text-stone-800">No Discount Coupons</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Create promotional codes (e.g. GLOW10, FESTIVE) for your customers.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
            >
              Create First Coupon
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-stone-100 bg-white flex-shrink-0">
              <h3 className="text-base font-bold text-stone-900">
                {editingCoupon.code ? "Edit Coupon" : "Create New Coupon"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discountType}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={editingCoupon.discountValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={editingCoupon.minOrderValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={editingCoupon.maxDiscount}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editingCoupon.expiryDate.split("T")[0]}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={editingCoupon.usageLimit}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={editingCoupon.active}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, active: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                  <span>Coupon Is Active</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-sm"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
