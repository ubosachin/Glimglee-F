"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCategoryBySlug, getProducts } from "@/lib/services/storeDb";
import { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      const cat = await getCategoryBySlug(slug);
      setCategory(cat);
      if (cat) {
        const prods = await getProducts({ categoryId: cat.slug });
        setProducts(prods);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-stone-500">
        Loading collection...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Collection Not Found</h2>
        <p className="text-xs text-stone-500">The gifting category you are looking for does not exist.</p>
        <Link
          href="/categories"
          className="inline-block px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold"
        >
          View All Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Back button */}
      <div>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to all categories
        </Link>
      </div>

      {/* Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Curated Gifting
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {category.description}
          </p>
        </div>

        {(category.image || category.imageUrl) && (
          <div className="absolute inset-0 opacity-30 mix-blend-overlay">
            <Image
              src={category.image || category.imageUrl || ""}
              alt={category.name}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex justify-between items-center mb-6 text-xs text-stone-500">
          <span>Showing <strong>{products.length}</strong> gifts in this collection</span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
            <h3 className="text-sm font-bold text-stone-900">New designs coming soon to this collection!</h3>
            <p className="text-xs text-stone-500 mt-1">Check out our trending bestsellers in the meantime.</p>
            <Link
              href="/shop"
              className="mt-4 inline-block px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold"
            >
              Browse All Gifts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
