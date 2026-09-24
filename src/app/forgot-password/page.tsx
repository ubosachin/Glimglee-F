"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSent(true);
    }
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
        <h2 className="mt-4 text-xl font-bold text-stone-900">Reset your password</h2>
        <p className="text-xs text-stone-500 mt-1">
          Enter your registered email to receive a password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-stone-200/80 rounded-3xl sm:px-10 space-y-4">
          {sent ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-stone-900">Reset Link Sent</h3>
              <p className="text-xs text-stone-500">
                Check your inbox at <strong>{email}</strong> for instructions to reset your password.
              </p>
              <Link
                href="/login"
                className="inline-block mt-3 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
              >
                Send Password Reset Link
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
