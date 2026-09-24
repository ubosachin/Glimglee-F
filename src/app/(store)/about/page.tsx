"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Heart, ShieldCheck, Award, ArrowRight, Gift } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 space-y-16">
      {/* Brand Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> The Glimglee Story
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
          Modern Gifting, Made Personal.
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
          We founded Glimglee with one unwavering belief: a gift shouldn't just be an item delivered in plain cardboard. It should be a tangible spark of joy, warmth, and emotion that lingers long after the unwrapping.
        </p>
      </div>

      {/* Visual Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-stone-800 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 p-8 sm:p-10 flex flex-col justify-between text-white">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider border border-rose-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-rose-400" /> Hand-Finished In India
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-rose-300 border border-white/10">
              <Gift className="w-5 h-5 stroke-[1.5]" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-1 bg-gradient-to-r from-rose-500 to-amber-400 rounded-full" />
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Every Keepsake Tells a Story of Affection.
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed font-light">
              Crafted in small artisan studios with sustainable woods, organic coconut-soy waxes, and archival paper stock.
            </p>
          </div>
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
            <span>Wax-Sealed Packaging</span>
            <span className="text-rose-400 font-semibold">100% Plastic-Free Gifting</span>
          </div>
        </div>
        <div className="space-y-5">
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
            Our Craftsmanship
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Curated By Hand, Sealed With Wax.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            From our hand-poured coconut-soy candles infused with pure therapeutic essential oils to our floating teak wood frames, every piece is made or hand-assembled in small batches in India.
          </p>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            We avoid mass-produced plastic knick-knacks. Instead, we use archival cotton papers, plantable wildflower seeds, food-grade ceramics, and sustainably sourced woods that stand the test of time.
          </p>
        </div>
      </div>

      {/* Values Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-stone-200">
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Radical Attention to Detail</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Every ribbon is hand-tied, every calligraphy note checked twice, and every fragile bottle double-cushioned.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Custom Keepsakes</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Turn dates, vows, coordinates, and memories into permanent wooden and acrylic home art.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Happiness Guarantee</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            If anything arrives damaged or imperfect during transit, we replace it instantly with zero arguments.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xl shadow-rose-600/25 transition-all"
        >
          <span>Explore Glimglee Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
