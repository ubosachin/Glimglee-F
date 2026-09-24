"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProducts, getCategories, saveProduct, deleteProduct, logAdminAction } from "@/lib/services/storeDb";
import { uploadProductImage } from "@/lib/storage/upload";
import { Product, Category, PersonalizationField } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Sparkles,
  Check,
  X,
  Package,
  ArrowUpDown,
  Filter,
  Gift,
} from "lucide-react";

export default function AdminProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function load() {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    }
    load();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === "all" || p.categoryId === selectedCat;
    return matchSearch && matchCat;
  });

  const handleOpenCreate = () => {
    const newProd: Product = {
      id: `glm-prod-${Date.now()}`,
      name: "",
      slug: "",
      description: "",
      categoryId: categories[0]?.slug || "gift-hampers",
      price: 0,
      compareAtPrice: 0,
      images: [],
      inventory: 0,
      lowStockThreshold: 5,
      sku: `GLM-${Date.now().toString().slice(-4)}`,
      tags: [],
      featured: false,
      bestseller: false,
      newArrival: true,
      rating: 5.0,
      reviewCount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      personalization: {
        enabled: false,
        fields: [],
      },
    };
    setEditingProduct(newProd);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      toast("Product name is required", "error");
      return;
    }

    const slug = editingProduct.slug || editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const toSave: Product = { ...editingProduct, slug };

    await saveProduct(toSave);
    await logAdminAction(
      user?.email || "admin@glimglee.com",
      "SAVE_PRODUCT",
      "product",
      toSave.id,
      { name: toSave.name, price: toSave.price }
    );

    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === toSave.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = toSave;
        return updated;
      }
      return [toSave, ...prev];
    });

    setIsModalOpen(false);
    toast(`Saved "${toSave.name}" successfully!`, "success");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    await deleteProduct(id);
    await logAdminAction(user?.email || "admin@glimglee.com", "DELETE_PRODUCT", "product", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast(`Deleted "${name}"`, "info");
  };

  // Personalization field helpers
  const addPersonalizationField = () => {
    if (!editingProduct) return;
    const newField: PersonalizationField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "Custom Name / Text",
      required: true,
      placeholder: "e.g. Enter name to engrave",
    };
    const currentFields = editingProduct.personalization?.fields || [];
    setEditingProduct({
      ...editingProduct,
      personalization: {
        enabled: true,
        fields: [...currentFields, newField],
      },
    });
  };

  const removePersonalizationField = (fieldId: string) => {
    if (!editingProduct?.personalization) return;
    setEditingProduct({
      ...editingProduct,
      personalization: {
        ...editingProduct.personalization,
        fields: editingProduct.personalization.fields.filter((f) => f.id !== fieldId),
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Gifting Products ({products.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure pricing, images, inventory thresholds, and bespoke personalization schemas.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Gift</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm text-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-semibold">Category:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-800 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-stone-100">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price / MRP</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Personalization</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200 flex items-center justify-center">
                        {p.images?.[0] || p.thumbnail ? (
                          <Image
                            src={p.images?.[0] || p.thumbnail || ""}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Gift className="w-5 h-5 text-rose-300 stroke-[1.5]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-stone-900 truncate max-w-xs">{p.name}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          {p.bestseller && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              BESTSELLER
                            </span>
                          )}
                          {p.featured && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-bold">
                              FEATURED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-stone-600">{p.sku}</td>
                  <td className="py-3 px-4 capitalize font-medium">{p.categoryId.replace("-", " ")}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900">₹{p.price.toLocaleString("en-IN")}</span>
                    {p.compareAtPrice && (
                      <span className="text-[10px] text-stone-400 line-through block">
                        ₹{p.compareAtPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.inventory <= p.lowStockThreshold
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {p.inventory} in stock
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {p.personalization?.enabled ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200 flex items-center gap-1 w-fit">
                        <Sparkles className="w-3 h-3 text-rose-600" />
                        <span>{p.personalization.fields.length} Fields</span>
                      </span>
                    ) : (
                      <span className="text-stone-400 text-[11px]">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="font-semibold text-stone-700 text-xs">No products in catalog yet</p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Click "+ Add Product" to publish your first gift from the admin panel.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h2 className="text-base font-bold text-stone-900">
                {editingProduct.id.includes("prod-") ? "Edit Gifting Product" : "Create New Gift"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Selling Price (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Compare-At MRP Price (INR ₹)</label>
                  <input
                    type="number"
                    value={editingProduct.compareAtPrice || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.inventory}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inventory: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={editingProduct.lowStockThreshold}
                    onChange={(e) => setEditingProduct({ ...editingProduct, lowStockThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-stone-700">Product Photography (Cloudinary CDN)</label>
                    {uploadingImage && <span className="text-[11px] text-rose-600 font-bold animate-pulse">Uploading to Cloudinary...</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL or click upload to store in Cloudinary..."
                      value={editingProduct.images[0] || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          images: [e.target.value, ...editingProduct.images.slice(1)],
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 text-xs"
                    />
                    <label className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl cursor-pointer text-xs flex items-center gap-1.5 transition-colors">
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingImage(true);
                            const res = await uploadProductImage(file, editingProduct.id);
                            setEditingProduct((prev) =>
                              prev ? { ...prev, images: [res.url, ...prev.images.filter((img) => img !== res.url)] } : null
                            );
                            toast("Image uploaded to Cloudinary Storage!", "success");
                          } catch (err: unknown) {
                            console.error("Storage upload error:", err);
                            const msg = err instanceof Error ? err.message : "Storage upload failed. Check Cloudinary credentials.";
                            toast(msg, "error");
                          } finally {
                            setUploadingImage(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Badges Toggles */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.bestseller}
                    onChange={(e) => setEditingProduct({ ...editingProduct, bestseller: e.target.checked })}
                    className="accent-rose-600"
                  />
                  <span>Mark Bestseller</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="accent-rose-600"
                  />
                  <span>Featured Collection</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.newArrival}
                    onChange={(e) => setEditingProduct({ ...editingProduct, newArrival: e.target.checked })}
                    className="accent-rose-600"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              {/* PERSONALIZATION SCHEMA CONFIGURATOR */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-stone-900">Personalization Configuration</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.personalization?.enabled || false}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          personalization: {
                            enabled: e.target.checked,
                            fields: editingProduct.personalization?.fields || [],
                          },
                        })
                      }
                      className="accent-rose-600"
                    />
                    <span>Enable Customer Customization</span>
                  </label>
                </div>

                {editingProduct.personalization?.enabled && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      {editingProduct.personalization.fields.map((field, idx) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200"
                        >
                          <span className="font-bold text-stone-400 text-[11px] w-5">#{idx + 1}</span>
                          <input
                            type="text"
                            placeholder="Field Label (e.g. Recipient Name)"
                            value={field.label}
                            onChange={(e) => {
                              const updated = [...editingProduct.personalization!.fields];
                              updated[idx].label = e.target.value;
                              setEditingProduct({
                                ...editingProduct,
                                personalization: {
                                  ...editingProduct.personalization!,
                                  fields: updated,
                                },
                              });
                            }}
                            className="flex-1 px-2 py-1 rounded-lg border border-stone-200 text-xs"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const updated = [...editingProduct.personalization!.fields];
                              updated[idx].type = e.target.value as PersonalizationField["type"];
                              setEditingProduct({
                                ...editingProduct,
                                personalization: {
                                  ...editingProduct.personalization!,
                                  fields: updated,
                                },
                              });
                            }}
                            className="px-2 py-1 rounded-lg border border-stone-200 text-xs"
                          >
                            <option value="text">Text Input</option>
                            <option value="textarea">Custom Message Textarea</option>
                            <option value="date">Date Picker</option>
                            <option value="image">Photo Upload</option>
                            <option value="select">Dropdown Choice</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removePersonalizationField(field.id)}
                            className="text-stone-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addPersonalizationField}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center gap-1 hover:bg-stone-800"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Personalization Field
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
