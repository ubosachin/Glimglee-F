"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProducts } from "@/lib/services/products";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { OCCASIONS_DATA, OccasionConfig } from "@/lib/config/occasions";
import {
  Sparkles,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RefreshCw,
  Gift,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

export default function OccasionDetailPage() {
  const params = useParams();
  const occasionSlug = params?.occasion as string;
  const config: OccasionConfig | undefined = OCCASIONS_DATA[occasionSlug];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    async function load() {
      if (!config) return;
      setLoading(true);
      try {
        const allProds = await getProducts();
        const filtered = allProds.filter((p) => {
          const occStr = Array.isArray(p.occasion)
            ? p.occasion.join(" ")
            : p.occasion || "";
          const term = config.queryTerm.toLowerCase();
          return (
            occStr.toLowerCase().includes(term) ||
            p.tags?.some((t) => t.toLowerCase().includes(term)) ||
            p.name.toLowerCase().includes(term)
          );
        });

        // Fallback to top featured products if specific tag has few items
        if (filtered.length > 0) {
          setProducts(filtered);
        } else {
          setProducts(allProds.slice(0, 8));
        }
      } catch (err) {
        console.error("Error loading occasion gifts:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [config]);

  if (!config) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Occasion Not Found</h2>
        <p className="text-xs text-stone-500">
          The gifting occasion you are looking for does not exist.
        </p>
        <Link
          href="/shop"
          className="inline-block px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold"
        >
          View All Gifts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-rose-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-rose-600 transition-colors">
          Occasions
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">{config.name}</span>
      </div>

      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white p-8 sm:p-14 shadow-2xl border border-stone-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>{config.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]">
            {config.h1}
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
            {config.description}
          </p>
        </div>

        {/* Floating Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Trust Highlights Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">Pan-India Express</h4>
            <p className="text-[10px] text-stone-500">Free over ₹1,500</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">Luxury Gift Box</h4>
            <p className="text-[10px] text-stone-500">Handwritten card included</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">Personalized</h4>
            <p className="text-[10px] text-stone-500">Hand-finished with love</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">100% Guarantee</h4>
            <p className="text-[10px] text-stone-500">Instant transit replacement</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center text-xs text-stone-500">
          <span>
            Curated keepsakes: <strong>{products.length}</strong> items available
          </span>
          <Link
            href="/shop"
            className="text-rose-600 hover:text-rose-700 font-bold hover:underline"
          >
            View Full Catalog &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs text-stone-400">
            Curating keepsake collection...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
            <h3 className="text-sm font-bold text-stone-900">
              New gifts being crafted for this occasion!
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Explore our trending gifts in the meantime.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold"
            >
              Browse All Gifts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
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

      {/* Frequently Asked Questions Section */}
      {config.faqs && config.faqs.length > 0 && (
        <div className="pt-8 border-t border-stone-200 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Frequently Asked Questions About {config.name}
            </h2>
          </div>

          <div className="divide-y divide-stone-200 border border-stone-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            {config.faqs.map((faq, idx) => (
              <div key={idx} className="p-4 sm:p-5">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-stone-900 hover:text-rose-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 transition-transform ${
                      openFaq === idx ? "rotate-180 text-rose-600" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-xs text-stone-600 leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
