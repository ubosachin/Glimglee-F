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
  Star,
  Package,
  Heart,
  Crown,
  LogOut,
  User,
  Gift,
  Lock,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, logout, isAdmin, isManager } = useAuth();
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between relative selection:bg-rose-500 selection:text-white overflow-hidden">
      {/* Soft Ambient Radial Accents (Light Theme) */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-rose-100/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 pb-2 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Boutique</span>
        </Link>

        <Link href="/" className="inline-flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black tracking-tight text-stone-900">GLIMGLEE</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block mb-1 shadow-xs shadow-rose-500/50" />
          </div>
          <span className="text-[9px] tracking-[0.28em] font-bold text-stone-400 uppercase -mt-1">
            Modern Gifting
          </span>
        </Link>

        <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-500 bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-full border border-stone-200/80">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>256-Bit SSL Secured</span>
        </div>
      </header>

      {/* Centerpiece Main Card (Light Luxury Aesthetic) */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 my-auto py-8 sm:py-12 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl border border-stone-200/90 rounded-[2.25rem] shadow-[0_25px_70px_-20px_rgba(28,25,23,0.07),0_10px_30px_-10px_rgba(225,29,72,0.03)] overflow-hidden grid lg:grid-cols-12">
          
          {/* Left Visual Column (Light Theme Editorial) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#F7F4EE] via-[#FAF8F5] to-[#FFF5F5] p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-stone-700 border border-stone-200 text-[11px] font-semibold mb-4 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Curated Luxury Gifting</span>
              </div>

              {/* Framed Keepsake Showcase */}
              <div className="relative aspect-[4/3.8] rounded-2xl overflow-hidden shadow-lg border border-white bg-stone-100 group">
                <Image
                  src="/images/login-hero.jpg"
                  alt="Glimglee Bespoke Keepsake Box"
                  fill
                  priority
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Floating Top Pill */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-stone-900 text-[10px] font-bold shadow-md">
                    <Gift className="w-3 h-3 text-rose-500" />
                    <span>Signature Keepsake Box</span>
                  </span>
                </div>

                {/* Rating on Image */}
                <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-300">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-300 text-amber-300" />
                    ))}
                    <span className="text-[11px] font-bold text-white ml-1">4.9 / 5.0</span>
                  </div>
                  <span className="text-[10px] text-stone-200">50,000+ Deliveries</span>
                </div>
              </div>

              {/* Editorial Quote */}
              <div className="mt-5 space-y-1.5">
                <p className="text-xs font-semibold text-stone-700 italic">
                  &ldquo;The unboxing was pure joy. Glimglee turns ordinary gifts into treasured moments.&rdquo;
                </p>
                <p className="text-[10px] text-stone-400 font-medium">
                  — Priya & Aarav, Verified Members
                </p>
              </div>
            </div>

            {/* Micro Feature Pills */}
            <div className="pt-6 mt-6 border-t border-stone-200/80 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[11px] font-bold text-stone-800">100% Artisanal</p>
                <p className="text-[9px] text-stone-500">Handcrafted</p>
              </div>
              <div className="border-x border-stone-200/80 px-1">
                <p className="text-[11px] font-bold text-stone-800">Pan-India</p>
                <p className="text-[9px] text-stone-500">Express Delivery</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-800">Happiness</p>
                <p className="text-[9px] text-stone-500">Guaranteed</p>
              </div>
            </div>
          </div>

          {/* Right Authentication Column (Pure Light Theme) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-7">
            
            {/* Header */}
            <div className="text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[11px] font-bold text-rose-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SECURE MEMBER ACCESS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Sign in to Glimglee
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                Experience fast, passwordless access to your personalized orders, gift wishlists, and bespoke member privileges.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {/* Authentication Experience */}
            {user ? (
              /* LOGGED IN MEMBER PASSPORT (Light Theme) */
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white font-black text-lg flex items-center justify-center shadow-md shadow-rose-500/15">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-stone-900 truncate">
                          {user.displayName || "Valued Member"}
                        </p>
                        {isAdmin || isManager ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase tracking-wider">
                            <Crown className="w-3 h-3" />
                            <span>{user.role}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Member</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <div className="border-t border-stone-200/80 pt-3 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Account Security</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Google Cloud Verified
                    </span>
                  </div>
                </div>

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
              /* GOOGLE 1-CLICK AUTHENTICATION */
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="p-1 rounded-2xl border border-stone-200/80 bg-stone-50/50 shadow-inner">
                    <GoogleSignInButton
                      text="continue_with"
                      size="large"
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>100% Secure via Google Cloud Identity • No Passwords Needed</span>
                  </div>
                </div>

                {/* Member Privileges Light Cards */}
                <div className="pt-4 border-t border-stone-100 space-y-3">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-stone-400">
                    Included with your membership
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/70 hover:border-rose-200 transition-colors">
                      <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1.5">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[11px] font-bold text-stone-800">Track Orders</p>
                      <p className="text-[9px] text-stone-400 mt-0.5">Real-time status</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/70 hover:border-rose-200 transition-colors">
                      <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1.5">
                        <Heart className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[11px] font-bold text-stone-800">Wishlists</p>
                      <p className="text-[9px] text-stone-400 mt-0.5">Save favorites</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/70 hover:border-rose-200 transition-colors">
                      <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[11px] font-bold text-stone-800">VIP Perks</p>
                      <p className="text-[9px] text-stone-400 mt-0.5">Special pricing</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Privacy */}
            <div className="pt-2 text-center text-[11px] text-stone-400 space-y-1">
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
              <p>
                Need assistance?{" "}
                <Link href="/contact" className="text-rose-600 font-semibold hover:underline">
                  Contact Concierge Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-5 text-center text-[11px] text-stone-400 relative z-10">
        © {new Date().getFullYear()} Glimglee Technologies Pvt. Ltd. All rights reserved.
      </footer>
    </div>
  );
}
