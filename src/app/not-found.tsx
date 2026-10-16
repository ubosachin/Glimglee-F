import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, PackageSearch, Home, ShoppingBag, Layers, Truck, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Page Not Found | Glimglee Gifting",
  description: "The page or keepsake you are looking for is unavailable. Explore handcrafted luxury gifts, scented soy candles, and personalized frames at Glimglee.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-[#faf8f5]">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100/80 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>Error 404 • Keepsake Not Found</span>
        </div>

        {/* Hero Message */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black text-stone-900 tracking-tight">
            Lost in the <span className="text-rose-600">Glow?</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-md mx-auto leading-relaxed">
            The page or personalized gift you are searching for might have been moved, renamed, or is temporarily out of season.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/25 transition-all transform hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore All Gifts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs sm:text-sm font-bold transition-all shadow-xs"
          >
            <Home className="w-4 h-4 text-stone-500" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Quick Navigation Cards */}
        <div className="pt-8 border-t border-stone-200/80">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">
            Popular Gifting Destinations
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
            <Link
              href="/categories"
              className="p-3.5 rounded-2xl bg-white border border-stone-200/70 hover:border-rose-300 hover:shadow-md transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-stone-900 group-hover:text-rose-600 transition-colors">
                Categories
              </h2>
              <p className="text-[10px] text-stone-500 mt-0.5">Explore by craft</p>
            </Link>

            <Link
              href="/orders/track"
              className="p-3.5 rounded-2xl bg-white border border-stone-200/70 hover:border-rose-300 hover:shadow-md transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Truck className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
                Track Order
              </h2>
              <p className="text-[10px] text-stone-500 mt-0.5">Check delivery status</p>
            </Link>

            <Link
              href="/contact"
              className="p-3.5 rounded-2xl bg-white border border-stone-200/70 hover:border-rose-300 hover:shadow-md transition-all group col-span-2 sm:col-span-1"
            >
              <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center mb-2 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-stone-900 group-hover:text-rose-600 transition-colors">
                Need Help?
              </h2>
              <p className="text-[10px] text-stone-500 mt-0.5">Contact concierge</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
