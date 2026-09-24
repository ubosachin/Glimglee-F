"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/services/storeDb";
import { Category } from "@/lib/types";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
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
    </div>
  );
}
