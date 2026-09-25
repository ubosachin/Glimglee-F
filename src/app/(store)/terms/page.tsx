import React from "react";
import Link from "next/link";
import { FileText, Scale, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | Glimglee Gifting",
  description:
    "Terms of service, acceptable use for custom engraving and photo printing, pricing accuracy, and intellectual property.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms & Conditions | Glimglee Gifting",
    description:
      "Terms of service, custom order processing guidelines, and merchant fulfillment commitments.",
    url: "https://glimglee.com/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-xs text-stone-500">
        <Link href="/" className="hover:text-rose-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Terms of Service</span>
      </div>

      <div className="border-b border-stone-200/80 pb-6 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
          Legal Agreement
        </span>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
          <Scale className="w-8 h-8 text-rose-600" />
          <span>Terms & Conditions</span>
        </h1>
        <p className="text-xs text-stone-500">
          Last updated: September 2026 • Glimglee Technologies Pvt. Ltd.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or ordering from <strong>Glimglee</strong> (glimglee.com), you agree to be bound by these Terms of Service, our Privacy Policy, and our Shipping and Return policies. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            2. Customer-Submitted Content (Photos & Custom Text)
          </h2>
          <p>
            By uploading photographs, graphics, or text messages for personalized frames, custom wooden carvings, or customized cards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li>You affirm that you have full legal right, ownership, or permission to reproduce the provided content.</li>
            <li>You agree not to upload content that is defamatory, obscene, pornographic, promoting hate speech, or infringing upon any third party's trademark or copyright.</li>
            <li>Glimglee reserves the right to cancel and refund any order containing abusive, unlawful, or sexually explicit material.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            3. Pricing, Taxes & Billing Accuracy
          </h2>
          <p>
            All prices displayed on the store are listed in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST). Glimglee reserves the right to adjust catalog pricing or promotional discounts at any time without prior notice.
          </p>
          <p>
            In the rare event that an item is mistakenly cataloged with an incorrect price due to typographical error, Glimglee reserves the right to decline or cancel orders placed for that item prior to dispatch, issuing an immediate full refund.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            4. Promotional Codes & Gift Vouchers
          </h2>
          <p>
            Discount coupons (such as <code className="bg-stone-100 px-1.5 py-0.5 rounded text-rose-700 font-mono font-bold text-xs">GLOW10</code> or <code className="bg-stone-100 px-1.5 py-0.5 rounded text-rose-700 font-mono font-bold text-xs">FESTIVE500</code>) are valid for a single redemption per customer account unless explicitly stated otherwise. Coupons cannot be stacked or exchanged for cash balances.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            5. Limitation of Liability & Governing Law
          </h2>
          <p>
            Glimglee will not be liable for any indirect, incidental, or consequential damages resulting from courier transit delays caused by force majeure, severe weather conditions, or regional transport strikes. In all circumstances, Glimglee’s maximum liability is strictly limited to the purchase price paid for the specific order.
          </p>
          <p>
            These terms are governed by and construed in accordance with the laws of the Republic of India. Any legal disputes arising in relation to this agreement will be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.
          </p>
        </section>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500">
          Have questions regarding our terms? Reach our legal compliance desk at <a href="mailto:legal@glimglee.com" className="text-rose-600 font-bold hover:underline">legal@glimglee.com</a>.
        </div>
      </div>
    </div>
  );
}
