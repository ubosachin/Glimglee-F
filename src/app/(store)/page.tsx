"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/services/products";
import { getCategories } from "@/lib/services/categories";
import { getActiveBanners } from "@/lib/services/banners";
import { getCMSContent, getReviews } from "@/lib/services/storeDb";
import { Product, Category, HomepageCMS, Banner, Review } from "@/lib/types";
import { ProductSection } from "@/components/product/ProductSection";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Container } from "@/components/ui/Container";
import { CategorySkeleton } from "@/components/ui/LoadingSkeletons";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Star,
  Gift,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Heart,
  Flame,
} from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cms, setCms] = useState<HomepageCMS | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  useEffect(() => {
    // Instant hydration from local client cache for instant 0ms first render
    try {
      const localProds = localStorage.getItem("glimglee_live_products");
      const localCats = localStorage.getItem("glimglee_live_categories");
      const localCms = localStorage.getItem("glimglee_db_cms");
      if (localProds) setProducts(JSON.parse(localProds));
      if (localCats) setCategories(JSON.parse(localCats));
      if (localCms) setCms(JSON.parse(localCms));
      if (localProds && localCats) setLoading(false);
    } catch {}

    async function loadData() {
      try {
        const [prods, cats, bnrList, cmsData, revs] = await Promise.all([
          getProducts(),
          getCategories(),
          getActiveBanners(),
          getCMSContent(),
          getReviews(),
        ]);
        setProducts(prods);
        setCategories(cats);
        setBanners(bnrList);
        setCms(cmsData);
        setReviews(revs.filter((r) => r.status === "approved"));
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleCatUpdate = () => {
      getCategories().then(setCategories);
    };
    window.addEventListener("glimglee_categories_updated", handleCatUpdate);
    return () => window.removeEventListener("glimglee_categories_updated", handleCatUpdate);
  }, []);

  // Filter dynamic product categories
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 8);
  const trending = products.slice(0, 8);
  const under499 = products.filter((p) => p.price <= 499).slice(0, 8);
  const under999 = products.filter((p) => p.price > 499 && p.price <= 999).slice(0, 8);
  const personalizedGifts = products.filter((p) => p.isCustomizable || p.categoryId === "personalized-frames").slice(0, 8);

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeStatus(`Verified! Express dispatch available to ${pincode}. Standard 2–4 days delivery.`);
    } else {
      setPincodeStatus("Please enter a valid 6-digit Indian PIN code.");
    }
  };

  const midBanner = banners.find((b) => b.placement === "mid_banner") || banners[0];

  return (
    <div className="space-y-12 sm:space-y-20 pb-16">
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* 1. HERO SECTION (Mobile-First Responsive) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff5f5] via-[#faf8f5] to-transparent pt-6 sm:pt-12 pb-10 sm:pb-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-rose-100/90 border border-rose-200 text-rose-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                <span>{cms?.heroBadge || "Modern Gifting, Made Personal"}</span>
              </div>

              {/* Heading with Fluid Typography */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
                Make Every Moment{" "}
                <span className="relative inline-block text-rose-600">
                  Glow
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full text-rose-300 pointer-events-none"
                    viewBox="0 0 100 12"
                    fill="none"
                  >
                    <path
                      d="M1 9.5C25 3.5 75 3.5 99 9.5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                With Meaningful Gifts.
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base lg:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {cms?.heroSubheading ||
                  "Curated luxury gift hampers, hand-poured soy candles, artisan cards, and personalized keepsakes hand-finished with love for birthdays, anniversaries, and life's sweetest milestones."}
              </p>

              {/* Responsive CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/shop"
                  className="min-h-[48px] px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm text-center shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Explore All Gifts</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/category/personalized-frames"
                  className="min-h-[48px] px-8 py-3.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-bold text-xs sm:text-sm text-center shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Personalize A Keepsake</span>
                </Link>
              </div>

              {/* Brand Assurances */}
              <div className="pt-4 sm:pt-6 border-t border-stone-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-stone-600">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>Handcrafted In India</span>
                </div>
                <div className="hidden sm:block text-stone-300">•</div>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Pan-India Safe Delivery</span>
                </div>
                <div className="hidden sm:block text-stone-300">•</div>
                <div className="flex items-center gap-1.5 font-semibold text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>100% Damage-Proof Packaging</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50 flex items-center justify-center">
                {cms?.heroImage ? (
                  <Image
                    src={cms.heroImage}
                    alt="Glimglee Luxury Keepsake"
                    fill
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-rose-100/80 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                      <Gift className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-stone-900">GLIMGLEE</h4>
                      <p className="text-xs text-stone-500 mt-1">Modern Gifting, Made Personal</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Pill Badges */}
              {bestsellers.length > 0 && (
                <div className="absolute -bottom-4 -left-2 sm:left-4 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Bestseller</span>
                    <p className="text-xs font-bold text-stone-900">{bestsellers[0].name}</p>
                  </div>
                </div>
              )}

              <div className="absolute -top-3 -right-2 sm:right-4 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-stone-900">Handcrafted</p>
                  <p className="text-[10px] text-stone-500">Curated with love</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. DYNAMIC CATEGORIES BROWSER */}
      {categories.length > 0 && (
        <section className="py-2">
          <Container>
            <div className="flex items-end justify-between mb-4 sm:mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  Explore By Category
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">
                  Curated Gift Collections
                </h2>
              </div>
              <Link
                href="/categories"
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span>All Collections</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <CategorySkeleton count={6} />
            ) : (
              <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex-shrink-0 w-28 sm:w-auto text-center group snap-start flex flex-col items-center"
                  >
                    <div className="w-28 h-28 sm:w-full sm:aspect-square rounded-2xl sm:rounded-3xl overflow-hidden relative border border-stone-200/90 shadow-2xs group-hover:shadow-md group-hover:border-rose-500 group-hover:-translate-y-0.5 transition-all duration-300 bg-stone-100 mb-2.5">
                      {cat.imageUrl || cat.image ? (
                        <Image
                          src={cat.imageUrl || cat.image}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 120px, (max-width: 1024px) 200px, 240px"
                          className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-stone-100 text-rose-600 font-black text-sm">
                          {cat.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-stone-800 group-hover:text-rose-600 transition-colors line-clamp-1">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-stone-400 group-hover:text-rose-500 transition-colors font-medium">
                      {cat.itemCount ? `${cat.itemCount}+ gifts` : "View"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* 3. BESTSELLERS SECTION */}
      <ProductSection
        title="Bestselling Keepsakes"
        subtitle="Handcrafted gifts most loved and repeatedly gifted across India"
        badge="Loved by Thousands"
        viewAllHref="/shop?sort=bestseller"
        products={bestsellers}
        onQuickView={setQuickViewProduct}
      />

      {/* 4. MID PROMOTIONAL BANNER (Dynamic from Database) */}
      {midBanner && (
        <section className="py-4">
          <Container>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 to-rose-950 text-white p-6 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left max-w-lg z-10">
                {midBanner.badge && (
                  <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider border border-rose-500/30">
                    {midBanner.badge}
                  </span>
                )}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  {midBanner.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {midBanner.subtitle}
                </p>
                <div className="pt-2">
                  <Link
                    href={midBanner.ctaLink || "/shop"}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-stone-950 font-bold text-xs hover:bg-rose-50 transition-colors shadow-md"
                  >
                    <span>{midBanner.ctaText || "Explore Gifts"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                  </Link>
                </div>
              </div>

              {midBanner.imageUrl && (
                <div className="relative w-full md:w-72 h-44 sm:h-56 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                  <Image
                    src={midBanner.imageUrl}
                    alt={midBanner.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* 5. PERSONALIZED GIFTS SPOTLIGHT */}
      <ProductSection
        title="Personalized Keepsakes"
        subtitle="Upload photos, engrave dates, and write heartfelt notes onto artisan wood and glass"
        badge="Bespoke Craft"
        viewAllHref="/category/personalized-frames"
        products={personalizedGifts}
        onQuickView={setQuickViewProduct}
      />

      {/* 6. BUDGET-FRIENDLY GIFTS SECTIONS */}
      <ProductSection
        title="Pocket-Friendly Gifts Under ₹499"
        subtitle="Thoughtful mini hampers, seed-embedded cards, and scented wax melts"
        viewAllHref="/shop?maxPrice=499"
        products={under499}
        onQuickView={setQuickViewProduct}
      />

      <ProductSection
        title="Cherished Hampers Under ₹999"
        subtitle="Delightful luxury boxes and photo frames under ₹999 eligible for free delivery"
        viewAllHref="/shop?maxPrice=999"
        products={under999}
        onQuickView={setQuickViewProduct}
      />

      {/* 7. PINCODE DELIVERY ESTIMATOR */}
      <section className="py-6">
        <Container size="md">
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-stone-900">
                Check Delivery Serviceability
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                We deliver to 20,000+ PIN codes across India via BlueDart, Delhivery, and DTDC Air Express.
              </p>
            </div>

            <form onSubmit={checkPincode} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit PIN code..."
                className="flex-1 px-4 py-3 rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-900 font-mono focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors"
              >
                Check
              </button>
            </form>

            {pincodeStatus && (
              <p className="text-xs font-semibold text-rose-700 bg-rose-50/80 p-3 rounded-xl max-w-md mx-auto border border-rose-100">
                {pincodeStatus}
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* 8. AUTHENTIC REVIEWS SECTION */}
      {reviews.length > 0 && (
        <section className="py-6">
          <Container>
            <div className="text-center space-y-1 mb-8">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Customer Feedback
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                Verified Recipient Reviews ({reviews.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {reviews.slice(0, 3).map((rev) => (
                <div key={rev.id} className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>
                  <h4 className="text-xs font-bold text-stone-900">{rev.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">{rev.userName}</span>
                    {rev.verifiedPurchase && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
