import React from "react";
import Link from "next/link";
import { Truck, Clock, ShieldCheck, MapPin, PackageCheck, AlertCircle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy | Glimglee Gifting",
  description: "Learn about Glimglee's pan-India delivery timelines, express courier partners, temperature-controlled packaging, and order tracking.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-xs text-stone-500">
        <Link href="/" className="hover:text-rose-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Shipping Policy</span>
      </div>

      <div className="border-b border-stone-200/80 pb-6 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
          Delivery & Fulfillment
        </span>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
          <Truck className="w-8 h-8 text-rose-600" />
          <span>Pan-India Shipping Policy</span>
        </h1>
        <p className="text-xs text-stone-500">
          Last updated: September 2026 • Verified for 20,000+ Indian Postal Codes
        </p>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-stone-900">3–5 Business Days</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Standard pan-India delivery with real-time tracking across all Tier 1, 2, and 3 cities.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <PackageCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-stone-900">Custom Crafting Time</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Personalized photo frames & engravings require 24–48 hours of artisan handcrafting before dispatch.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-stone-900">Armor Packaging</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Multi-layer bubble wrap, foam corner protectors, and thermo-stabilized boxes for candles & glassware.
          </p>
        </div>
      </div>

      {/* Detailed Policy Text */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            1. Courier Partners & Network Coverage
          </h2>
          <p>
            Glimglee partners with India's top tier-1 logistics networks including <strong>BlueDart Express, Delhivery, DTDC, and XpressBees</strong>. Every package is assigned an automated Air Waybill (AWB) number upon quality inspection and dispatch.
          </p>
          <p>
            We service over 20,000+ residential and commercial PIN codes across all Indian states and Union Territories.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            2. Shipping Rates & Free Shipping Threshold
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li>
              <strong>Free Standard Delivery:</strong> Applicable on all gift orders with a cart subtotal of <strong>₹999 or higher</strong>.
            </li>
            <li>
              <strong>Flat Standard Shipping:</strong> A nominal delivery fee of <strong>₹79</strong> is charged for orders under ₹999.
            </li>
            <li>
              <strong>Express Air Dispatch (Select Metros):</strong> ₹149 flat for expedited next-day or 2-day delivery across Delhi-NCR, Mumbai, Bengaluru, Hyderabad, and Chennai.
            </li>
            <li>
              <strong>Cash on Delivery (COD):</strong> An additional convenience handling charge of ₹49 is levied on COD orders to cover third-party courier cash handling fees.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            3. Order Processing & Artisan Personalization
          </h2>
          <p>
            Unlike mass-produced goods, bespoke gifts are individually crafted:
          </p>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <p>
              • <strong>Ready-to-Ship Hampers & Candles:</strong> Dispatched within 24 hours of order confirmation.
            </p>
            <p>
              • <strong>Personalized Photo Frames & Laser Engravings:</strong> High-resolution proof checking, laser engraving, and UV curing require <strong>24 to 48 hours</strong> prior to dispatch.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            4. Real-time Tracking & Notifications
          </h2>
          <p>
            As soon as your gift leaves our fulfillment studio, you will receive automated:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>WhatsApp notification with live dispatch and out-for-delivery alerts.</li>
            <li>SMS alerts with the courier AWB number.</li>
            <li>24/7 web tracking accessible at <Link href="/orders/track" className="text-rose-600 font-bold hover:underline">glimglee.com/orders/track</Link>.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            5. Safe Transit & Damage Protection
          </h2>
          <p>
            All candles, glass frames, and ceramic mugs are shipped in our proprietary <strong>Glimglee ArmorBox™</strong> featuring high-density EPE foam. If, under rare circumstances, an item arrives broken during courier transit, we will dispatch an immediate free replacement under our <strong>Glimglee Happiness Guarantee</strong>.
          </p>
        </section>

        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 space-y-1">
            <span className="font-bold">Need urgent anniversary or birthday gifting assistance?</span>
            <p>
              Reach out directly to our Gifting Concierge team at <a href="mailto:support@glimglee.com" className="underline font-semibold">support@glimglee.com</a> or WhatsApp us at +91 98765 43210 for emergency priority routing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
