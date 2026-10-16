"use client";

import React, { useState, useEffect } from "react";
import { getCoupons, saveCoupon, deleteCoupon, logAdminAction } from "@/lib/services/storeDb";
import { generateCouponCode } from "@/lib/services/coupons";
import { Coupon } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import {
  Plus,
  Ticket,
  Trash2,
  Edit,
  X,
  Zap,
  Sparkles,
  Calendar,
  Layers,
  Copy,
  Check,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Dices,
  Eye,
  Percent,
} from "lucide-react";

export default function AdminCouponsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "auto" | "manual" | "active" | "inactive">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCoupons().then(setCoupons);
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast(`Copied code "${code}" to clipboard!`, "info");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreate = () => {
    const newCoupon: Coupon = {
      id: `cpn_${Date.now()}`,
      code: generateCouponCode("percentage", 15),
      description: "Get 15% off on handcrafted celebrations",
      discountType: "percentage",
      discountValue: 15,
      minOrderValue: 499,
      maxDiscount: 250,
      startDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      usageLimit: 500,
      usageCount: 0,
      active: true,
      autoApply: false,
    };
    setEditingCoupon(newCoupon);
    setModalOpen(true);
  };

  const handleGenerateCode = () => {
    if (!editingCoupon) return;
    const newCode = generateCouponCode(editingCoupon.discountType, editingCoupon.discountValue);
    setEditingCoupon({ ...editingCoupon, code: newCode });
    toast(`Generated code: ${newCode}`, "info");
  };

  const applyPreset = (preset: {
    discountType: "percentage" | "fixed";
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number;
    description: string;
  }) => {
    if (!editingCoupon) return;
    setEditingCoupon({
      ...editingCoupon,
      ...preset,
      code: generateCouponCode(preset.discountType, preset.discountValue),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    if (!editingCoupon.code.trim()) {
      toast("Coupon code is required", "error");
      return;
    }

    setSaving(true);
    try {
      // Ensure expiry date has end-of-day timestamp if date-only string
      let normalizedExpiry = editingCoupon.expiryDate;
      if (normalizedExpiry && /^\d{4}-\d{2}-\d{2}$/.test(normalizedExpiry.trim())) {
        normalizedExpiry = `${normalizedExpiry.trim()}T23:59:59.999Z`;
      }

      const cleanCoupon = {
        ...editingCoupon,
        code: editingCoupon.code.trim().toUpperCase(),
        expiryDate: normalizedExpiry,
        discountValue: Number(editingCoupon.discountValue) || 0,
        minOrderValue: Number(editingCoupon.minOrderValue) || 0,
        maxDiscount: Number(editingCoupon.maxDiscount) || 0,
        usageLimit: Number(editingCoupon.usageLimit) || 1000,
      };

      const saved = await saveCoupon(cleanCoupon);
      await logAdminAction(user?.email || "admin@glimglee.com", "SAVE_COUPON", "coupon", saved.id, {
        code: saved.code,
        autoApply: saved.autoApply,
        discountType: saved.discountType,
      });

      setCoupons((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id);
        if (idx >= 0) {
          const u = [...prev];
          u[idx] = saved;
          return u;
        }
        return [saved, ...prev];
      });

      setModalOpen(false);
      toast(`Coupon "${saved.code}" saved successfully!`, "success");
    } catch (err: any) {
      toast(err?.message || "Failed to save coupon", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    await deleteCoupon(id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast(`Deleted coupon "${code}"`, "info");
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const updated = { ...coupon, active: !coupon.active };
    await saveCoupon(updated);
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? updated : c)));
    toast(`Coupon "${coupon.code}" is now ${updated.active ? "Active" : "Inactive"}`, "info");
  };

  const now = new Date();
  const isCouponExpired = (c: Coupon) => {
    if (!c.expiryDate) return false;
    const exp = new Date(c.expiryDate.includes("T") ? c.expiryDate : `${c.expiryDate}T23:59:59.999Z`);
    return exp < now;
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase());

    const expired = isCouponExpired(c);

    if (!matchSearch) return false;
    if (filterTab === "auto") return c.autoApply === true;
    if (filterTab === "manual") return !c.autoApply;
    if (filterTab === "active") return c.active && !expired;
    if (filterTab === "inactive") return !c.active || expired;
    return true;
  });

  const totalCouponsCount = coupons.length;
  const activeCount = coupons.filter((c) => c.active && !isCouponExpired(c)).length;
  const autoCount = coupons.filter((c) => c.autoApply).length;
  const manualCount = coupons.filter((c) => !c.autoApply).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5" />
            Marketing & Discount Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            Promotional Coupons ({coupons.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Create percentage discounts or flat cash vouchers. Choose whether a coupon{" "}
            <strong>auto-applies automatically in cart</strong> or requires the customer to enter the code manually.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-stone-100 text-stone-700">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">Total Coupons</span>
            <span className="text-xl sm:text-2xl font-black text-stone-900">{totalCouponsCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-600 block tracking-wider">Active Deals</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-900">{activeCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-purple-600 block tracking-wider">Auto-Applied</span>
            <span className="text-xl sm:text-2xl font-black text-purple-900">{autoCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-600 block tracking-wider">Total Redemptions</span>
            <span className="text-xl sm:text-2xl font-black text-amber-900">{totalRedemptions}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or description..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              filterTab === "all"
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All ({coupons.length})
          </button>
          <button
            onClick={() => setFilterTab("auto")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === "auto"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60"
            }`}
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>Auto-Applied ({autoCount})</span>
          </button>
          <button
            onClick={() => setFilterTab("manual")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === "manual"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60"
            }`}
          >
            <Ticket className="w-3 h-3" />
            <span>Manual Code ({manualCount})</span>
          </button>
          <button
            onClick={() => setFilterTab("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterTab === "active"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterTab("inactive")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterTab === "inactive"
                ? "bg-stone-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Inactive / Expired
          </button>
        </div>
      </div>

      {/* Coupons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCoupons.map((coupon) => {
          const expired = isCouponExpired(coupon);
          const isAuto = coupon.autoApply === true;

          return (
            <div
              key={coupon.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                !coupon.active || expired
                  ? "bg-stone-50 border-stone-200/60 opacity-70"
                  : isAuto
                  ? "bg-gradient-to-br from-purple-50/40 via-white to-white border-purple-200 shadow-xs hover:shadow-md"
                  : "bg-white border-stone-200/80 shadow-xs hover:shadow-md"
              }`}
            >
              <div>
                {/* Header: Code + Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-lg font-black tracking-wider text-stone-900 bg-stone-100 px-2.5 py-1 rounded-xl border border-stone-200">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Copy Code"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                        coupon.active && !expired
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                      }`}
                      title="Click to toggle status"
                    >
                      {expired ? "Expired" : coupon.active ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>

                {/* Application Type Badge */}
                <div className="mb-3">
                  {isAuto ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-100 text-purple-800 text-[10px] font-black tracking-wide border border-purple-200">
                      <Zap className="w-3 h-3 fill-purple-600 text-purple-600" />
                      <span>⚡ AUTOMATIC APPLY IN CART</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                      <Ticket className="w-3 h-3 text-amber-600" />
                      <span>MANUAL CODE REQUIRED</span>
                    </span>
                  )}
                </div>

                {/* Value Display */}
                <div className="text-xl font-black text-rose-600">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% OFF`
                    : `Flat ₹${coupon.discountValue.toLocaleString("en-IN")} OFF`}
                </div>

                {/* Description */}
                {coupon.description && (
                  <p className="text-xs text-stone-600 mt-1 font-medium italic">
                    "{coupon.description}"
                  </p>
                )}

                {/* Conditions Tags */}
                <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                  <div className="bg-stone-50 p-2 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-stone-400 block">Min Cart Value</span>
                    <strong className="text-stone-900 font-bold">
                      {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue.toLocaleString("en-IN")}` : "No Minimum"}
                    </strong>
                  </div>

                  <div className="bg-stone-50 p-2 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-stone-400 block">Max Savings Cap</span>
                    <strong className="text-stone-900 font-bold">
                      {coupon.maxDiscount > 0 ? `₹${coupon.maxDiscount.toLocaleString("en-IN")}` : "No Limit"}
                    </strong>
                  </div>

                  <div className="bg-stone-50 p-2 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-stone-400 block">Usage Redemptions</span>
                    <strong className="text-stone-900 font-bold">
                      {coupon.usageCount || 0} / {coupon.usageLimit || "∞"}
                    </strong>
                  </div>

                  <div className="bg-stone-50 p-2 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-stone-400 block">Expiry Date</span>
                    <strong className={expired ? "text-rose-600 font-bold" : "text-stone-900 font-bold"}>
                      {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString("en-IN") : "Never"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-stone-400 font-mono">ID: {coupon.id}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingCoupon(coupon);
                      setModalOpen(true);
                    }}
                    className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors flex items-center gap-1 font-bold text-[11px]"
                    title="Edit Coupon Settings"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id, coupon.code)}
                    className="p-2 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCoupons.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <Ticket className="w-12 h-12 mx-auto text-stone-300 stroke-[1.5]" />
            <h3 className="text-base font-bold text-stone-800">No Coupons Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Create automatic discounts or promotional vouchers for festivals and celebrations.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs active:scale-95 shadow-md shadow-rose-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT COUPON MODAL */}
      {modalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                  <Ticket className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {editingCoupon.code ? `Edit Coupon: ${editingCoupon.code}` : "Create Promotional Coupon"}
                  </h3>
                  <span className="text-[10px] text-stone-400">Configure discount rules, threshold & customer preview</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
              {/* Quick Template Presets */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  ⚡ Quick Discount Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset({
                        discountType: "percentage",
                        discountValue: 10,
                        minOrderValue: 499,
                        maxDiscount: 250,
                        description: "10% OFF on all orders above ₹499",
                      })
                    }
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-stone-200 rounded-lg text-[11px] font-bold text-stone-700 transition-colors"
                  >
                    10% (Min ₹499)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset({
                        discountType: "percentage",
                        discountValue: 15,
                        minOrderValue: 799,
                        maxDiscount: 350,
                        description: "15% OFF on orders above ₹799",
                      })
                    }
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-stone-200 rounded-lg text-[11px] font-bold text-stone-700 transition-colors"
                  >
                    15% (Min ₹799)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset({
                        discountType: "percentage",
                        discountValue: 20,
                        minOrderValue: 999,
                        maxDiscount: 500,
                        description: "20% OFF festive special on orders above ₹999",
                      })
                    }
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-stone-200 rounded-lg text-[11px] font-bold text-stone-700 transition-colors"
                  >
                    20% (Min ₹999)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset({
                        discountType: "fixed",
                        discountValue: 50,
                        minOrderValue: 299,
                        maxDiscount: 50,
                        description: "Flat ₹50 OFF on small celebration gifts",
                      })
                    }
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-stone-200 rounded-lg text-[11px] font-bold text-stone-700 transition-colors"
                  >
                    Flat ₹50
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset({
                        discountType: "fixed",
                        discountValue: 200,
                        minOrderValue: 1499,
                        maxDiscount: 200,
                        description: "Flat ₹200 OFF on celebration hampers",
                      })
                    }
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-stone-200 rounded-lg text-[11px] font-bold text-stone-700 transition-colors"
                  >
                    Flat ₹200
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset({
                        discountType: "fixed",
                        discountValue: 500,
                        minOrderValue: 2499,
                        maxDiscount: 500,
                        description: "Flat ₹500 OFF on luxury celebration hampers",
                      })
                    }
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-stone-200 rounded-lg text-[11px] font-bold text-stone-700 transition-colors"
                  >
                    Flat ₹500
                  </button>
                </div>
              </div>

              {/* Trigger Mode Selector: Auto vs Manual */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                <label className="block font-bold text-stone-900">How should this coupon apply?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingCoupon({ ...editingCoupon, autoApply: true })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      editingCoupon.autoApply
                        ? "bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 text-purple-950 font-bold"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <Zap className="w-4 h-4 text-purple-600 fill-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs block font-bold">⚡ Automatic Apply</span>
                      <span className="text-[10px] text-stone-500 font-normal">
                        Applies automatically in cart/checkout when conditions are met.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingCoupon({ ...editingCoupon, autoApply: false })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      !editingCoupon.autoApply
                        ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 font-bold"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <Ticket className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs block font-bold">🎟️ Manual Code Entry</span>
                      <span className="text-[10px] text-stone-500 font-normal">
                        Customer must type or click "Apply" to redeem this code.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Code & Code Generator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700">Coupon Code *</label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Dices className="w-3 h-3" />
                      <span>Generate Code</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE20, GLOW10"
                    value={editingCoupon.code}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none uppercase font-mono font-bold text-stone-900 focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Offer Headline / Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Save ₹100 on orders above ₹799"
                    value={editingCoupon.description || ""}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none text-stone-900 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Discount Type *</label>
                  <select
                    value={editingCoupon.discountType}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 font-semibold text-stone-900 outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Flat Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Discount Value {editingCoupon.discountType === "percentage" ? "(%)" : "(₹)"} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={editingCoupon.discountType === "percentage" ? "99" : "50000"}
                    value={editingCoupon.discountValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold text-stone-900 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Conditions: Min Order & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for no minimum"
                    value={editingCoupon.minOrderValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Cart must meet this threshold</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Maximum Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500 max savings"
                    value={editingCoupon.maxDiscount}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Upper limit for percentage discounts</span>
                </div>
              </div>

              {/* Dates & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editingCoupon.expiryDate ? editingCoupon.expiryDate.split("T")[0] : ""}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Coupon remains valid till 23:59:59 on this date</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={editingCoupon.usageLimit}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Max total redemptions across store</span>
                </div>
              </div>

              {/* Live Storefront Preview */}
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-stone-500" />
                  <span>Storefront Customer Preview:</span>
                </span>
                <div className="p-3.5 rounded-2xl border border-dashed border-rose-300 bg-gradient-to-r from-rose-50/50 via-white to-amber-50/30 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black tracking-wider text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                        {editingCoupon.code || "SAMPLE"}
                      </span>
                      <span className="text-xs font-black text-rose-600">
                        {editingCoupon.discountType === "percentage"
                          ? `${editingCoupon.discountValue || 0}% OFF`
                          : `₹${editingCoupon.discountValue || 0} OFF`}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 font-medium">
                      {editingCoupon.description || "Special celebration discount"}
                    </p>
                    <span className="text-[10px] text-stone-400 block">
                      Min Order: ₹{editingCoupon.minOrderValue || 0}
                      {editingCoupon.discountType === "percentage" && editingCoupon.maxDiscount > 0
                        ? ` • Max Save: ₹${editingCoupon.maxDiscount}`
                        : ""}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-bold shadow-xs">
                    Apply
                  </span>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-800 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                  <input
                    type="checkbox"
                    checked={editingCoupon.active}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, active: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                  <span>Coupon Is Active & Enabled for Store Customers</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-md shadow-rose-600/25 active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving Coupon..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
