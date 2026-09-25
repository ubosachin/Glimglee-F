"use client";

import React, { useState, useEffect } from "react";
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUserProfile,
  deleteAdminUser,
} from "@/lib/services/adminUsers";
import { UserProfile, UserRole, ShippingAddress } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import {
  Users,
  ShieldCheck,
  UserCheck,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Crown,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Check,
  ArrowUpDown,
  Lock,
} from "lucide-react";

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "ADMIN" | "CUSTOMER">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create User Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState<{
    email: string;
    displayName: string;
    phoneNumber: string;
    role: UserRole;
    status: "active" | "disabled";
    notes: string;
  }>({
    email: "",
    displayName: "",
    phoneNumber: "",
    role: "CUSTOMER",
    status: "active",
    notes: "",
  });

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    const data = await getAdminUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Quick 1-click Role Toggle
  const handleQuickToggleRole = async (targetUser: UserProfile) => {
    const newRole: UserRole = targetUser.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    const confirmMsg =
      newRole === "ADMIN"
        ? `Are you sure you want to promote "${targetUser.displayName || targetUser.email}" to ADMINISTRATOR? They will have full access to orders, products, and store settings.`
        : `Demote "${targetUser.displayName || targetUser.email}" to CUSTOMER? They will lose access to the Admin panel.`;

    if (!confirm(confirmMsg)) return;

    const res = await updateAdminUserProfile({
      uid: targetUser.uid,
      email: targetUser.email,
      role: newRole,
    });

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.email === targetUser.email ? { ...u, role: newRole } : u))
      );
      toast(`User role updated to ${newRole}!`, "success");
    } else {
      toast(res.error || "Failed to update role", "error");
    }
  };

  // Delete User
  const handleDelete = async (targetUser: UserProfile) => {
    if (targetUser.email.toLowerCase() === currentAdmin?.email.toLowerCase()) {
      toast("You cannot delete your own admin account!", "error");
      return;
    }

    if (!confirm(`Are you sure you want to remove user "${targetUser.displayName || targetUser.email}"?`)) {
      return;
    }

    const res = await deleteAdminUser(targetUser.email, targetUser.uid);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.email !== targetUser.email));
      toast(`User removed successfully.`, "info");
    } else {
      toast(res.error || "Failed to delete user", "error");
    }
  };

  // Save Edit Profile
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    const res = await updateAdminUserProfile(editingUser);
    setSaving(false);

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.email === editingUser.email ? { ...editingUser } : u))
      );
      setIsEditModalOpen(false);
      toast(`Profile for "${editingUser.displayName || editingUser.email}" updated!`, "success");
    } else {
      toast(res.error || "Failed to update user profile", "error");
    }
  };

  // Create User
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.email.trim()) {
      toast("Email is required", "error");
      return;
    }

    setSaving(true);
    const res = await createAdminUser(newUserData);
    setSaving(false);

    if (res.success && res.user) {
      setUsers((prev) => [res.user!, ...prev]);
      setIsCreateModalOpen(false);
      setNewUserData({
        email: "",
        displayName: "",
        phoneNumber: "",
        role: "CUSTOMER",
        status: "active",
        notes: "",
      });
      toast(`New user "${res.user.email}" registered successfully!`, "success");
    } else {
      toast(res.error || "Failed to create user", "error");
    }
  };

  // Address helpers in Edit Modal
  const handleAddressChange = (index: number, field: keyof ShippingAddress, val: string) => {
    if (!editingUser) return;
    const addresses = [...(editingUser.addresses || [])];
    if (!addresses[index]) return;
    addresses[index] = { ...addresses[index], [field]: val };
    setEditingUser({ ...editingUser, addresses });
  };

  const handleAddAddress = () => {
    if (!editingUser) return;
    const newAddr: ShippingAddress = {
      fullName: editingUser.displayName || "",
      phone: editingUser.phoneNumber || "",
      email: editingUser.email,
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
    };
    setEditingUser({
      ...editingUser,
      addresses: [...(editingUser.addresses || []), newAddr],
    });
  };

  const handleRemoveAddress = (index: number) => {
    if (!editingUser) return;
    const addresses = [...(editingUser.addresses || [])].filter((_, idx) => idx !== index);
    setEditingUser({ ...editingUser, addresses });
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phoneNumber || "").includes(search);

    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalCustomers = users.filter((u) => u.role !== "ADMIN").length;
  const activeUsers = users.filter((u) => u.status !== "disabled").length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Access Control & Customer Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            User Management & Role Permissions ({users.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Manage user accounts, assign <strong>ADMIN</strong> or <strong>CUSTOMER</strong> privileges, update contact details, and inspect buyer order history.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-stone-600" />
            <span>Total Accounts</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">{users.length}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>Administrators</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-900">{totalAdmins}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4 text-rose-600" />
            <span>Customers</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">{totalCustomers}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Active Status</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">{activeUsers}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone number..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                roleFilter === "all" ? "bg-stone-900 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => setRoleFilter("ADMIN")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                roleFilter === "ADMIN" ? "bg-amber-500 text-white shadow-xs" : "text-amber-700 hover:text-amber-900"
              }`}
            >
              <Crown className="w-3 h-3 fill-current" />
              <span>Admins</span>
            </button>
            <button
              onClick={() => setRoleFilter("CUSTOMER")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                roleFilter === "CUSTOMER" ? "bg-rose-600 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Customers
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>
      </div>

      {/* Users Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Loading Users & Access Directory...
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-stone-100">
                  <tr>
                    <th className="py-3.5 px-5">User</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">Role Access</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Orders & Lifetime Spend</th>
                    <th className="py-3.5 px-4">Registered Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.map((u) => {
                    const isAdmin = u.role === "ADMIN";
                    const isSelf = currentAdmin?.email.toLowerCase() === u.email.toLowerCase();

                    return (
                      <tr key={u.email} className="hover:bg-stone-50/70 transition-colors">
                        {/* User Name & Email */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                                isAdmin
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}
                            >
                              {u.displayName ? u.displayName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-stone-900 truncate block">
                                  {u.displayName || "Glimglee Customer"}
                                </span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600 text-[9px] font-extrabold border border-stone-200">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-400 truncate block">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4">
                          {u.phoneNumber ? (
                            <span className="font-mono text-stone-800 font-semibold">{u.phoneNumber}</span>
                          ) : (
                            <span className="text-stone-300 italic text-[11px]">Not provided</span>
                          )}
                        </td>

                        {/* Role Badge + 1-Click Toggle */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black tracking-wide">
                                <Crown className="w-3 h-3 fill-amber-500 text-amber-600" />
                                <span>ADMIN</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-bold">
                                <span>CUSTOMER</span>
                              </span>
                            )}

                            {!isSelf && (
                              <button
                                onClick={() => handleQuickToggleRole(u)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${
                                  isAdmin
                                    ? "text-stone-600 hover:text-stone-900 border-stone-200 hover:bg-stone-100"
                                    : "text-amber-800 hover:text-amber-950 border-amber-200 bg-amber-50/60 hover:bg-amber-100"
                                }`}
                                title={isAdmin ? "Demote to Customer" : "Promote to Admin"}
                              >
                                {isAdmin ? "Demote" : "Make Admin"}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.status === "disabled"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {u.status === "disabled" ? "Disabled" : "Active"}
                          </span>
                        </td>

                        {/* Orders & Spend */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-stone-900 block">
                              ₹{Number(u.totalSpend || 0).toLocaleString("en-IN")}
                            </span>
                            <span className="text-[11px] text-stone-400 block">
                              {u.totalOrders || 0} {u.totalOrders === 1 ? "order" : "orders"}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setIsEditModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-800 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                              title="Edit User Profile"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {!isSelf && (
                              <button
                                onClick={() => handleDelete(u)}
                                className="p-1.5 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards View */}
            <div className="lg:hidden divide-y divide-stone-100">
              {filteredUsers.map((u) => {
                const isAdmin = u.role === "ADMIN";
                const isSelf = currentAdmin?.email.toLowerCase() === u.email.toLowerCase();

                return (
                  <div key={u.email} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                            isAdmin
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {u.displayName ? u.displayName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-stone-900 text-xs truncate">
                              {u.displayName || "Glimglee Customer"}
                            </p>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600 text-[9px] font-extrabold border border-stone-200">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-400 truncate block">{u.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black">
                            <Crown className="w-3 h-3 fill-amber-500 text-amber-600" />
                            <span>ADMIN</span>
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-bold">
                            CUSTOMER
                          </span>
                        )}
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.status === "disabled" ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          title={u.status}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 text-stone-600">
                      <div>
                        <span className="font-bold text-stone-900">
                          ₹{Number(u.totalSpend || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-stone-400 text-[11px] ml-1">
                          ({u.totalOrders || 0} orders)
                        </span>
                      </div>
                      {u.phoneNumber && (
                        <span className="font-mono text-stone-700 text-[11px]">{u.phoneNumber}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setIsEditModalOpen(true);
                        }}
                        className="flex-1 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>

                      {!isSelf && (
                        <button
                          onClick={() => handleQuickToggleRole(u)}
                          className={`flex-1 py-1.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1 transition-colors ${
                            isAdmin
                              ? "border-stone-200 text-stone-700 bg-white"
                              : "border-amber-300 bg-amber-50 text-amber-900"
                          }`}
                        >
                          <Crown className="w-3 h-3" />
                          <span>{isAdmin ? "Demote" : "Make Admin"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-stone-500 space-y-2">
                <Users className="w-10 h-10 mx-auto text-stone-300 stroke-[1.5]" />
                <p className="text-sm font-bold text-stone-800">No users match your filter.</p>
                <p className="text-xs text-stone-400">Try adjusting your search query or role filter.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* EDIT USER PROFILE MODAL */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setIsEditModalOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-black">
                  {editingUser.displayName ? editingUser.displayName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Edit Profile: {editingUser.displayName || editingUser.email}
                  </h3>
                  <span className="text-[10px] text-stone-400">UID: {editingUser.uid}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
              {/* Role Assignment Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>Access Role Authorization *</span>
                  </label>
                  <span className="text-[10px] text-stone-400">Controls access to Admin suite</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser({ ...editingUser, role: "CUSTOMER" })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      editingUser.role === "CUSTOMER"
                        ? "bg-white border-rose-500 ring-2 ring-rose-500/20 text-rose-950 font-bold shadow-xs"
                        : "bg-white/60 border-stone-200 text-stone-700 hover:bg-white"
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs block font-bold">Standard Customer</span>
                      <span className="text-[10px] text-stone-500 font-normal">
                        Can place orders, manage cart, track delivery & reviews.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingUser({ ...editingUser, role: "ADMIN" })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      editingUser.role === "ADMIN"
                        ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 font-bold shadow-xs"
                        : "bg-white/60 border-stone-200 text-stone-700 hover:bg-white"
                    }`}
                  >
                    <Crown className="w-4 h-4 text-amber-600 fill-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs block font-bold text-amber-900">👑 Full Administrator</span>
                      <span className="text-[10px] text-stone-600 font-normal">
                        Full access to products, orders, coupons, users & store settings.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-400">
                  Profile Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editingUser.displayName || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Email Address (Primary)</label>
                    <input
                      type="email"
                      required
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={editingUser.phoneNumber || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 font-mono outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Account Status</label>
                    <select
                      value={editingUser.status || "active"}
                      onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="active">Active (Access Allowed)</option>
                      <option value="disabled">Disabled (Banned / Access Blocked)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Internal Admin Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. VIP corporate gifting customer, high priority delivery"
                    value={editingUser.notes || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Shipping Addresses Manager */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    <span>Customer Shipping Addresses ({editingUser.addresses?.length || 0})</span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition-colors"
                  >
                    + Add Address
                  </button>
                </div>

                {editingUser.addresses && editingUser.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {editingUser.addresses.map((addr, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-800 text-[11px]">Address #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddress(idx)}
                            className="text-rose-600 hover:text-rose-800 text-[10px] font-bold"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Address Line 1"
                            value={addr.addressLine1 || ""}
                            onChange={(e) => handleAddressChange(idx, "addressLine1", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Address Line 2 (Optional)"
                            value={addr.addressLine2 || ""}
                            onChange={(e) => handleAddressChange(idx, "addressLine2", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-none"
                          />
                          <input
                            type="text"
                            placeholder="City"
                            value={addr.city || ""}
                            onChange={(e) => handleAddressChange(idx, "city", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="State"
                              value={addr.state || ""}
                              onChange={(e) => handleAddressChange(idx, "state", e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Pincode"
                              value={addr.pincode || ""}
                              onChange={(e) => handleAddressChange(idx, "pincode", e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-mono outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-400 italic">No saved shipping addresses on file for this user.</p>
                )}
              </div>

              {/* Order Stats Overview */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-600 block">Purchase History</span>
                  <span className="font-extrabold text-stone-900">
                    {editingUser.totalOrders || 0} Orders placed • ₹{Number(editingUser.totalSpend || 0).toLocaleString("en-IN")} total spend
                  </span>
                </div>
                <span className="text-[10px] text-stone-400">Calculated across store orders</span>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-md shadow-rose-600/25 active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setIsCreateModalOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Add New User Account</h3>
                  <span className="text-[10px] text-stone-400">Register a customer or team administrator</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sachin@gmail.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none text-stone-900 font-semibold focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sachin Yadav"
                  value={newUserData.displayName}
                  onChange={(e) => setNewUserData({ ...newUserData, displayName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none text-stone-900 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={newUserData.phoneNumber}
                    onChange={(e) => setNewUserData({ ...newUserData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none text-stone-900 font-mono focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Role Permission *</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none text-stone-900 font-bold focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="CUSTOMER">Customer (Standard)</option>
                    <option value="ADMIN">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Operations manager, partner"
                  value={newUserData.notes}
                  onChange={(e) => setNewUserData({ ...newUserData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none text-stone-900 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-md shadow-rose-600/25 active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Creating User..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
