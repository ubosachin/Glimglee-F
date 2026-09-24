"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/services/products";
import { getCategories } from "@/lib/services/categories";
import { Product, Category } from "@/lib/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Container } from "@/components/ui/Container";
import {
  SlidersHorizontal,
  Search,
  X,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Star,
  Check,
  Filter,
  ArrowUpDown,
} from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialMaxPrice = searchParams.get("maxPrice") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [priceRange, setPriceRange] = useState<string>(
    initialMaxPrice === "499" ? "under499" : initialMaxPrice === "999" ? "under999" : "all"
  );
  const [selectedOccasion, setSelectedOccasion] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyPersonalized, setOnlyPersonalized] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");

  // Pagination state (12 items per batch)
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Mobile Bottom Drawers state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, selectedCategory, priceRange, selectedOccasion, minRating, onlyPersonalized, sortBy]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load shop items:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Update if URL search params change
  useEffect(() => {
    if (initialQuery) setSearch(initialQuery);
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialMaxPrice === "499") setPriceRange("under499");
    if (initialMaxPrice === "999") setPriceRange("under999");
  }, [initialQuery, initialCategory, initialMaxPrice]);

  const occasions = [
    "Birthday",
    "Anniversary",
    "Celebration",
    "Valentine",
    "Diwali",
    "Corporate",
    "Housewarming",
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.title || p.name || "").toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(
        (p) =>
          (p.categoryId && p.categoryId.toLowerCase() === selectedCategory.toLowerCase()) ||
          (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    // Price Range
    if (priceRange === "under499") {
      result = result.filter((p) => p.price <= 499);
    } else if (priceRange === "under999") {
      result = result.filter((p) => p.price > 499 && p.price <= 999);
    } else if (priceRange === "1000to2499") {
      result = result.filter((p) => p.price >= 1000 && p.price <= 2499);
    } else if (priceRange === "2500plus") {
      result = result.filter((p) => p.price > 2500);
    }

    // Occasion
    if (selectedOccasion && selectedOccasion !== "all") {
      result = result.filter((p) => {
        const occStr = Array.isArray(p.occasion) ? p.occasion.join(" ") : (p.occasion || "");
        return (
          occStr.toLowerCase().includes(selectedOccasion.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase() === selectedOccasion.toLowerCase())
        );
      });
    }

    // Rating
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Customizable only
    if (onlyPersonalized) {
      result = result.filter(
        (p) =>
          p.isCustomizable ||
          p.personalization?.enabled ||
          (p.personalizationFields && p.personalizationFields.length > 0)
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case "bestseller":
        result.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        break;
      default:
        // featured: bestsellers first
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [
    products,
    search,
    selectedCategory,
    priceRange,
    selectedOccasion,
    minRating,
    onlyPersonalized,
    sortBy,
  ]);

  const activeFiltersCount = [
    selectedCategory && selectedCategory !== "all",
    priceRange !== "all",
    selectedOccasion !== "all",
    minRating > 0,
    onlyPersonalized,
    search.trim().length > 0,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setPriceRange("all");
    setSelectedOccasion("all");
    setMinRating(0);
    setOnlyPersonalized(false);
    setSortBy("featured");
  };

  const sortOptions = [
    { label: "Featured & Curated", value: "featured" },
    { label: "Bestsellers First", value: "bestseller" },
    { label: "New Arrivals", value: "newest" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Customer Rating", value: "rating" },
  ];

  return (
    <div className="py-6 sm:py-10 pb-24 sm:pb-16">
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <Container>
        {/* Header Breadcrumb & Title */}
        <div className="mb-6 sm:mb-8 space-y-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-600 block">
            Gifting Catalog
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
                All Curated Gifts & Keepsakes
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Showing {filteredProducts.length} of {products.length} bespoke gifting items
              </p>
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-stone-200 text-xs font-bold px-3 py-2 rounded-xl text-stone-800 focus:outline-none focus:border-rose-500 shadow-2xs"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-stone-100/70 rounded-2xl border border-stone-200/60 text-xs">
            <span className="font-bold text-stone-600 text-[11px]">Active Filters ({activeFiltersCount}):</span>

            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-stone-800 font-semibold shadow-2xs">
                Query: "{search}"
                <button onClick={() => setSearch("")}><X className="w-3 h-3 text-stone-400 hover:text-stone-700" /></button>
              </span>
            )}

            {selectedCategory && selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-stone-800 font-semibold shadow-2xs">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("all")}><X className="w-3 h-3 text-stone-400 hover:text-stone-700" /></button>
              </span>
            )}

            {priceRange !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-stone-800 font-semibold shadow-2xs">
                Price: {priceRange.replace("under", "Under ₹")}
                <button onClick={() => setPriceRange("all")}><X className="w-3 h-3 text-stone-400 hover:text-stone-700" /></button>
              </span>
            )}

            {onlyPersonalized && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-semibold">
                Customizable Only
                <button onClick={() => setOnlyPersonalized(false)}><X className="w-3 h-3 text-rose-400 hover:text-rose-700" /></button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="ml-auto text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
        )}

        {/* Main Layout: Desktop Sidebar Filters + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                  <span>Filters</span>
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Search Keyword
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, tag..."
                    className="w-full text-xs bg-stone-50 pl-8 pr-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Collections
                </label>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg font-semibold transition-colors ${
                      !selectedCategory || selectedCategory === "all"
                        ? "bg-rose-50 text-rose-700 font-bold"
                        : "text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    All Collections ({products.length})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === c.slug
                          ? "bg-rose-50 text-rose-700 font-bold"
                          : "text-stone-700 hover:bg-stone-50 font-semibold"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-stone-400">
                        {products.filter((p) => p.categoryId === c.slug || p.categoryId === c.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Price Budget
                </label>
                <div className="space-y-1 text-xs">
                  {[
                    { label: "All Budgets", value: "all" },
                    { label: "Pocket Friendly: Under ₹499", value: "under499" },
                    { label: "Popular Gifts: Under ₹999", value: "under999" },
                    { label: "Premium Keepsakes: ₹1,000 – ₹2,499", value: "1000to2499" },
                    { label: "Luxury Gift Hampers: ₹2,500+", value: "2500plus" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPriceRange(p.value)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-colors ${
                        priceRange === p.value
                          ? "bg-rose-50 text-rose-700 font-bold"
                          : "text-stone-700 hover:bg-stone-50 font-semibold"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customizable Only Toggle */}
              <div className="pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={onlyPersonalized}
                    onChange={(e) => setOnlyPersonalized(e.target.checked)}
                    className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span>Personalized Gifts Only</span>
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="lg:col-span-3">
            <ProductGrid
              products={filteredProducts.slice(0, visibleCount)}
              loading={loading}
              emptyTitle={products.length === 0 ? "No Products in Catalog Yet" : "No gifts match your filter"}
              emptyMessage={
                products.length === 0
                  ? "Products added from the Admin Panel (/admin/products) will appear here immediately."
                  : "Try broadening your price range or resetting selected categories."
              }
              onQuickView={setQuickViewProduct}
            />

            {filteredProducts.length > visibleCount && (
              <div className="mt-10 pt-6 border-t border-stone-200 text-center flex flex-col items-center">
                <p className="text-xs text-stone-500 font-medium mb-3">
                  Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} gifts
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold text-xs hover:bg-stone-800 active:scale-95 transition-all shadow-md flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Load More Gifts ({filteredProducts.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </Container>

      {/* MOBILE STICKY FLOATING ACTION BAR: [ Filter (N) ] and [ Sort ] */}
      <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 flex items-center gap-2 max-w-sm mx-auto">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 py-3 px-4 rounded-2xl bg-stone-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl hover:bg-stone-800 transition-colors"
        >
          <Filter className="w-4 h-4 text-rose-400" />
          <span>Filter {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}</span>
        </button>

        <button
          onClick={() => setMobileSortOpen(true)}
          className="flex-1 py-3 px-4 rounded-2xl bg-white border border-stone-300 text-stone-900 font-bold text-xs flex items-center justify-center gap-2 shadow-xl hover:bg-stone-50 transition-colors"
        >
          <ArrowUpDown className="w-4 h-4 text-stone-500" />
          <span>Sort</span>
        </button>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
          />
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl p-6 z-10 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-bottom duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-black text-base text-stone-900">Refine Gifts</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Collections */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 uppercase">Collections</label>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      !selectedCategory || selectedCategory === "all"
                        ? "bg-rose-600 text-white"
                        : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    All ({products.length})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        selectedCategory === c.slug
                          ? "bg-rose-600 text-white"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Ranges */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 uppercase">Budget</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "All Budgets", value: "all" },
                    { label: "Under ₹499", value: "under499" },
                    { label: "Under ₹999", value: "under999" },
                    { label: "₹1,000 – ₹2,499", value: "1000to2499" },
                    { label: "₹2,500+", value: "2500plus" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPriceRange(p.value)}
                      className={`p-2.5 rounded-xl font-bold text-left border ${
                        priceRange === p.value
                          ? "bg-rose-50 border-rose-300 text-rose-700"
                          : "bg-white border-stone-200 text-stone-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customizable Only */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800 p-3 bg-stone-50 rounded-2xl">
                <input
                  type="checkbox"
                  checked={onlyPersonalized}
                  onChange={(e) => setOnlyPersonalized(e.target.checked)}
                  className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                />
                <span>Customizable Gifts Only</span>
              </label>
            </div>

            <div className="pt-6 border-t border-stone-100 flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 text-stone-600 font-bold text-xs border border-stone-200 rounded-2xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md"
              >
                View {filteredProducts.length} Gifts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SORT BOTTOM SHEET */}
      {mobileSortOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setMobileSortOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
          />
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl p-6 z-10 animate-in slide-in-from-bottom duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-black text-base text-stone-900">Sort Gifts By</h3>
              <button
                onClick={() => setMobileSortOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value);
                    setMobileSortOpen(false);
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-left font-bold text-xs flex items-center justify-between transition-colors ${
                    sortBy === opt.value
                      ? "bg-rose-50 text-rose-700"
                      : "text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <Check className="w-4 h-4 text-rose-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-400">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
