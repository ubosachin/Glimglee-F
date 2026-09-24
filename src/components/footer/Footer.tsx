"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getCategories } from "@/lib/services/categories";
import { Category } from "@/lib/types";
import {
  Sparkles,
  Heart,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";
import { Container } from "@/components/ui/Container";

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then((cats) => setCategories(cats.slice(0, 5)));
  }, []);

  // Mobile Accordion open state
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail("");
    }
  };

  return (
    <footer className="bg-[#1c1917] text-stone-300 mt-16 sm:mt-24 pt-12 sm:pt-16 pb-12 border-t border-stone-800">
      <Container>
        {/* Trust Highlights Strip */}
        <div className="pb-10 sm:pb-12 border-b border-stone-800/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Artisan Crafted</h4>
                <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">Hand-poured & curated with love</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pan-India Delivery</h4>
                <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">Delivered to 20,000+ pincodes</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Safe Payments</h4>
                <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">UPI, Cards, NetBanking & COD</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Happiness Guarantee</h4>
                <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">Free replacement on transit damage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand & Newsletter Section (Visible across all breakpoints) */}
        <div className="pt-10 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-white">GLIMGLEE</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mb-1" />
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Glimglee is a modern Indian D2C gifting brand. We create thoughtfully crafted hampers, hand-poured soy candles, artisan cards, and personalized keepsakes engineered to make people glow with happiness.
            </p>

            {/* Newsletter Box */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-white tracking-wide uppercase mb-1.5">
                Join the Glimglee Glow Club
              </h5>
              <p className="text-[11px] text-stone-400 mb-3">
                Get <strong className="text-rose-400">10% OFF</strong> your first gift order + festive early-access perks.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
                  <CheckCircle2 className="w-4 h-4 text-rose-400" />
                  <span>You're in! Check your inbox for code GLOW10.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email..."
                    required
                    className="flex-1 bg-stone-900 border border-stone-700 text-xs px-3.5 py-2.5 rounded-xl text-stone-200 placeholder-stone-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Desktop Links (Hidden on Mobile) */}
          <div className="hidden lg:grid lg:col-span-3 grid-cols-3 gap-8">
            {/* Column 1: Collections */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Shop Collections</h4>
              <ul className="space-y-2 text-xs text-stone-400">
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <li key={c.id}>
                      <Link href={`/category/${c.slug}`} className="hover:text-white transition-colors">
                        {c.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li><Link href="/shop" className="hover:text-white transition-colors">All Keepsakes</Link></li>
                    <li><Link href="/categories" className="hover:text-white transition-colors">Browse Collections</Link></li>
                  </>
                )}
                <li><Link href="/shop?maxPrice=499" className="hover:text-white transition-colors text-amber-300 font-semibold">Gifts Under ₹499</Link></li>
                <li><Link href="/shop?maxPrice=999" className="hover:text-white transition-colors text-amber-300 font-semibold">Gifts Under ₹999</Link></li>
              </ul>
            </div>

            {/* Column 2: Occasions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Occasions</h4>
              <ul className="space-y-2 text-xs text-stone-400">
                <li><Link href="/shop?occasion=Birthday" className="hover:text-white transition-colors">Birthday Gifts</Link></li>
                <li><Link href="/shop?occasion=Anniversary" className="hover:text-white transition-colors">Anniversary Tokens</Link></li>
                <li><Link href="/shop?occasion=Corporate" className="hover:text-white transition-colors">Corporate Gifting</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Festivals & Celebrations</Link></li>
                <li><Link href="/orders/track" className="hover:text-white transition-colors text-rose-400 font-semibold">Track My Package</Link></li>
              </ul>
            </div>

            {/* Column 3: Customer Care & Policies */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
              <ul className="space-y-2 text-xs text-stone-400">
                <li>
                  <Link
                    href="/orders/track"
                    className="hover:text-white transition-colors text-rose-400 font-bold flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5 text-rose-400" />
                    <span>Track Order</span>
                  </Link>
                </li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Our Story & Ethics</Link></li>
                <li><Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                <li><Link href="/return-policy" className="hover:text-white transition-colors">Returns & Replacements</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Photo Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Mobile Accordion Sections (Visible on Mobile & Tablet) */}
          <div className="lg:hidden col-span-1 divide-y divide-stone-800 border-t border-b border-stone-800">
            {/* Section: Collections */}
            <div>
              <button
                onClick={() => toggleSection("collections")}
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider"
              >
                <span>Shop Collections</span>
                {openSection === "collections" ? <Minus className="w-4 h-4 text-rose-400" /> : <Plus className="w-4 h-4 text-stone-400" />}
              </button>
              {openSection === "collections" && (
                <ul className="pb-3.5 space-y-2 text-xs text-stone-400 animate-in fade-in">
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <li key={c.id}>
                        <Link href={`/category/${c.slug}`} className="hover:text-white">
                          {c.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <>
                      <li><Link href="/shop" className="hover:text-white">All Keepsakes</Link></li>
                      <li><Link href="/categories" className="hover:text-white">Browse Collections</Link></li>
                    </>
                  )}
                  <li><Link href="/shop?maxPrice=499" className="text-amber-300 font-semibold">Gifts Under ₹499</Link></li>
                  <li><Link href="/shop?maxPrice=999" className="text-amber-300 font-semibold">Gifts Under ₹999</Link></li>
                </ul>
              )}
            </div>

            {/* Section: Occasions */}
            <div>
              <button
                onClick={() => toggleSection("occasions")}
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider"
              >
                <span>Occasions & Events</span>
                {openSection === "occasions" ? <Minus className="w-4 h-4 text-rose-400" /> : <Plus className="w-4 h-4 text-stone-400" />}
              </button>
              {openSection === "occasions" && (
                <ul className="pb-3.5 space-y-2 text-xs text-stone-400 animate-in fade-in">
                  <li><Link href="/shop?occasion=Birthday" className="hover:text-white">Birthday Gifts</Link></li>
                  <li><Link href="/shop?occasion=Anniversary" className="hover:text-white">Anniversary Tokens</Link></li>
                  <li><Link href="/shop?occasion=Corporate" className="hover:text-white">Corporate Gifting</Link></li>
                  <li><Link href="/categories" className="hover:text-white">Festivals & Diwali</Link></li>
                  <li><Link href="/orders/track" className="text-rose-400 font-semibold">Track Delivery</Link></li>
                </ul>
              )}
            </div>

            {/* Section: Customer Care & Policies */}
            <div>
              <button
                onClick={() => toggleSection("care")}
                className="w-full py-3.5 flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider"
              >
                <span>Customer Care & Policies</span>
                {openSection === "care" ? <Minus className="w-4 h-4 text-rose-400" /> : <Plus className="w-4 h-4 text-stone-400" />}
              </button>
              {openSection === "care" && (
                <ul className="pb-3.5 space-y-2 text-xs text-stone-400 animate-in fade-in">
                  <li>
                    <Link href="/orders/track" className="text-rose-400 font-bold flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-rose-400" />
                      <span>Track Order</span>
                    </Link>
                  </li>
                  <li><Link href="/contact" className="hover:text-white">Contact & Support</Link></li>
                  <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
                  <li><Link href="/about" className="hover:text-white">Our Story & Craft</Link></li>
                  <li><Link href="/shipping-policy" className="hover:text-white">Shipping Policy</Link></li>
                  <li><Link href="/return-policy" className="hover:text-white">Returns & Replacements</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-white">Photo Security & Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Glimglee Technologies Pvt. Ltd. All rights reserved. Made with love in India.</p>
          <p className="flex items-center justify-center gap-1">
            Modern gifting, made personal <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </Container>
    </footer>
  );
};
