"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProducts, updateProductOrder } from "@/lib/services/products";
import { getCategories } from "@/lib/services/categories";
import { Product, Category } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import {
  ListOrdered,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Crown,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from "lucide-react";

export default function ProductOrderingPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  // Drag and Drop tracking
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Load products and categories on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          getProducts({ limitCount: 1000 }),
          getCategories(),
        ]);

        // Sort initially by displayOrder (1, 2, 3...) or fallback to createdAt
        const sorted = [...prods].sort((a, b) => {
          const orderA = typeof a.displayOrder === "number" && a.displayOrder > 0 ? a.displayOrder : (a.sortOrder ?? 999999);
          const orderB = typeof b.displayOrder === "number" && b.displayOrder > 0 ? b.displayOrder : (b.sortOrder ?? 999999);
          if (orderA !== orderB) return orderA - orderB;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

        // Ensure every item has an explicit 1-based displayOrder index
        const normalized = sorted.map((p, idx) => ({
          ...p,
          displayOrder: p.displayOrder && p.displayOrder > 0 ? p.displayOrder : idx + 1,
        }));

        setProducts(normalized);
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load products for ordering:", err);
        toast("Failed to load products", "error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [toast]);

  // Warn if leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  // Helper to re-assign 1..N order to the current array
  const resequence = (list: Product[]): Product[] => {
    return list.map((p, idx) => ({
      ...p,
      displayOrder: idx + 1,
      sortOrder: idx + 1,
    }));
  };

  // Move product by step (e.g. -1 for Up, +1 for Down)
  const moveProduct = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= products.length) return;

    const updated = [...products];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    const reordered = resequence(updated);
    setProducts(reordered);
    setHasChanges(true);
  };

  // Move directly to top (#1)
  const moveToTop = (index: number) => {
    if (index === 0) return;
    moveProduct(index, 0);
    toast(`"${products[index].name}" moved to Position #1!`, "info");
  };

  // Move directly to bottom
  const moveToBottom = (index: number) => {
    if (index === products.length - 1) return;
    moveProduct(index, products.length - 1);
    toast(`"${products[index].name}" moved to bottom of catalog`, "info");
  };

  // Set position directly via number input
  const handlePositionChange = (currentIndex: number, newPositionStr: string) => {
    const targetPos = parseInt(newPositionStr, 10);
    if (isNaN(targetPos)) return;

    // Convert 1-based user number to 0-based array index
    const targetIndex = Math.max(0, Math.min(products.length - 1, targetPos - 1));
    if (targetIndex === currentIndex) return;

    moveProduct(currentIndex, targetIndex);
  };

  // Native HTML5 Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    moveProduct(draggedIndex, index);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Auto clean sequence button
  const handleCleanSequence = () => {
    const reordered = resequence(products);
    setProducts(reordered);
    setHasChanges(true);
    toast("Re-sequenced all products from 1 to " + products.length, "info");
  };

  // Save changes to backend
  const handleSaveOrder = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const payload = products.map((p, idx) => ({
        id: p.id,
        displayOrder: idx + 1,
      }));

      const ok = await updateProductOrder(payload);
      if (ok) {
        setHasChanges(false);
        toast("Product display order saved successfully across storefront!", "success");
      } else {
        toast("Failed to save product order. Please try again.", "error");
      }
    } catch (err) {
      console.error("Save order error:", err);
      toast("Error saving product order", "error");
    } finally {
      setSaving(false);
    }
  };

  // Filtered products for display
  const displayedProducts = products.filter((p) => {
    const matchSearch =
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase());
    const matchCat =
      selectedCat === "all" ||
      p.categoryId === selectedCat ||
      p.category === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Bar with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <ListOrdered className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Product Display Order & Catalog Ranking
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
            Decide the exact position number (<strong>#1, #2, #3...</strong>) where each product appears on the storefront homepage and shop catalog.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {hasChanges && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Unsaved Changes</span>
            </span>
          )}

          <button
            onClick={handleCleanSequence}
            type="button"
            className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Clean numbering from 1 to N"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Auto Re-sequence</span>
          </button>

          <Link
            href="/shop"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Storefront</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>

          <button
            onClick={handleSaveOrder}
            disabled={saving || !hasChanges}
            type="button"
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm ${
              hasChanges
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25 cursor-pointer"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Order...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Display Order</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            <option value="all">All Collections ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Product Ordering List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Loading Catalog Products...
          </p>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 text-stone-500">
          <p className="text-sm font-semibold">No products match your search or filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedProducts.map((product) => {
            // Find global index in the full products list
            const globalIndex = products.findIndex((p) => p.id === product.id);
            const position = globalIndex + 1;
            const isTopSpotlight = position === 1;
            const isTop3 = position <= 3;
            const isDragging = draggedIndex === globalIndex;
            const isDragOver = dragOverIndex === globalIndex;

            return (
              <div
                key={product.id}
                draggable
                onDragStart={() => handleDragStart(globalIndex)}
                onDragOver={(e) => handleDragOver(e, globalIndex)}
                onDrop={() => handleDrop(globalIndex)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isTopSpotlight
                    ? "bg-gradient-to-r from-amber-50/60 via-white to-white border-amber-300 shadow-xs"
                    : isTop3
                    ? "bg-gradient-to-r from-rose-50/40 via-white to-white border-rose-200"
                    : "bg-white border-stone-200/80 hover:border-stone-300"
                } ${isDragging ? "opacity-40 scale-[0.99] border-dashed border-rose-400" : ""} ${
                  isDragOver ? "border-t-4 border-t-rose-600" : ""
                }`}
              >
                {/* Left: Drag Handle + Position Badge + Image + Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Drag Handle */}
                  <div
                    className="cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-600 p-1 transition-colors"
                    title="Drag and drop to reorder"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Position Badge & Direct Number Input */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div
                      className={`flex items-center justify-center px-2.5 py-1 rounded-xl text-xs font-black tracking-tight ${
                        isTopSpotlight
                          ? "bg-amber-500 text-white shadow-xs"
                          : isTop3
                          ? "bg-rose-500 text-white"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {isTopSpotlight && <Crown className="w-3 h-3 mr-1 fill-white" />}
                      <span>#{position}</span>
                    </div>

                    <div className="flex items-center gap-1" title="Type a number and press Enter to jump">
                      <span className="text-[10px] text-stone-400 font-bold">Set:</span>
                      <input
                        type="number"
                        min="1"
                        max={products.length}
                        defaultValue={position}
                        key={`${product.id}-${position}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handlePositionChange(globalIndex, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        onBlur={(e) => {
                          handlePositionChange(globalIndex, e.target.value);
                        }}
                        className="w-12 px-1.5 py-1 text-center font-bold text-xs bg-stone-100 hover:bg-stone-200 focus:bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  {/* Product Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden relative flex-shrink-0 border border-stone-200">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">
                        No Img
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="text-xs sm:text-sm font-bold text-stone-900 hover:text-rose-600 truncate transition-colors"
                      >
                        {product.name}
                      </Link>
                      {isTopSpotlight && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          Spotlight #1
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500 flex-wrap">
                      <span className="font-semibold text-rose-600">₹{product.price.toLocaleString("en-IN")}</span>
                      <span>•</span>
                      <span className="truncate">{product.category || product.categoryId}</span>
                      <span>•</span>
                      <span className="text-stone-400 font-mono text-[10px]">{product.sku}</span>
                      {product.inventory <= 5 && (
                        <span className="text-amber-600 font-bold text-[10px]">
                          ({product.inventory} in stock)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Move Controls */}
                <div className="flex items-center gap-1 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 justify-end">
                  {/* Pin to Top Button */}
                  <button
                    onClick={() => moveToTop(globalIndex)}
                    disabled={globalIndex === 0}
                    type="button"
                    title="Pin this product directly to #1 position"
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <Crown className="w-3 h-3" />
                    <span>Top #1</span>
                  </button>

                  {/* Move Up */}
                  <button
                    onClick={() => moveProduct(globalIndex, globalIndex - 1)}
                    disabled={globalIndex === 0}
                    type="button"
                    title="Move up 1 position"
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => moveProduct(globalIndex, globalIndex + 1)}
                    disabled={globalIndex === products.length - 1}
                    type="button"
                    title="Move down 1 position"
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Move to Bottom */}
                  <button
                    onClick={() => moveToBottom(globalIndex)}
                    disabled={globalIndex === products.length - 1}
                    type="button"
                    title="Move to end of catalog"
                    className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Bottom</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Bottom Sticky Save Bar when changes exist */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-stone-800 flex items-center gap-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold text-stone-200">You have unsaved display order changes!</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              type="button"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-md"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
