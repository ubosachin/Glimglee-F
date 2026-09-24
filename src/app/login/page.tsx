"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { ArrowLeft, ShieldCheck, CheckCircle2, User, LogOut, ExternalLink } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, logout, isAdmin, isManager } = useAuth();
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSuccess = () => {
    toast("Welcome back!", "success");
    const stored = typeof window !== "undefined" ? localStorage.getItem("glimglee_auth_user") : null;
    const parsed = stored ? JSON.parse(stored) : null;
    if (parsed?.role === "ADMIN" || parsed?.role === "SUPER_ADMIN") {
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
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-stone-900 flex flex-col justify-between px-4 sm:px-6 py-6 sm:py-10 selection:bg-rose-500 selection:text-white">
      {/* Top Header / Back Link */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to store</span>
        </Link>

        <span className="text-[11px] text-stone-400 font-medium">Glimglee Account</span>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white border border-stone-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.04)] space-y-6">
          {/* Brand Logo & Title */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex flex-col items-center group">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
                  GLIMGLEE
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block mb-1" />
              </div>
              <span className="text-[9px] tracking-[0.25em] font-bold text-stone-400 uppercase -mt-0.5">
                Modern Gifting
              </span>
            </Link>

            <div className="pt-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                Sign in to your account
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Access your orders, personalized gifts, and saved wishlist.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
              {errorMsg}
            </div>
          )}

          {/* Authentication State */}
          {user ? (
            /* Logged In State */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-900 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-stone-900 truncate">
                      {user.displayName || "Member"}
                    </p>
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/account"
                  className="w-full h-11 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Go to My Account</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Open Admin Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    toast("Signed out successfully", "info");
                  }}
                  className="w-full h-10 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Sign In Button */
            <div className="space-y-4">
              <GoogleSignInButton
                text="continue_with"
                size="large"
                onSuccess={handleSuccess}
                onError={handleError}
              />

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Secured via Google Cloud Identity</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center space-y-2 text-[11px] text-stone-400">
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy-policy" className="hover:text-stone-600 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-stone-600 transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-stone-600 transition-colors">
            Contact Support
          </Link>
        </div>
        <p>© {new Date().getFullYear()} Glimglee Modern Gifting</p>
      </footer>
    </div>
  );
}
