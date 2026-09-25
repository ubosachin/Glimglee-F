import React from "react";
import Link from "next/link";
import { RefreshCw, ShieldCheck, HeartHandshake, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Return & Replacement Policy | Glimglee Gifting",
  description:
    "Glimglee 100% Happiness Guarantee. Understand our replacement policy for transit breakages, personalized gifts, and easy refund procedures.",
  alternates: {
    canonical: "/return-policy",
  },
  openGraph: {
    title: "Return & Replacement Policy | Glimglee Gifting",
    description:
      "Glimglee 100% Happiness Guarantee: Instant hassle-free replacements for any transit damage or manufacturing defect.",
    url: "https://glimglee.com/return-policy",
  },
};

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-xs text-stone-500">
        <Link href="/" className="hover:text-rose-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Return & Replacement Policy</span>
      </div>

      <div className="border-b border-stone-200/80 pb-6 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
          Glimglee Happiness Guarantee
        </span>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-rose-600" />
          <span>Returns, Replacements & Refunds</span>
        </h1>
        <p className="text-xs text-stone-500">
          We want every recipient to glow with happiness. If something isn't right, we fix it with zero friction.
        </p>
      </div>

      {/* 3 Step Replacement Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
            01
          </span>
          <h4 className="text-sm font-bold text-stone-900">Snap a Photo / Video</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Within 48 hours of delivery, take a quick photo of the outer box and any damaged or defective item.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
            02
          </span>
          <h4 className="text-sm font-bold text-stone-900">Message on WhatsApp</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Send your Order ID and photo to our 24/7 Gifting Support WhatsApp line at +91 98765 43210.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
            03
          </span>
          <h4 className="text-sm font-bold text-stone-900">Free Priority Dispatch</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            We approve genuine transit claims in under 4 business hours and rush a brand-new replacement via Express Air.
          </p>
        </div>
      </div>

      {/* Main Policy Content */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            1. Personalized & Bespoke Keepsakes
          </h2>
          <p>
            Because personalized gifts (such as custom photo wooden frames, engraved barware, monogrammed notebooks, and customized greeting cards) are made uniquely with your personal photographs and messages, <strong>they cannot be resold and are therefore non-returnable for cash refunds due to change of mind</strong>.
          </p>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <span className="font-bold text-stone-900">We unconditionally replace personalized items if:</span>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>The item arrived broken, cracked, chipped, or scratched in transit.</li>
              <li>There is a printing or spelling error made by our production team that differs from the details you submitted during checkout.</li>
              <li>The delivered product variant or frame dimension differs from what you purchased.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            2. Non-Personalized Gifts & Home Decor
          </h2>
          <p>
            For ready-to-ship non-personalized items (such as scented soy candles, incense diffusers, and luxury gift baskets):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li>You may request an exchange or return within <strong>7 days</strong> of delivery.</li>
            <li>The item must be unused, in its original luxury packaging, with all wax seals, tags, and ribbons intact.</li>
            <li>Once our warehouse receives and inspects the return, the refund is initiated to your original payment method within 5–7 business days.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            3. Order Cancellations
          </h2>
          <p>
            Because custom gifts enter our CAD engraving and laser printing queue rapidly:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li><strong>Cancellation Window:</strong> You may cancel any order within <strong>2 hours</strong> of placing it directly via your account or by emailing us.</li>
            <li>Once an order moves to <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono text-xs">PRINTING_OR_PREPARING</code>, cancellations are not permissible as custom materials have already been precision cut.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            4. Refund Processing Timelines
          </h2>
          <p>
            All approved refunds are processed automatically back to the original source of payment:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="font-bold text-stone-900 block">UPI / Instant Wallets:</span>
              <span className="text-stone-500">Credited within 24 to 48 hours</span>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="font-bold text-stone-900 block">Credit / Debit Cards & NetBanking:</span>
              <span className="text-stone-500">Credited in 5 to 7 banking days</span>
            </div>
          </div>
        </section>

        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
          <div className="text-xs text-rose-900">
            <span className="font-bold block">Need help with an existing order?</span>
            <span>Contact support with your order number.</span>
          </div>
          <Link
            href="/contact"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs whitespace-nowrap transition-colors"
          >
            Contact Customer Care
          </Link>
        </div>
      </div>
    </div>
  );
}
