"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  viewAllHref?: string;
  viewAllText?: string;
  products: Product[];
  mobileLayout?: "carousel" | "grid";
  onQuickView?: (product: Product) => void;
  className?: string;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  badge,
  viewAllHref,
  viewAllText = "View All",
  products,
  mobileLayout = "carousel",
  onQuickView,
  className = "",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className={`py-6 sm:py-10 ${className}`}>
      <Container size="full" className="max-w-[1536px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div className="space-y-1">
            {badge && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>{badge}</span>
              </span>
            )}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-stone-500 max-w-xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Desktop scroll arrows for carousel */}
            {mobileLayout === "carousel" && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => scroll("left")}
                  className="w-8 h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-600 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="w-8 h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-600 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors group"
              >
                <span>{viewAllText}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </div>

        {/* Product Items */}
        {mobileLayout === "carousel" ? (
          <div className="w-full max-w-full overflow-hidden">
            <div
              ref={scrollRef}
              className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 sm:gap-6 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[220px] min-[420px]:w-[240px] sm:w-auto snap-start h-full"
                >
                  <ProductCard product={product} onQuickView={onQuickView} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};
