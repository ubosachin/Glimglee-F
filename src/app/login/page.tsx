"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSuccess = () => {
    toast("Welcome to Glimglee!", "success");
    router.push("/account");
  };

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    toast(msg, "error");
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-3xl font-black tracking-tight text-stone-900">GLIMGLEE</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block mb-2" />
          </div>
          <span className="text-[10px] tracking-[0.25em] font-bold text-stone-400 uppercase -mt-1">
            Modern Gifting
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold text-stone-900">Sign in to your account</h2>
        <p className="text-xs text-stone-500 mt-1">
          Fast, passwordless sign-in with your Google account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-stone-200/80 rounded-3xl sm:px-10 space-y-6">
          {user ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-bold">You are already signed in</p>
                <p className="text-stone-600 mt-0.5">{user.email}</p>
              </div>
              <div className="flex gap-2 w-full pt-2">
                <Link
                  href="/account"
                  className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs text-center"
                >
                  My Account
                </Link>
                {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                  <Link
                    href="/admin/dashboard"
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs text-center"
                  >
                    Admin Suite
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                <GoogleSignInButton
                  text="continue_with"
                  size="large"
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </div>

              <div className="pt-2 text-center">
                <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Secured via Google Cloud Identity</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  No passwords to remember. One-click authentication with 100% data protection.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
