"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Heart,
  Sparkles,
} from "lucide-react";

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.displayName || "Priya Sharma",
    email: user?.email || "priya.sharma@example.com",
    phone: "+91 98765 43210",
    birthday: "1995-08-14",
    anniversary: "2021-11-22",
    partnerName: "Rohan Sharma",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setPasswordSuccess(true);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-xs text-stone-500">
        <Link href="/account" className="hover:text-rose-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Personal Profile</span>
      </div>

      <div className="border-b border-stone-200/80 pb-6">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-rose-600" />
          <span>Personal Profile & Reminders</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage your personal information and set celebratory anniversary & birthday reminders for automatic gift curation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Account Details Form */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span>Contact & Gifting Details</span>
            </h3>

            {savedSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Your profile details and gifting dates have been updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Mobile Number (For WhatsApp Updates)</label>
                  <input
                    type="tel"
                    required
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              {/* Special Occasion Reminders */}
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <div className="flex items-center gap-2 text-rose-700 font-bold">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>Celebration Reminders (Never Miss a Date)</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  We'll send you curated gift recommendations and bespoke discounts 7 days before your special occasions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Your Birthday</label>
                    <input
                      type="date"
                      value={profile.birthday}
                      onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Relationship Anniversary</label>
                    <input
                      type="date"
                      value={profile.anniversary}
                      onChange={(e) => setProfile({ ...profile, anniversary: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Partner's / Loved One's Name</label>
                  <input
                    type="text"
                    value={profile.partnerName}
                    onChange={(e) => setProfile({ ...profile, partnerName: e.target.value })}
                    placeholder="e.g. Rohan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-stone-500" />
              <span>Security & Password</span>
            </h3>

            {passwordSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Password updated successfully!</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 font-bold transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Perks & Club Tier */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-rose-900 to-stone-900 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-rose-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Membership Tier</span>
              <h4 className="text-xl font-black mt-0.5">Glimglee Gold Club</h4>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              As a Gold Club member, you enjoy complimentary handwritten gift cards, free express dispatch on orders above ₹999, and VIP festive preview sales.
            </p>
            <div className="pt-2 border-t border-white/10 text-xs flex justify-between font-mono">
              <span className="text-stone-400">Reward Points:</span>
              <span className="font-bold text-amber-300">450 GlowPoints (₹450 value)</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-4 text-xs">
            <h4 className="font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Account Security & Privacy</span>
            </h4>
            <p className="text-stone-500 leading-relaxed">
              Your uploaded photos and personalized messages are stored with end-to-end encryption and are only accessible by master artisans during manufacturing.
            </p>
            <Link
              href="/privacy-policy"
              className="inline-block text-rose-600 font-bold hover:underline"
            >
              Read our Photo Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
