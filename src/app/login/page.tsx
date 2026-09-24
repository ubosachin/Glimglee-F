"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Star,
  Package,
  Heart,
  Mail,
  Lock,
  ExternalLink,
  Crown,
  LogOut,
  User,
  Gift,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, logout, isAdmin, isManager } = useAuth();
  const { toast } = useToast();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const handleSuccess = () => {
    toast("Welcome back to Glimglee!", "success");
    const stored = typeof window !== "undefined" ? localStorage.getItem("glimglee_auth_user") : null;
    const parsed = stored ? JSON.parse(stored) : null;
    if (parsed?.role === "ADMIN" || parsed?.role === "SUPER_ADMIN" || parsed?.role === "MANAGER") {
      router.push("/admin/dashboard");
    } else {
      router.push("/account");
    }
  };

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    toast(msg, "error");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setErrorMsg(null);
    setEmailLoading(true);
    try {
      const ok = await login(emailInput, "otp_passwordless");
      if (ok) {
        toast(`Signed in as ${emailInput}`, "success");
        const clean = emailInput.toLowerCase().trim();
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@glimglee.com")
          .toLowerCase();
        if (clean.includes("admin") || adminEmails.includes(clean)) {
          router.push("/admin/dashboard");
        } else {
          router.push("/account");
        }
      } else {
        setErrorMsg("Failed to sign in. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Sign in failed.");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col lg:flex-row relative selection:bg-rose-500 selection:text-white">
      {/* ============================================================ */}
      {/* LEFT COLUMN: BRAND STORY & LUXURY EDITORIAL (Desktop 52%)     */}
      {/* ============================================================ */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[52%] bg-[#121016] text-white flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-rose-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Delicate Star Dot Pattern */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-white group-hover:text-rose-400 transition-colors">
                GLIMGLEE
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block mb-1 shadow-sm shadow-rose-500/50" />
            </div>
            <span className="text-[10px] tracking-[0.25em] font-bold text-stone-400 uppercase ml-2 border-l border-white/10 pl-3">
              Modern Gifting
            </span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-stone-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curated Luxury Gifting</span>
          </span>
        </div>

        {/* Central Showcase Card */}
        <div className="relative z-10 my-auto py-8">
          {/* Framed Image Card with Luxury Glass Effect */}
          <div className="relative mx-auto max-w-[460px] group">
            <div className="relative aspect-[4/4.5] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-stone-900">
              <Image
                src="/images/login-hero.jpg"
                alt="Glimglee Artisanal Gift Hamper"
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1200px) 50vw, 460px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Top Floating Badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium shadow-lg">
                  <Gift className="w-3.5 h-3.5 text-rose-400" />
                  <span>Signature Keepsake Box</span>
                </span>
              </div>

              {/* Bottom Card Copy */}
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="flex items-center gap-1 text-amber-400 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[11px] font-bold text-white ml-1.5">
                    4.9 / 5.0 (50,000+ Gifts Delivered)
                  </span>
                </div>
                <p className="text-sm font-semibold text-stone-100">
                  &ldquo;Glimglee turned our celebration into an unforgettable memory.&rdquo;
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  — Verified Member, Bangalore
                </p>
              </div>
            </div>

            {/* Floating Luxury Ribbon Pill (Bottom Right Offset) */}
            <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-md text-stone-900 px-4 py-2.5 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-tight text-stone-900">
                  Bespoke Crafting
                </p>
                <p className="text-[10px] text-stone-500">Laser-engraved & hand-packed</p>
              </div>
            </div>
          </div>

          {/* Headline & Mission */}
          <div className="mt-8 text-center max-w-[480px] mx-auto">
            <h2 className="text-2xl xl:text-3xl font-black tracking-tight text-white">
              The Art of Thoughtful Gifting
            </h2>
            <p className="text-xs xl:text-sm text-stone-300 mt-2.5 leading-relaxed">
              Personalized memories, curated keepsakes, and timeless gifts delivered with pan-India express dispatch.
            </p>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-200">100% Artisanal</p>
            <p className="text-[11px] text-stone-400">Laser-engraved precision</p>
          </div>
          <div className="space-y-1 border-x border-white/10 px-2">
            <p className="text-xs font-bold text-stone-200">Pan-India Express</p>
            <p className="text-[11px] text-stone-400">Insured 24-48h dispatch</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-200">Delight Promise</p>
            <p className="text-[11px] text-stone-400">Zero-hassle replacement</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN: AUTHENTICATION PORTAL (Desktop 48-50%)         */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative">
        {/* Top Header / Back Navigation */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Boutique</span>
          </Link>

          {/* Mobile Logo Only */}
          <div className="lg:hidden flex items-center gap-1">
            <span className="text-lg font-black tracking-tight text-stone-900">GLIMGLEE</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mb-1" />
          </div>

          <span className="text-[11px] font-medium text-stone-400 hidden sm:inline-block">
            Secure Member Portal
          </span>
        </div>

        {/* Central Sign-In Container */}
        <div className="my-auto py-8 sm:py-12 w-full max-w-md mx-auto">
          {/* Main Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-stone-200/90 rounded-3xl p-7 sm:p-10 shadow-[0_20px_60px_-15px_rgba(28,25,23,0.07)] space-y-6">
            {/* Header Text */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[11px] font-bold text-rose-600 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-CLICK INSTANT ACCESS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Welcome to Glimglee
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                Sign in to track personalized orders, access saved gift registries, and claim member privileges.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {/* User Session Condition */}
            {user ? (
              /* ALREADY LOGGED IN PASSPORT */
              <div className="space-y-5 pt-2">
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white font-black text-lg flex items-center justify-center shadow-md shadow-rose-500/20">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-stone-900 truncate">
                          {user.displayName || "Valued Member"}
                        </p>
                        {isAdmin || isManager ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase tracking-wider">
                            <Crown className="w-3 h-3" />
                            <span>{user.role}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Member</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <div className="border-t border-stone-200/80 pt-3 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Authentication Method</span>
                    <span className="font-semibold text-stone-800">Google Cloud Identity</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2.5">
                  <Link
                    href="/account"
                    className="w-full h-12 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-stone-900/10 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Go to My Account</span>
                  </Link>

                  {(isAdmin || isManager) && (
                    <Link
                      href="/admin/dashboard"
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Open Admin Suite & Operations</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      toast("Signed out successfully", "info");
                    }}
                    className="w-full h-11 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* NOT LOGGED IN AUTH EXPERIENCE */
              <div className="space-y-6 pt-2">
                {/* Google One-Click Button */}
                <div className="space-y-2">
                  <GoogleSignInButton
                    text="continue_with"
                    size="large"
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                  <p className="text-[11px] text-center text-stone-400">
                    Fast & passwordless. No need to memorize passwords.
                  </p>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-stone-200 w-full" />
                  <span className="bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-stone-400 absolute">
                    or continue with email
                  </span>
                </div>

                {/* Optional Email Fast Access Form */}
                {!showEmailLogin ? (
                  <button
                    type="button"
                    onClick={() => setShowEmailLogin(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-dashed border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50 text-stone-600 hover:text-stone-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>Use Email Sign In / Instant Demo</span>
                  </button>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Your Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="e.g. name@example.com or admin@glimglee.com"
                          className="w-full bg-stone-50/80 border border-stone-200 focus:border-rose-500 focus:bg-white text-stone-900 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none transition-all placeholder:text-stone-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={emailLoading}
                      className="w-full h-11 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <span>{emailLoading ? "Signing in..." : "Continue with Email"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={() => setEmailInput("admin@glimglee.com")}
                        className="text-rose-600 hover:text-rose-700 font-medium hover:underline cursor-pointer"
                      >
                        ⚡ Fill Admin Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailLogin(false)}
                        className="text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Member Privileges Highlights */}
                <div className="pt-2 border-t border-stone-100 space-y-2.5">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-stone-400 text-center">
                    Member Privileges Included
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <Package className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-stone-700">Track Gifts</p>
                      <p className="text-[9px] text-stone-400">Live courier ETA</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-stone-700">Wishlists</p>
                      <p className="text-[9px] text-stone-400">Secret registries</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <Sparkles className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-stone-700">VIP Perks</p>
                      <p className="text-[9px] text-stone-400">Early collection drops</p>
                    </div>
                  </div>
                </div>

                {/* Google Cloud Security Guarantee */}
                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Google Cloud 256-Bit SSL Protection • Zero Spam</span>
                </div>
              </div>
            )}
          </div>

          {/* Legal / Concierge Footer */}
          <div className="mt-6 text-center space-y-2 text-[11px] text-stone-400">
            <p>
              By proceeding, you agree to Glimglee&apos;s{" "}
              <Link href="/terms" className="text-stone-600 hover:text-stone-900 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-stone-600 hover:text-stone-900 underline">
                Privacy Policy
              </Link>
              .
            </p>
            <p className="text-stone-400">
              Need assistance?{" "}
              <Link href="/contact" className="text-rose-600 font-semibold hover:underline">
                Contact our Gifting Concierge
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="text-center text-[11px] text-stone-400 pt-4">
          © {new Date().getFullYear()} Glimglee Technologies Pvt. Ltd. All rights reserved.
        </div>
      </div>
    </div>
  );
}
