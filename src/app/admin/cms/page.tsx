"use client";

import React, { useState, useEffect } from "react";
import { getCMSContent, updateCMSContent, logAdminAction } from "@/lib/services/storeDb";
import { HomepageCMS } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { FileText, Save, Sparkles, Check } from "lucide-react";

export default function AdminCMSPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cms, setCms] = useState<HomepageCMS | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCMSContent().then(setCms);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cms) return;

    setLoading(true);
    await updateCMSContent(cms);
    await logAdminAction(user?.email || "admin@glimglee.com", "UPDATE_CMS", "cms", "homepage");
    setLoading(false);
    toast("Homepage CMS saved! Changes are live on the customer storefront.", "success");
  };

  if (!cms) return <div className="p-8 text-xs text-stone-500">Loading CMS...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-4 border-b border-stone-200/80">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
          Content Management System
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Homepage CMS & Branding
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Update hero headlines, announcement banners, and value propositions dynamically without code redeploys.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-6 text-xs">
        {/* Top Announcement Bar */}
        <div className="space-y-2">
          <label className="block font-bold text-stone-700">Top Header Announcement Bar</label>
          <input
            type="text"
            value={cms.announcement}
            onChange={(e) => setCms({ ...cms, announcement: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-medium"
          />
        </div>

        {/* Hero Section Content */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            Hero Banner Setup
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Badge Pill</label>
              <input
                type="text"
                value={cms.heroBadge}
                onChange={(e) => setCms({ ...cms, heroBadge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Hero Main Heading</label>
              <input
                type="text"
                value={cms.heroHeading}
                onChange={(e) => setCms({ ...cms, heroHeading: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Hero Subheading</label>
              <textarea
                rows={3}
                value={cms.heroSubheading}
                onChange={(e) => setCms({ ...cms, heroSubheading: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Primary CTA Label</label>
              <input
                type="text"
                value={cms.heroPrimaryCtaText}
                onChange={(e) => setCms({ ...cms, heroPrimaryCtaText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Primary CTA Link</label>
              <input
                type="text"
                value={cms.heroPrimaryCtaLink}
                onChange={(e) => setCms({ ...cms, heroPrimaryCtaLink: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Hero Image URL</label>
              <input
                type="text"
                value={cms.heroImage}
                onChange={(e) => setCms({ ...cms, heroImage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Publishing..." : "Publish CMS Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
