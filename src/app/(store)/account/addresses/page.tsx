"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  MapPin,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Home,
  Briefcase,
  Phone,
  Sparkles,
} from "lucide-react";

interface SavedAddress {
  id: string;
  tag: "Home" | "Work" | "Other";
  fullName: string;
  phone: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: "addr_1",
    tag: "Home",
    fullName: "Priya Sharma",
    phone: "+91 98765 43210",
    addressLine: "Flat 402, Royal Palms Residency, 14th Cross, Indiranagar",
    landmark: "Near Defense Colony Park",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    isDefault: true,
  },
  {
    id: "addr_2",
    tag: "Work",
    fullName: "Priya Sharma (Office)",
    phone: "+91 98765 43210",
    addressLine: "Building 3B, EcoWorld Business Park, Outer Ring Road, Bellandur",
    landmark: "Tower 3, 5th Floor",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
    isDefault: false,
  },
];

export default function CustomerAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<SavedAddress, "id">>({
    tag: "Home",
    fullName: "",
    phone: "",
    addressLine: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("glimglee_user_addresses");
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch {
        setAddresses(DEFAULT_ADDRESSES);
      }
    } else {
      setAddresses(DEFAULT_ADDRESSES);
      localStorage.setItem("glimglee_user_addresses", JSON.stringify(DEFAULT_ADDRESSES));
    }
  }, []);

  const saveToStorage = (updated: SavedAddress[]) => {
    setAddresses(updated);
    localStorage.setItem("glimglee_user_addresses", JSON.stringify(updated));
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveToStorage(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this saved address?")) {
      const updated = addresses.filter((a) => a.id !== id);
      saveToStorage(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updated = addresses.map((a) =>
        a.id === editingId ? { ...formData, id: editingId } : formData.isDefault ? { ...a, isDefault: false } : a
      );
      saveToStorage(updated);
    } else {
      const newAddress: SavedAddress = {
        ...formData,
        id: "addr_" + Date.now(),
      };
      const updated = formData.isDefault
        ? addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddress)
        : [...addresses, newAddress];
      saveToStorage(updated);
    }
    setShowAddModal(false);
    setEditingId(null);
  };

  const openEditModal = (addr: SavedAddress) => {
    setEditingId(addr.id);
    setFormData({
      tag: addr.tag,
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine: addr.addressLine,
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setShowAddModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-xs text-stone-500">
        <Link href="/account" className="hover:text-rose-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Saved Addresses</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-rose-600" />
            <span>Delivery Addresses</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your home, office, and loved ones' addresses for seamless 1-click gift delivery.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              tag: "Home",
              fullName: user?.displayName || "",
              phone: "",
              addressLine: "",
              landmark: "",
              city: "",
              state: "",
              pincode: "",
              isDefault: addresses.length === 0,
            });
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-6 rounded-3xl bg-white border transition-all ${
              addr.isDefault
                ? "border-rose-400 ring-2 ring-rose-100 shadow-md"
                : "border-stone-200/90 shadow-sm hover:border-stone-300"
            } flex flex-col justify-between space-y-4`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold">
                  {addr.tag === "Home" && <Home className="w-3.5 h-3.5 text-stone-500" />}
                  {addr.tag === "Work" && <Briefcase className="w-3.5 h-3.5 text-stone-500" />}
                  {addr.tag === "Other" && <MapPin className="w-3.5 h-3.5 text-stone-500" />}
                  <span>{addr.tag}</span>
                </span>

                {addr.isDefault ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Default Address
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11px] font-semibold text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    Set as Default
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-stone-900">{addr.fullName}</h4>
                <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3 text-stone-400" />
                  <span>{addr.phone}</span>
                </p>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {addr.addressLine}
                {addr.landmark && <span className="block text-stone-400 text-[11px]">Landmark: {addr.landmark}</span>}
                <span className="block font-medium text-stone-800 mt-1">
                  {addr.city}, {addr.state} — {addr.pincode}
                </span>
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <button
                onClick={() => openEditModal(addr)}
                className="font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDelete(addr.id)}
                className="font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-black text-stone-900">
              {editingId ? "Edit Delivery Address" : "Add New Delivery Address"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                {(["Home", "Work", "Other"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, tag: t })}
                    className={`py-2 rounded-xl font-bold border text-center transition-colors ${
                      formData.tag === t
                        ? "bg-rose-50 border-rose-300 text-rose-700"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Phone Number (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Flat / House No. & Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="e.g. Flat 402, Royal Palms, 14th Cross"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Bengaluru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Pincode (6 digits) *</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="560038"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Karnataka"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="Near Park / Metro Station"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-stone-700">Make this my default shipping address</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
