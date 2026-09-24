"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getStoreSettings } from "@/lib/services/storeDb";
import { StoreSettings } from "@/lib/types";

export default function ContactPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [subject, setSubject] = useState("Order Inquiry");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getStoreSettings().then(setSettings);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast("Please fill in required fields", "error");
      return;
    }
    setSubmitted(true);
    toast("Thank you! Your ticket has been logged with our customer care team.", "success");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
          Customer Care & Studio
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          We're Here To Make Your Gifting Effortless
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Have a question about custom hampers, bulk corporate gifting, or order tracking? Drop us a note!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Email Support</h3>
              <p className="text-sm font-semibold text-stone-900 mt-1">
                {settings?.supportEmail || "Contact support below"}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">Response within 2-4 business hours</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Phone & WhatsApp</h3>
              <p className="text-sm font-semibold text-stone-900 mt-1">
                {settings?.supportPhone || "Inquire via contact form"}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">Mon – Sat, 9:30 AM to 7:00 PM IST</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Design Studio & Workshop</h3>
              <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                {settings?.address ? (
                  settings.address
                ) : (
                  <>
                    Glimglee Keepsakes & Hampers<br />
                    Pan-India Delivery
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Message Received!</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  A Glimglee gifting concierge has received your request and will get in touch with you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="radhika@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Order Reference (Optional)</label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. GLM-10291"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Inquiry Topic</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                  >
                    <option value="Order Inquiry">Order Status & Delivery Update</option>
                    <option value="Customization Question">Custom Keepsake / Photo Engraving Question</option>
                    <option value="Corporate Gifting">Corporate Bulk Hampers (50+ units)</option>
                    <option value="Damage Replacement">Damage Replacement / Happiness Guarantee</option>
                    <option value="General Feedback">Feedback or Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need help with..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
