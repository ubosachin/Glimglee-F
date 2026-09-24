"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getStoreSettings, updateStoreSettings, localDb } from "@/lib/services/storeDb";
import { StoreSettings } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { Sliders, Save, Database, ShieldCheck, RefreshCw, ShieldAlert, Cloud, Key, CreditCard } from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    getStoreSettings().then(setSettings);
  }, []);

  const isAuthorized = user?.role === "ADMIN" || (user?.role as any) === "SUPER_ADMIN";

  if (user && !isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 bg-white rounded-3xl border border-stone-200 shadow-sm my-12">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900">Restricted Administration Settings</h3>
        <p className="text-xs text-stone-500">
          Only Super Administrators and Store Administrators have permissions to view and modify system configuration.
        </p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    await updateStoreSettings(settings);
    setLoading(false);
    toast("Store settings saved successfully!", "success");
  };

  const handleClearCache = async () => {
    if (!confirm("Clear all local cached items and sync completely fresh with your database?")) return;
    setResetting(true);
    localDb.clear();
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    const updated = await getStoreSettings();
    setSettings(updated);
    setResetting(false);
    toast("Local cache cleared! Now running purely on live database.", "success");
  };

  if (!settings) return <div className="p-8 text-xs text-stone-500">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-4 border-b border-stone-200/80">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
          Store Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          System & Gifting Rules
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Adjust tax rates, delivery fee tiers, free shipping thresholds, and backend integrations.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-6 text-xs">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
          Store Profile & Contact
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Store Brand Name</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Currency Code</label>
            <input
              type="text"
              disabled
              value={`${settings.currency} (${settings.currencySymbol})`}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Customer Care Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Support Phone / WhatsApp</label>
            <input
              type="text"
              value={settings.supportPhone}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-stone-700 mb-1">Store / Studio Address</label>
            <input
              type="text"
              value={settings.address || ""}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="e.g. Workshop Studio, MG Road, Bangalore, India"
              className="w-full px-3 py-2 rounded-xl border border-stone-200"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
            Financial & Shipping Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Free Shipping Min (₹)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                value={settings.standardShippingRate}
                onChange={(e) => setSettings({ ...settings, standardShippingRate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Express Air Shipping (₹)</label>
              <input
                type="number"
                value={settings.expressShippingRate}
                onChange={(e) => setSettings({ ...settings, expressShippingRate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Gift Wrap Surcharge (₹)</label>
              <input
                type="number"
                value={settings.giftWrapRate}
                onChange={(e) => setSettings({ ...settings, giftWrapRate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </form>

      {/* Backend Infrastructure Inspector Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-4 text-xs">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Cloud Infrastructure & Integrations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <div className="flex items-center gap-2 text-stone-500 font-bold">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Database Engine</span>
            </div>
            <p className="font-bold text-stone-900">MongoDB Atlas</p>
            <p className="text-[10px] text-stone-500">Live collection repository with connection pooling</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <div className="flex items-center gap-2 text-stone-500 font-bold">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Authentication</span>
            </div>
            <p className="font-bold text-stone-900">Google Cloud OAuth</p>
            <p className="text-[10px] text-stone-500">Google Identity Services with secure JWT sessions</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <div className="flex items-center gap-2 text-stone-500 font-bold">
              <Cloud className="w-4 h-4 text-sky-600" />
              <span>Image & Media CDN</span>
            </div>
            <p className="font-bold text-stone-900">Cloudinary (Free Tier)</p>
            <p className="text-[10px] text-stone-500">Direct server-side optimization & global delivery</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <div className="flex items-center gap-2 text-stone-500 font-bold">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Payment Gateway</span>
            </div>
            <p className="font-bold text-stone-900">Cashfree PG + COD</p>
            <p className="text-[10px] text-stone-500">Seamless UPI, cards, netbanking & idempotency</p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100">
          <div>
            <h4 className="font-bold text-stone-900">Purge Local Cache & Re-sync</h4>
            <p className="text-[11px] text-stone-500">Wipe browser cached items and load fresh data from your cloud database.</p>
          </div>

          <button
            onClick={handleClearCache}
            disabled={resetting}
            className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
            <span>Clear Local Storage Cache</span>
          </button>
        </div>
      </div>
    </div>
  );
}
