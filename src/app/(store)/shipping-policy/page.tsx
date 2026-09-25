import React from "react";
import Link from "next/link";
import { Truck, Clock, ShieldCheck, MapPin, PackageCheck, AlertCircle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Worldwide & Pan-India Shipping Policy | Glimglee Gifting",
  description:
    "Glimglee ships worldwide. In India: Free delivery on orders above ₹1,500 (₹100 below ₹1,500). International: Free worldwide delivery on orders above ₹5,000 (₹400 below ₹5,000).",
  alternates: {
    canonical: "/shipping-policy",
  },
  openGraph: {
    title: "Worldwide & Pan-India Shipping Policy | Glimglee Gifting",
    description:
      "Global delivery rates: Free India delivery over ₹1,500 (₹100 under ₹1,500). Free International shipping over ₹5,000 (₹400 under ₹5,000).",
    url: "https://glimglee.com/shipping-policy",
  },
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
          Worldwide Delivery & Fulfillment
        </span>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
          <Truck className="w-8 h-8 text-rose-600" />
          <span>Worldwide & Domestic Shipping Policy</span>
        </h1>
        <p className="text-xs text-stone-500">
          Last updated: September 2026 • Verified for India & 190+ Countries Worldwide
        </p>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-stone-900">India: Free Above ₹1,500</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Free shipping on orders above ₹1,500 across India (Flat ₹100 for orders under ₹1,500). Delivers in 3–5 business days.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <PackageCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-stone-900">Worldwide: Free Above ₹5,000</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Free international shipping on orders above ₹5,000 (Flat ₹400 for orders under ₹5,000). Express air transit to 190+ countries.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-stone-900">ArmorBox™ Packaging</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Double-cushioned bubble wrap, corner safety guards, and thermal preservation for candles & delicate glassware.
          </p>
        </div>
      </div>

      {/* Detailed Policy Text */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            1. Global & Pan-India Courier Partners
          </h2>
          <p>
            Glimglee proudly delivers memories worldwide. We partner with premier tier-1 express logistics providers:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li><strong>Domestic (India):</strong> BlueDart Express, Delhivery, DTDC, and XpressBees covering 20,000+ PIN codes.</li>
            <li><strong>International (Worldwide):</strong> DHL Express, FedEx International, Aramex, and UPS covering 190+ countries globally including the USA, UK, UAE, Canada, Australia, Singapore, and Europe.</li>
          </ul>
        </section>

        {/* Section 2: Clear Shipping Rates */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            2. Shipping Rates & Free Delivery Thresholds
          </h2>
          
          <div className="overflow-hidden rounded-2xl border border-stone-200">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 font-bold text-stone-800">
                  <th className="p-3 sm:p-4">Destination</th>
                  <th className="p-3 sm:p-4">Order Value</th>
                  <th className="p-3 sm:p-4">Delivery Fee</th>
                  <th className="p-3 sm:p-4">Estimated Transit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-600">
                <tr className="hover:bg-stone-50/50">
                  <td className="p-3 sm:p-4 font-semibold text-stone-900" rowSpan={2}>
                    🇮🇳 India (Domestic)
                  </td>
                  <td className="p-3 sm:p-4 font-semibold text-emerald-700">
                    Above ₹1,500
                  </td>
                  <td className="p-3 sm:p-4 font-bold text-emerald-600">
                    FREE
                  </td>
                  <td className="p-3 sm:p-4">
                    3–5 Business Days
                  </td>
                </tr>
                <tr className="hover:bg-stone-50/50">
                  <td className="p-3 sm:p-4">
                    Below ₹1,500
                  </td>
                  <td className="p-3 sm:p-4 font-semibold text-stone-800">
                    ₹100 Flat
                  </td>
                  <td className="p-3 sm:p-4">
                    3–5 Business Days
                  </td>
                </tr>
                <tr className="hover:bg-stone-50/50 bg-rose-50/20">
                  <td className="p-3 sm:p-4 font-semibold text-stone-900" rowSpan={2}>
                    🌍 International (Outside India)
                  </td>
                  <td className="p-3 sm:p-4 font-semibold text-emerald-700">
                    Above ₹5,000
                  </td>
                  <td className="p-3 sm:p-4 font-bold text-emerald-600">
                    FREE Worldwide
                  </td>
                  <td className="p-3 sm:p-4">
                    7–12 Business Days
                  </td>
                </tr>
                <tr className="hover:bg-stone-50/50 bg-rose-50/20">
                  <td className="p-3 sm:p-4">
                    Below ₹5,000
                  </td>
                  <td className="p-3 sm:p-4 font-semibold text-stone-800">
                    ₹400 Flat
                  </td>
                  <td className="p-3 sm:p-4">
                    7–12 Business Days
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-stone-500 italic">
            * All international parcels are shipped via priority air courier with door-to-door tracking. Any local import duties, VAT, or customs fees levied by destination country regulations are payable by the recipient upon delivery.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            3. Order Processing & Artisan Customization
          </h2>
          <p>
            Because every Glimglee gift is personalized and hand-finished with love:
          </p>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <p>
              • <strong>Ready-to-Ship Hampers & Scented Candles:</strong> Inspected and dispatched within 24 hours of order placement.
            </p>
            <p>
              • <strong>Custom Photo Frames & Engravings:</strong> High-resolution proof checking, laser engraving, UV curing, and personalized greeting card writing require <strong>24 to 48 hours</strong> prior to dispatch.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            4. Real-time Tracking & Dispatch Alerts
          </h2>
          <p>
            The moment your gift is dispatched from our artisan studio, tracking details are sent automatically:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>WhatsApp notification with live dispatch and courier tracking links.</li>
            <li>Email confirmation with official Air Waybill (AWB) number and invoice.</li>
            <li>24/7 web tracking accessible at <Link href="/orders/track" className="text-rose-600 font-bold hover:underline">glimglee.com/orders/track</Link>.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            5. Safe Transit & Glimglee Happiness Guarantee
          </h2>
          <p>
            All candles, glass frames, and delicate keepsakes are shipped in our proprietary <strong>Glimglee ArmorBox™</strong> with shock-absorbing foam. If any item arrives damaged or broken during transit, our <strong>Glimglee Happiness Guarantee</strong> provides an immediate free replacement.
          </p>
        </section>

        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 space-y-1">
            <span className="font-bold">Need emergency gifting assistance or corporate bulk routing?</span>
            <p>
              Reach out directly to our Gifting Concierge team at <a href="mailto:support@glimglee.com" className="underline font-semibold">support@glimglee.com</a> or WhatsApp us at +91 80000 45464.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
