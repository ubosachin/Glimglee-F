"use client";

import React, { useState, useEffect } from "react";
import { getBroadcastInfo, postBroadcast } from "@/lib/services/adminBroadcast";
import { getProducts, getCoupons } from "@/lib/services/storeDb";
import { Product, Coupon, BroadcastProductItem } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import {
  Send,
  Mail,
  Key,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Eye,
  ShoppingBag,
  Ticket,
  ExternalLink,
  RefreshCw,
  Smartphone,
  Monitor,
  Users,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

export default function AdminBroadcastPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  // SMTP Settings
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);
  const [gmailUser, setGmailUser] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [gmailSenderName, setGmailSenderName] = useState("Glimglee Gifting");
  const [hasSavedPassword, setHasSavedPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState<boolean | null>(null);

  // Available Data for Embedding
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);

  // Broadcast Composer State
  const [subject, setSubject] = useState("✨ Special Festive Announcement from Glimglee");
  const [preheader, setPreheader] = useState("Discover our newest handcrafted gifting collection with exclusive perks.");
  const [badge, setBadge] = useState("Festive Spotlight");
  const [heading, setHeading] = useState("Celebrating Life's Most Cherished Moments");
  const [bodyText, setBodyText] = useState(
    "Dear Glimglee Family,\n\nWe are delighted to bring you our latest curation of bespoke resin art, handcrafted pooja essentials, and personalized gift hampers designed to bring unforgettable warmth to your home.\n\nEnjoy express pan-India gifting delivery, artisanal luxury packaging, and our utmost attention to every detail."
  );
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCouponCode, setSelectedCouponCode] = useState("");
  const [ctaText, setCtaText] = useState("Shop The Collection");
  const [ctaLink, setCtaLink] = useState("/shop");

  // Actions State
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Load initial data
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [info, prods, coups] = await Promise.all([
        getBroadcastInfo(),
        getProducts(),
        getCoupons(),
      ]);

      setTotalRecipients(info.totalRecipients || 0);
      setHistory(info.history || []);

      if (info.settings) {
        setGmailUser(info.settings.gmailUser || "");
        setGmailSenderName(info.settings.gmailSenderName || "Glimglee Gifting");
        setHasSavedPassword(info.settings.hasGoogleAppPassword);
        if (!info.settings.hasGoogleAppPassword) {
          setShowSmtpSettings(true); // Open setup if not configured
        }
      }

      setCatalogProducts(prods);
      setActiveCoupons(coups.filter((c) => c.active));

      // Auto-select first 2 products for nice initial preview
      if (prods.length > 0) {
        setSelectedProductIds(prods.slice(0, 2).map((p) => p.id));
      }
      if (coups.length > 0) {
        setSelectedCouponCode(coups[0].code);
      }
    } catch (e) {
      console.error("Broadcast load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (user?.email && !testEmail) {
      setTestEmail(user.email);
    }
  }, [user]);

  // Test SMTP connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionSuccess(null);
    try {
      const res = await postBroadcast({
        action: "test_connection",
        gmailUser,
        gmailAppPassword,
        gmailSenderName,
      });

      if (res.success) {
        setConnectionSuccess(true);
        toast("Google SMTP connection verified successfully! Ready to send.", "success");
      } else {
        setConnectionSuccess(false);
        toast(res.message || "Failed to connect to Google SMTP", "error");
      }
    } catch (err: any) {
      setConnectionSuccess(false);
      toast(err?.message || "Failed to verify connection", "error");
    } finally {
      setTestingConnection(false);
    }
  };

  // Save SMTP settings to MongoDB
  const handleSaveSettings = async () => {
    try {
      await postBroadcast({
        action: "save_settings",
        gmailUser,
        gmailAppPassword,
        gmailSenderName,
      });
      setHasSavedPassword(true);
      toast("Google App Password settings saved securely!", "success");
    } catch (err: any) {
      toast(err?.message || "Failed to save settings", "error");
    }
  };

  // Build payload
  const getSelectedProductItems = (): BroadcastProductItem[] => {
    return selectedProductIds
      .map((id) => catalogProducts.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({
        id: p!.id,
        name: p!.name,
        price: p!.price,
        compareAtPrice: p!.compareAtPrice,
        image: p!.images?.[0] || p!.thumbnail || "https://www.glimglee.com/icon.png",
        slug: p!.slug,
      }));
  };

  const getCouponDiscountText = () => {
    const found = activeCoupons.find((c) => c.code === selectedCouponCode);
    if (!found) return "";
    return found.discountType === "percentage"
      ? `Get ${found.discountValue}% instant savings on orders above ₹${found.minOrderValue}!`
      : `Get Flat ₹${found.discountValue} off on your order above ₹${found.minOrderValue}!`;
  };

  // Send Test Email
  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast("Please enter a valid recipient email for the test", "error");
      return;
    }

    setSendingTest(true);
    try {
      const res = await postBroadcast({
        action: "send_test",
        gmailUser,
        gmailAppPassword,
        gmailSenderName,
        testEmail,
        subject,
        preheader,
        badge,
        heading,
        bodyText,
        heroImageUrl,
        featuredProducts: getSelectedProductItems(),
        promoCouponCode: selectedCouponCode,
        couponDiscountText: getCouponDiscountText(),
        ctaText,
        ctaLink,
      });

      if (res.success) {
        toast(`Test email delivered to ${testEmail}! Check your inbox.`, "success");
      }
    } catch (err: any) {
      toast(err?.message || "Failed to send test email", "error");
    } finally {
      setSendingTest(false);
    }
  };

  // Send Full Broadcast Blast
  const handleLaunchBroadcast = async () => {
    setSendingBroadcast(true);
    try {
      const res = await postBroadcast({
        action: "send_broadcast",
        gmailUser,
        gmailAppPassword,
        gmailSenderName,
        subject,
        preheader,
        badge,
        heading,
        bodyText,
        heroImageUrl,
        featuredProducts: getSelectedProductItems(),
        promoCouponCode: selectedCouponCode,
        couponDiscountText: getCouponDiscountText(),
        ctaText,
        ctaLink,
      });

      setShowConfirmModal(false);
      toast(res.message || "Broadcast finished!", "success");
      loadInitialData();
    } catch (err: any) {
      toast(err?.message || "Failed to execute broadcast", "error");
    } finally {
      setSendingBroadcast(false);
    }
  };

  const toggleProductSelection = (prodId: string) => {
    if (selectedProductIds.includes(prodId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== prodId));
    } else {
      if (selectedProductIds.length >= 4) {
        toast("Maximum 4 spotlight products can be embedded in an email", "info");
        return;
      }
      setSelectedProductIds([...selectedProductIds, prodId]);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            Customer Outreach & Newsletters
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            Email Broadcast & Marketing Campaigns
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Send announcements, festival offers, and new launches to your registered buyers and storefront customers in 1 click using Google App Password.
          </p>
        </div>

        <button
          onClick={() => setShowSmtpSettings(!showSmtpSettings)}
          className="px-4 py-2.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto"
        >
          <Key className="w-4 h-4 text-amber-600" />
          <span>Google App Password Setup</span>
          {showSmtpSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Target Audience</span>
            <p className="text-2xl font-black text-stone-900">{totalRecipients} Customers</p>
            <span className="text-[10px] text-stone-400">Unique registered users & storefront buyers</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">SMTP Sender Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${hasSavedPassword ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <p className="text-sm font-black text-stone-900">
                {hasSavedPassword ? "Configured & Active" : "Requires App Password"}
              </p>
            </div>
            <span className="text-[10px] text-stone-400 truncate block max-w-[200px]">{gmailUser || "smtp.gmail.com"}</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Campaigns Broadcasted</span>
            <p className="text-2xl font-black text-stone-900">{history.length}</p>
            <span className="text-[10px] text-stone-400">Logged in audit records</span>
          </div>
        </div>
      </div>

      {/* Smtp Configuration Drawer / Card */}
      {showSmtpSettings && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-black text-white shadow-xl space-y-5 border border-stone-800 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Key className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-white">Google App Password Credentials</h3>
              </div>
              <p className="text-xs text-stone-400 mt-1 max-w-xl">
                Glimglee uses standard Google App Passwords for 100% reliable inbox delivery without third-party email service subscriptions.
              </p>
            </div>

            <button
              onClick={() => setShowSmtpSettings(false)}
              className="text-stone-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-stone-300 font-bold mb-1">Sender Display Name</label>
              <input
                type="text"
                placeholder="Glimglee Gifting"
                value={gmailSenderName}
                onChange={(e) => setGmailSenderName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-bold mb-1">Gmail Address *</label>
              <input
                type="email"
                placeholder="yourstore@gmail.com"
                value={gmailUser}
                onChange={(e) => setGmailUser(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-bold mb-1">16-Character Google App Password *</label>
              <input
                type="password"
                placeholder={hasSavedPassword ? "•••• •••• •••• •••• (Saved)" : "abcd efgh ijkl mnop"}
                value={gmailAppPassword}
                onChange={(e) => setGmailAppPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-stone-800 text-xs">
            <div className="text-stone-400 space-y-0.5">
              <span className="font-bold text-stone-300 block">How to get a Google App Password?</span>
              <p className="text-[11px]">
                1. Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-amber-400 underline">Google Account Security</a> → 2-Step Verification.
                <br/>
                2. Search for <strong>App Passwords</strong> → Enter app name "Glimglee" → Copy the 16-character code.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Test SMTP Connection</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveSettings}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-md"
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Campaign Composer & Live Email Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Composer Form (7 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>Broadcast Content Composer</span>
            </h2>
            <span className="text-[10px] text-stone-400 font-semibold">Live Preview Updates Instantly</span>
          </div>

          {/* Subject & Preheader */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Subject Line *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Exclusive Festive Surprise from Glimglee"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Preview Preheader Snippet</label>
              <input
                type="text"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                placeholder="Text shown beside subject line in customer inbox"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-700 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Badge & Main Heading */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Badge Tag</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Festive Offer"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">Main Heading *</label>
              <input
                type="text"
                required
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 outline-none"
              />
            </div>
          </div>

          {/* Body Message */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Message Body *</label>
            <textarea
              rows={5}
              required
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 text-xs text-stone-800 leading-relaxed outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            <span className="text-[10px] text-stone-400 mt-1 block">Separate paragraphs with double enter for elegant formatting.</span>
          </div>

          {/* Embed Spotlight Products */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
                <span>Embed Products Spotlight ({selectedProductIds.length}/4)</span>
              </label>
              <span className="text-[10px] text-stone-400">Select up to 4 items</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1">
              {catalogProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProductSelection(p.id)}
                    className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-left text-xs ${
                      isSelected
                        ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-950 font-bold"
                        : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="line-clamp-2 text-[11px] leading-tight font-bold">{p.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />}
                    </div>
                    <span className="text-[10px] text-rose-600 font-extrabold mt-1">₹{p.price}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Embed Promo Coupon */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-rose-600" />
                <span>Embed Promo Voucher Coupon</span>
              </label>
              <span className="text-[10px] text-stone-400">Adds dashed voucher box to email</span>
            </div>

            <select
              value={selectedCouponCode}
              onChange={(e) => setSelectedCouponCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-900 outline-none"
            >
              <option value="">No Coupon Embedded</option>
              {activeCoupons.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} — {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`} (Min: ₹{c.minOrderValue})
                </option>
              ))}
            </select>
          </div>

          {/* CTA Button Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Button Text</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Shop Now"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Button Link URL</label>
              <input
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="/shop or /category/gifts"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 outline-none font-semibold"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Rendered Email Preview (5 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-4 lg:sticky lg:top-6">
          {/* Preview Controls Bar */}
          <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-stone-600" />
              <span>Real-Time Customer Preview</span>
            </span>

            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-lg transition-colors ${previewDevice === "desktop" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-lg transition-colors ${previewDevice === "mobile" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"}`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rendered Email Frame */}
          <div
            className={`mx-auto bg-stone-100 rounded-3xl p-3 border border-stone-200 transition-all ${
              previewDevice === "mobile" ? "max-w-[360px]" : "w-full"
            }`}
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-stone-200/60 text-stone-900 font-sans">
              {/* Brand Header */}
              <div className="bg-stone-950 text-white p-5 text-center">
                <div className="text-xl font-black tracking-widest">
                  GLIMGLEE<span className="text-rose-500">.</span>
                </div>
                <div className="text-[8px] font-bold text-amber-400 uppercase tracking-[0.25em] mt-0.5">
                  Modern Gifting & Bespoke Surprises
                </div>
              </div>

              {/* Main Body Preview */}
              <div className="p-5 sm:p-6 space-y-4">
                {badge && (
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-wider">
                      ★ {badge}
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-black text-stone-900 text-center leading-snug tracking-tight">
                  {heading || "Announcement Title"}
                </h3>

                <div className="text-xs text-stone-600 leading-relaxed whitespace-pre-line text-left">
                  {bodyText}
                </div>

                {/* Products Preview */}
                {selectedProductIds.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 text-center mb-2">
                      Spotlight Selection
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {getSelectedProductItems().map((p) => (
                        <div key={p.id} className="border border-stone-200 rounded-xl overflow-hidden text-center bg-stone-50/50 p-2">
                          <img src={p.image} alt={p.name} className="w-full h-20 object-cover rounded-lg mb-1.5" />
                          <p className="font-bold text-[11px] truncate text-stone-900">{p.name}</p>
                          <p className="text-rose-600 font-black text-xs mt-0.5">₹{p.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coupon Voucher Box */}
                {selectedCouponCode && (
                  <div className="p-3 rounded-xl bg-rose-50 border-2 border-dashed border-rose-300 text-center space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-rose-500 block">VIP Promo Voucher</span>
                    <span className="font-mono text-base font-black tracking-widest text-rose-900 block">
                      {selectedCouponCode}
                    </span>
                    <span className="text-[10px] text-rose-700 block font-medium">
                      {getCouponDiscountText()}
                    </span>
                  </div>
                )}

                {/* Primary CTA Button */}
                <div className="text-center pt-2">
                  <span className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30">
                    {ctaText} →
                  </span>
                </div>
              </div>

              {/* Trust bar & Footer */}
              <div className="bg-stone-50 border-t border-stone-100 p-2.5 text-center text-[9px] font-bold text-stone-500 flex justify-around">
                <span>✨ Handcrafted</span>
                <span>📦 Luxury Packaging</span>
                <span>🚀 Express Delivery</span>
              </div>
              <div className="bg-stone-950 p-4 text-center text-[9px] text-stone-400">
                <span className="font-bold text-white block text-[10px]">Glimglee Celebrations</span>
                <span>glimglee.com • support@glimglee.com</span>
              </div>
            </div>
          </div>

          {/* Test Email & Blast Controls */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3 text-xs">
            <span className="font-bold text-stone-900 block">Send Test Preview</span>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your.email@gmail.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs outline-none"
              />
              <button
                onClick={handleSendTest}
                disabled={sendingTest}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {sendingTest ? "Sending..." : "Send Test"}
              </button>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={totalRecipients === 0}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Launch Broadcast to All {totalRecipients} Customers</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden mt-8">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-stone-900">Campaign History & Delivery Logs</h3>
            <p className="text-xs text-stone-400">Past broadcast blasts sent to customer inboxes</p>
          </div>
          <span className="text-xs font-bold text-stone-600">{history.length} Campaigns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Heading</th>
                <th className="py-3 px-4">Recipients</th>
                <th className="py-3 px-4">Delivered</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {history.map((h) => (
                <tr key={h.id || h._id} className="hover:bg-stone-50/70">
                  <td className="py-3.5 px-4 font-bold text-stone-900">{h.subject}</td>
                  <td className="py-3.5 px-4 text-stone-600 truncate max-w-xs">{h.heading}</td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">{h.recipientCount || 0}</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">{h.successCount || 0}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${h.status === "sent" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-700"}`}>
                      {h.status || "Completed"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-400">
                    {h.sentAt ? new Date(h.sentAt).toLocaleDateString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400 text-xs">
                    No past broadcasts logged yet. Your first sent campaign will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM BROADCAST BLAST MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowConfirmModal(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-stone-900">Confirm Customer Broadcast</h3>
              <p className="text-xs text-stone-500">
                You are about to send this structured HTML newsletter to <strong>{totalRecipients} customer email addresses</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-400">Subject:</span>
                <span className="font-bold text-stone-800 truncate max-w-[200px]">{subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Sender:</span>
                <span className="font-bold text-stone-800 truncate max-w-[200px]">{gmailSenderName} ({gmailUser})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Products Spotlight:</span>
                <span className="font-bold text-stone-800">{selectedProductIds.length} Products</span>
              </div>
              {selectedCouponCode && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Promo Voucher:</span>
                  <span className="font-mono font-bold text-rose-600">{selectedCouponCode}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={sendingBroadcast}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 font-bold text-xs text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchBroadcast}
                disabled={sendingBroadcast}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30"
              >
                {sendingBroadcast ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending in Batch...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Send Blast</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
