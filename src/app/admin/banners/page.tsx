"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getBanners, saveBanner, deleteBanner, logAdminAction } from "@/lib/services/storeDb";
import { Banner } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import ImageUpload from "@/components/ui/ImageUpload";
import { Plus, Image as ImageIcon, Trash2, Edit, X } from "lucide-react";

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
      placement: "hero",
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
        return u;
      }
      return [editingBanner, ...prev];
    });

    setModalOpen(false);
    toast("Banner saved successfully!", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete banner?")) return;
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
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="rounded-3xl bg-white border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] w-full bg-stone-900">
              {b.imageUrl && (
                <Image src={b.imageUrl} alt={b.title || "Banner"} fill className="object-cover opacity-80" />
              )}
              <div className="absolute inset-0 bg-stone-950/40 p-5 flex flex-col justify-between text-white">
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold w-fit uppercase">
                  {b.placement}
                </span>
                <div>
                  <h3 className="text-lg font-bold leading-tight">{b.title}</h3>
                  <p className="text-xs text-stone-200 line-clamp-1 mt-0.5">{b.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-stone-900">CTA: "{b.ctaText}"</span>
                <span className="text-stone-400 block text-[11px]">Links to: {b.ctaLink}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingBanner(b);
                    setModalOpen(true);
                  }}
                  className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-2 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
              Upload hero carousel banners and promotional graphics directly from this panel.
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

      {modalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-stone-100 bg-white flex-shrink-0">
              <h3 className="text-base font-bold text-stone-900">
                {editingBanner.title ? "Edit Store Banner" : "Create Store Banner"}
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
                <label className="block font-bold text-stone-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <ImageUpload
                  label="Banner Image (Cloudinary CDN)"
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
