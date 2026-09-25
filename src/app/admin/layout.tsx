"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  LayoutDashboard,
  Package,
  ListOrdered,
  Layers,
  Archive,
  ShoppingBag,
  Users,
  UserCheck,
  Ticket,
  Send,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin, isManager, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("glimglee_admin_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // ignore SSR or storage restrictions
    }
  }, []);

  // Close mobile sidebar on route transition
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("glimglee_admin_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      group: "Catalog",
      items: [
        { label: "Products", href: "/admin/products", icon: Package },
        { label: "Product Order & Ranking", href: "/admin/product-ordering", icon: ListOrdered },
        { label: "Categories", href: "/admin/categories", icon: Layers },
        { label: "Inventory & Stock", href: "/admin/inventory", icon: Archive },
      ],
    },
    {
      group: "Orders & Users",
      items: [
        { label: "Orders & Shipping", href: "/admin/orders", icon: ShoppingBag },
        { label: "User Management & Roles", href: "/admin/users", icon: Users },
        { label: "Customer Directory", href: "/admin/customers", icon: UserCheck },
      ],
    },
    {
      group: "Marketing & Outreach",
      items: [
        { label: "Promo Coupons", href: "/admin/coupons", icon: Ticket },
        { label: "Email Broadcast (Gmail)", href: "/admin/broadcast", icon: Send },
        { label: "Store Banners", href: "/admin/banners", icon: ImageIcon },
        { label: "Homepage CMS", href: "/admin/cms", icon: FileText },
        { label: "Reviews Moderation", href: "/admin/reviews", icon: MessageSquare },
      ],
    },
    {
      group: "Settings",
      items: [
        { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
        { label: "Store Settings", href: "/admin/settings", icon: Sliders },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  // Dedicated full-screen view for login and printable invoices
  if (pathname === "/admin/login" || pathname?.endsWith("/invoice")) {
    return <>{children}</>;
  }

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1917] flex flex-col items-center justify-center p-6 text-stone-300">
        <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold tracking-wider uppercase text-stone-400">Verifying Administrative Privileges...</p>
      </div>
    );
  }

  // 2. Unauthenticated User -> Prompt to Sign In
  if (!user) {
    return (
      <div className="min-h-screen bg-[#1c1917] flex flex-col items-center justify-center p-6 text-stone-200">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Glimglee Enterprise Suite</h2>
            <p className="text-xs text-stone-400 mt-2">
              Authentication required. Please sign in with an authorized administrator account to access the control panel.
            </p>
          </div>
          <Link
            href="/admin/login"
            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/30"
          >
            <span>Proceed to Admin Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Unauthorized User -> 403 Forbidden
  if (!isAdmin && !isManager) {
    return (
      <div className="min-h-screen bg-[#1c1917] flex flex-col items-center justify-center p-6 text-stone-200">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 block mb-1">403 Access Denied</span>
            <h2 className="text-xl font-black text-white">Administrative Access Restricted</h2>
            <p className="text-xs text-stone-400 mt-2">
              You are currently signed in as <strong className="text-white">{user.email}</strong> ({user.role}), which does not have ADMIN permission to view the Glimglee Enterprise Admin Suite.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Return to Customer Store</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-800 hover:bg-stone-950 text-stone-400 text-xs font-semibold transition-colors"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col lg:flex-row font-sans antialiased text-stone-900">
      {/* Mobile / Tablet Top Header Bar */}
      <header className="lg:hidden bg-stone-950 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 text-stone-300 hover:text-white hover:bg-stone-900 rounded-xl transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm tracking-tight text-white">GLIMGLEE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider ml-1">Admin</span>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="text-xs text-rose-400 hover:text-white flex items-center gap-1.5 font-bold px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800"
        >
          <span>Store</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </header>

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-stone-950/70 backdrop-blur-xs lg:hidden animate-in fade-in duration-150"
        />
      )}

      {/* Sidebar (Desktop + Mobile slideout) */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 h-[100dvh] max-h-[100dvh] bg-stone-950 text-stone-300 flex flex-col justify-between transition-all duration-200 border-r border-stone-800/80 ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } w-[84vw] sm:w-72 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden">
          {/* Brand & Badge + Collapse Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
            {!collapsed ? (
              <Link href="/admin/dashboard" className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-white">GLIMGLEE</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mb-1" />
                </div>
                <span className="text-[9px] tracking-[0.2em] font-bold text-amber-400 uppercase -mt-1">
                  Enterprise Suite
                </span>
              </Link>
            ) : (
              <Link href="/admin/dashboard" className="mx-auto" title="Glimglee Admin Dashboard">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-rose-600/30">
                  G
                </div>
              </Link>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-stone-400 hover:text-white p-1 rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse / Expand Toggle */}
            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex p-1.5 text-stone-400 hover:text-white hover:bg-stone-900 rounded-xl transition-colors"
              title={collapsed ? "Expand Sidebar (Wider View)" : "Collapse Sidebar (Full Content View)"}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-stone-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-stone-400" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-5">
            {navItems.map((item, idx) => {
              if (item.href) {
                const Icon = item.icon!;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center ${collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"} rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                        : "hover:bg-stone-900 text-stone-300 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              }

              return (
                <div key={idx} className="space-y-1">
                  {!collapsed ? (
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider px-3 block mb-1">
                      {item.group}
                    </span>
                  ) : (
                    <div className="w-6 h-0.5 bg-stone-800 mx-auto my-2 rounded-full" />
                  )}

                  {item.items?.map((sub) => {
                    const SubIcon = sub.icon;
                    const isActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setSidebarOpen(false)}
                        title={collapsed ? sub.label : undefined}
                        className={`flex items-center ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2"} rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30"
                            : "hover:bg-stone-900 text-stone-400 hover:text-white"
                        }`}
                      >
                        <SubIcon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{sub.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer & Profile */}
        <div className="p-3 sm:p-4 border-t border-stone-800/80 bg-stone-900/60 space-y-2">
          {!collapsed ? (
            <>
              <div className="flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <p className="font-bold text-white text-xs truncate">
                    {user?.displayName || user?.email || "Authorized Admin"}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                    {user?.role || "ADMIN"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <Link
                href="/"
                target="_blank"
                className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Live Customer Store</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </Link>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="p-2 rounded-xl bg-stone-800 text-stone-200 hover:text-white transition-colors"
                title="Open Live Customer Store"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 xl:p-8 w-full max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}
