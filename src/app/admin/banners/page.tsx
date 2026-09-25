"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getBanners, saveBanner, deleteBanner, logAdminAction } from "@/lib/services/storeDb";
import { Banner } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import ImageUpload from "@/components/ui/ImageUpload";
import { Plus, Image as ImageIcon, Trash2, Edit, X, Sparkles, CheckCircle2, ArrowRight, Eye } from "lucide-react";

export default function AdminBannersPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getBanners().then(setBanners);
  }, []);

  const handleOpenCreate = () => {
    const newBan: Banner = {
      id: `ban-${Date.now()}`,
      title: "",
      subtitle: "",
      badge: "",
      imageUrl: "",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      priority: banners.length + 1,
      active: true,
      placement: "mid_banner",
    };
    setEditingBanner(newBan);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    await saveBanner(editingBanner);
    await logAdminAction(user?.email || "admin@glimglee.com", "SAVE_BANNER", "cms", editingBanner.id);

    setBanners((prev) => {
      const idx = prev.findIndex((b) => b.id === editingBanner.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = editingBanner;
        return u.sort((a, b) => (a.priority ?? 10) - (b.priority ?? 10));
      }
      return [editingBanner, ...prev].sort((a, b) => (a.priority ?? 10) - (b.priority ?? 10));
    });

    setModalOpen(false);
    toast("Banner saved successfully!", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    await deleteBanner(id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
    toast("Banner deleted", "info");
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Visual Merchandising
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Store Banners & Sliders ({banners.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage promotional hero graphics, mid-page campaigns, and celebratory collections.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Helpful Info Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50/50 to-stone-50 border border-rose-200/80 flex items-start gap-3.5 shadow-sm">
        <Sparkles className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 leading-relaxed space-y-1">
          <span className="font-bold text-stone-900 block">Where do these banners show on the storefront?</span>
          <p>
            All active banners appear on the <strong>Main Homepage</strong> between the product collections.
            When you add <strong>2 banners</strong> (like Home Décor & Gifts & Keepsakes), they automatically display <strong>side-by-side in a responsive 2-column campaign showcase grid</strong>! On mobile devices, they stack cleanly one below the other.
          </p>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="rounded-3xl bg-white border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-[16/9] w-full bg-stone-900">
              {b.imageUrl && (
                <Image src={b.imageUrl} alt={b.title || "Banner"} fill className="object-cover opacity-80" />
              )}
              <div className="absolute inset-0 bg-stone-950/40 p-5 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {b.placement === "mid_banner" ? "Mid-Page Campaign" : b.placement === "hero" ? "Hero Slider" : b.placement}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 text-stone-200 text-[10px] font-bold">
                      Order #{b.priority ?? 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.active !== false ? "bg-emerald-500/80 text-white" : "bg-stone-500/80 text-stone-200"
                    }`}>
                      {b.active !== false ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>

                <div>
                  {b.badge && (
                    <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-rose-300 drop-shadow mb-1">
                      ★ {b.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-black leading-tight drop-shadow">{b.title}</h3>
                  <p className="text-xs text-stone-200 line-clamp-1 mt-0.5 drop-shadow">{b.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between text-xs bg-stone-50/50 border-t border-stone-100">
              <div>
                <span className="font-bold text-stone-900 block">CTA: "{b.ctaText}"</span>
                <span className="text-stone-400 block text-[11px]">Links to: {b.ctaLink}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingBanner(b);
                    setModalOpen(true);
                  }}
                  className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
                  title="Edit Banner"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-2.5 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm space-y-3">
            <ImageIcon className="w-10 h-10 mx-auto text-stone-300" />
            <h3 className="text-sm font-bold text-stone-800">No Banners Configured</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Upload promotional campaign graphics and visual merchandising banners directly from this panel.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
            >
              Add First Banner
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-stone-100 bg-white flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {editingBanner.title ? `Edit "${editingBanner.title}"` : "Create New Banner"}
                </h3>
                <p className="text-[11px] text-stone-500">
                  Configure storefront promotional campaign and visual graphics
                </p>
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

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Banner Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Home Décor"
                    value={editingBanner.title}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Badge / Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Home Living, Curated Gifts"
                    value={editingBanner.badge || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  placeholder="Transform your space with beautiful décor pieces..."
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Display Placement *</label>
                  <select
                    value={editingBanner.placement || "mid_banner"}
                    onChange={(e) => setEditingBanner({ ...editingBanner, placement: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-semibold bg-white"
                  >
                    <option value="mid_banner">Mid-Page Campaign Grid (Side-by-Side)</option>
                    <option value="hero">Top Hero Slider / Carousel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Display Order / Priority</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={editingBanner.priority || 1}
                    onChange={(e) => setEditingBanner({ ...editingBanner, priority: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <ImageUpload
                  label="Banner Graphic Image (Cloudinary CDN)"
                  value={editingBanner.imageUrl}
                  folder="glimglee/banners"
                  aspectRatio="banner"
                  onChange={(url) => setEditingBanner({ ...editingBanner, imageUrl: url })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingBanner.ctaText}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">CTA Destination URL</label>
                  <input
                    type="text"
                    value={editingBanner.ctaLink}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaLink: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              {/* Live Status Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="font-bold text-stone-800 block text-xs">Live on Storefront</span>
                  <span className="text-[11px] text-stone-500">Enable or temporarily disable this banner on the store</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingBanner({ ...editingBanner, active: editingBanner.active === false ? true : false })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editingBanner.active !== false ? "bg-emerald-500" : "bg-stone-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      editingBanner.active !== false ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
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
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-sm active:scale-95"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
