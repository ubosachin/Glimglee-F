"use client";

import React, { useState } from "react";
import { ChevronDown, Sparkles, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does product personalization work?",
      a: "When you choose a customizable gift (such as our floating glass frames or custom candle labels), you will see live fields to upload your favorite photo, write a personalized message, and choose engraving fonts. Our team reviews your uploaded photo for clarity before high-resolution printing.",
    },
    {
      q: "How long does delivery take across India?",
      a: "Standard delivery typically arrives in 3–5 business days. We also offer Priority Air Express (24–48 hours) for metro cities (Delhi NCR, Mumbai, Bangalore, Pune, Hyderabad, Chennai, Kolkata).",
    },
    {
      q: "Is luxury gift packaging included with every order?",
      a: "Yes! Every Glimglee hamper and keepsake is presented in our signature gift box, cushioned with festive crinkle shred, and finished with a complimentary handwritten greeting card.",
    },
    {
      q: "What is the Glimglee Happiness Guarantee?",
      a: "If any item arrives damaged or glass breaks during courier transit, send us a quick photo on WhatsApp (+91 80000 45464) or email care@glimglee.com. We dispatch an instant free replacement without hassle.",
    },
    {
      q: "Can I place bulk orders for corporate gifting or weddings?",
      a: "Absolutely! We customize corporate hampers with company logos, personalized gift sleeves, and bulk pan-India multi-address dispatch. Reach out through our Contact page or WhatsApp for bulk tier pricing.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center justify-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> Gifting Answers
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Everything you need to know about customizing, packaging, and sending gifts.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 divide-y divide-stone-200 overflow-hidden shadow-sm">
        {faqs.map((faq, idx) => (
          <div key={idx}>
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
            >
              <h3 className="text-sm font-bold text-stone-900">{faq.q}</h3>
              <ChevronDown
                className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform ${
                  openIndex === idx ? "rotate-180 text-rose-600" : ""
                }`}
              />
            </button>
            {openIndex === idx && (
              <div className="p-5 pt-0 text-xs text-stone-600 leading-relaxed bg-[#fdfcfb]">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
