"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/services/storeDb";
import { Category } from "@/lib/types";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCats = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error("Failed to load categories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
    window.addEventListener("glimglee_categories_updated", fetchCats);
    return () => window.removeEventListener("glimglee_categories_updated", fetchCats);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-extrabold text-rose-600 uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Handpicked Collections
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mt-1">
          Shop By Gifting Occasion & Type
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2">
          From opulent wedding hampers to personalized floating frames, find the perfect gesture crafted for every celebration.
        </p>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone-500 font-medium">Loading gift collections...</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
              {cat.image || cat.imageUrl ? (
                <Image
                  src={cat.image || cat.imageUrl || ""}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose-100 via-stone-100 to-amber-100 flex items-center justify-center">
                  <span className="text-2xl font-black text-rose-600">{cat.name.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                  {cat.productCount || 6}+ Curated Items
                </span>
                <h3 className="text-lg font-bold text-white leading-tight mt-0.5">
                  {cat.name}
                </h3>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                {cat.description}
              </p>
              <div className="flex items-center text-xs font-bold text-rose-600 group-hover:text-rose-700 group-hover:translate-x-1 transition-all">
                <span>Explore {cat.name}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </Link>
        ))}
        </div>
      )}
    </div>
  );
}
