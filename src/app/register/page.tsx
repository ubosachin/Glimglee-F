"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSuccess = () => {
    toast("Welcome to Glimglee! Your account is ready.", "success");
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
        <h2 className="mt-4 text-xl font-bold text-stone-900">Create your Glimglee account</h2>
        <p className="text-xs text-stone-500 mt-1">
          Enjoy bespoke gift personalization, express tracking, and celebratory perks.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-stone-200/80 rounded-3xl sm:px-10 space-y-6">
          {user ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-bold">You are already registered & signed in</p>
                <p className="text-stone-600 mt-0.5">{user.email}</p>
              </div>
              <Link
                href="/account"
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs text-center"
              >
                Go to My Account
              </Link>
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
                  text="signup_with"
                  size="large"
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </div>

              <div className="pt-2 text-center">
                <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Instant 1-Click Google Sign Up</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Instant registration with your verified Google profile. No lengthy forms or email confirmations.
                </p>
              </div>
            </>
          )}

          <div className="border-t border-stone-100 pt-4 text-center">
            <p className="text-xs text-stone-500">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-rose-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
