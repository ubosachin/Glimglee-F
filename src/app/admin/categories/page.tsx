"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getCategories, saveCategory, deleteCategory } from "@/lib/services/storeDb";
import { Category } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { Plus, Edit, Trash2, Layers, X, Check } from "lucide-react";

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleOpenCreate = () => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: "",
      slug: "",
      description: "",
      image: "",
      order: categories.length + 1,
      featured: true,
      active: true,
      productCount: 0,
    };
    setEditingCategory(newCat);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.name.trim()) {
      toast("Category name is required", "error");
      return;
    }

    const slug = editingCategory.slug || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const toSave: Category = { ...editingCategory, slug };

    await saveCategory(toSave);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === toSave.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = toSave;
        return u;
      }
      return [...prev, toSave];
    });

    setModalOpen(false);
    toast(`Category "${toSave.name}" saved!`, "success");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast(`Category deleted`, "info");
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Taxonomy Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Gifting Categories ({categories.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Organize catalog hierarchy, banner imagery, and display sort order.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200 flex items-center justify-center">
                {cat.image ? (
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                ) : (
                  <Layers className="w-6 h-6 text-stone-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900 truncate">{cat.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-stone-400">Order: {cat.order}</span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">{cat.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold">
                    {cat.productCount || 0} Products
                  </span>
                  {cat.active && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setEditingCategory(cat);
                  setModalOpen(true);
                }}
                className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600"
                title="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-2 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm space-y-3">
            <Layers className="w-10 h-10 mx-auto text-stone-300" />
            <h3 className="text-sm font-bold text-stone-800">No Categories Created Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Create gifting categories (e.g. Hampers, Scented Candles, Frames) to organize your catalog.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
            >
              Create First Category
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              {editingCategory.name ? "Edit Category" : "Create Gifting Category"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Festival Specials"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://... (or leave empty)"
                  value={editingCategory.image}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={editingCategory.order}
                    onChange={(e) => setEditingCategory({ ...editingCategory, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                    <input
                      type="checkbox"
                      checked={editingCategory.active}
                      onChange={(e) => setEditingCategory({ ...editingCategory, active: e.target.checked })}
                      className="accent-rose-600"
                    />
                    <span>Active in Store</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
