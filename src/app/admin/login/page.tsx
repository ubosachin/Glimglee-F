"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user, isAdmin, isManager } = useAuth();

  const [devEmail, setDevEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyAdmin = isAdmin;

  const handleGoogleSuccess = () => {
    // Check if the newly signed in user is an admin
    const stored = typeof window !== "undefined" ? localStorage.getItem("glimglee_auth_user") : null;
    const parsed = stored ? JSON.parse(stored) : null;
    if (parsed?.role === "ADMIN" || parsed?.role === "SUPER_ADMIN") {
      router.push("/admin/dashboard");
    } else {
      setError(`Access Denied: Account (${parsed?.email || "user"}) does not have ADMIN role in database.`);
    }
  };

  const handleDevEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ok = await login(devEmail, "admin-pass");
      if (ok) {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1917] text-stone-200 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-white">GLIMGLEE</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mb-1" />
          </div>
          <span className="text-[10px] tracking-widest font-mono text-stone-400 uppercase ml-2 border-l border-stone-700 pl-3">
            Internal Operations Portal
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs text-stone-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>Customer Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-12 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin & Ops Login</h1>
          <p className="text-xs text-stone-400">
            Sign in with your authorized Google Cloud Admin account to access catalog, orders & analytics.
          </p>
        </div>

        {alreadyAdmin && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Signed in as <strong>{user?.displayName}</strong> ({user?.role})</span>
            </div>
            <Link
              href="/admin/dashboard"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Open Suite →
            </Link>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <GoogleSignInButton
            text="continue_with"
            size="large"
            theme="filled_black"
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
          />
        </div>

        <div className="relative flex items-center justify-center pt-2">
          <div className="border-t border-stone-800 w-full" />
          <span className="bg-stone-900 px-2 text-[10px] uppercase font-bold text-stone-500 absolute">
            or quick admin access
          </span>
        </div>

        {/* Quick admin email login fallback */}
        <form onSubmit={handleDevEmailLogin} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-stone-400 block mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                placeholder="admin@glimglee.com"
                className="w-full bg-stone-950 border border-stone-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500 text-xs placeholder-stone-600"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <span>{loading ? "Verifying..." : "Continue as Admin"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-[11px] text-stone-600 pt-6 border-t border-stone-900">
        <p>© {new Date().getFullYear()} Glimglee Technologies Pvt. Ltd. Authenticated via Google Cloud OAuth.</p>
      </footer>
    </div>
  );
}
