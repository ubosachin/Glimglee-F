import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, Server, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy & Photo Security Policy | Glimglee Gifting",
  description: "Learn how Glimglee protects your personal memories, uploaded photographs, custom engravings, and transaction data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-xs text-stone-500">
        <Link href="/" className="hover:text-rose-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Privacy Policy</span>
      </div>

      <div className="border-b border-stone-200/80 pb-6 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
          Data Protection & Trust
        </span>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-rose-600" />
          <span>Privacy & Photo Security Policy</span>
        </h1>
        <p className="text-xs text-stone-500">
          Last updated: September 2026 • Glimglee Technologies Pvt. Ltd.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-stone-900">Encrypted Cloud Storage</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            All customer photos uploaded for customized frames are encrypted at rest using AES-256 bit security.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <EyeOff className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-stone-900">Zero Commercial Usage</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Your personal photos and messages are never published in ads or public marketing without explicit signed consent.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-stone-900">Automated Photo Purge</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            High-resolution print assets are automatically archived and purged from production servers 90 days after delivery.
          </p>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            1. What Information We Collect
          </h2>
          <p>
            When you visit or place an order on Glimglee, we collect essential information required to deliver your gifts:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li><strong>Personal Contact Data:</strong> Name, shipping address, recipient contact number, and billing email.</li>
            <li><strong>Bespoke Customization Content:</strong> Photographs uploaded for photo frames, names for engraving, song codes, and custom heartfelt messages written for greeting cards.</li>
            <li><strong>Payment Information:</strong> All payment transactions are encrypted and processed directly via RBI-authorized payment gateways (Razorpay, Cashfree, UPI). <strong>Glimglee never stores your raw credit card numbers or UPI PINs.</strong></li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            2. Confidential Handling of Personal Photographs
          </h2>
          <p>
            We deeply respect that the photos you upload are cherished memories of family, partners, children, and friends. We adhere to strict internal protocols:
          </p>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <p>• Only vetted printing technicians and quality control managers have temporary access to photo files during print processing.</p>
            <p>• Uploaded files are transmitted solely over HTTPS/TLS 1.3 encrypted sockets to secure Cloudinary CDN media buckets.</p>
            <p>• Customers may request an immediate permanent erasure of all their uploaded photos by sending an email with their Order ID to <a href="mailto:privacy@glimglee.com" className="text-rose-600 font-bold hover:underline">privacy@glimglee.com</a>.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            3. Third-Party Disclosures
          </h2>
          <p>
            We only share strictly necessary information with:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li><strong>Delivery Partners (BlueDart, Delhivery, etc.):</strong> Recipient name, delivery address, and telephone number for package transit and delivery coordination.</li>
            <li><strong>Transactional Communication Providers:</strong> SMS and WhatsApp gateway APIs to send order confirmation and delivery status updates.</li>
            <li><strong>We NEVER sell, rent, or trade your personal data</strong> to third-party telemarketers or external advertisers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            4. Cookies & Web Analytics
          </h2>
          <p>
            We use essential session cookies to remember the contents of your shopping cart, your saved login session, and recently viewed gifts to provide an optimized browsing experience. You can manage or disable cookies via your browser settings at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            5. Grievance Officer & Contact
          </h2>
          <p>
            In accordance with the Information Technology Act 2000 and Digital Personal Data Protection Act, questions regarding our privacy practices can be addressed to:
          </p>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
            <p className="font-bold text-stone-900">Grievance Officer: Ananya Sen</p>
            <p>Glimglee Technologies Private Limited</p>
            <p>Indiranagar, Bengaluru, Karnataka 560038, India</p>
            <p>Email: <a href="mailto:grievance@glimglee.com" className="text-rose-600 font-semibold">grievance@glimglee.com</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
