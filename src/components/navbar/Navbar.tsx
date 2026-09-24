"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { getProducts } from "@/lib/services/products";
import { getCategories } from "@/lib/services/categories";
import { Product, Category } from "@/lib/types";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Package,
  LogOut,
  SlidersHorizontal,
  MapPin,
  HelpCircle,
  Phone,
  Truck,
  Gift,
  Flame,
  ChevronRight,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, isManager, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const { wishlist } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Return to current page after login
  const loginTargetUrl =
    pathname && pathname !== "/login" && pathname !== "/register"
      ? `/login?redirect=${encodeURIComponent(pathname)}`
      : "/login";

  // Load dynamic categories
  useEffect(() => {
    getCategories().then(setCategories);
    const handleUpdate = () => getCategories().then(setCategories);
    window.addEventListener("glimglee_categories_updated", handleUpdate);
    return () => window.removeEventListener("glimglee_categories_updated", handleUpdate);
  }, []);

  // Scroll detection for sticky shadow & subtle compression
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search query with 300ms debounce
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await getProducts({ search: query, limitCount: 6 });
      setSearchResults(results);
      setSearchDropdownOpen(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchDropdownOpen(false);
      setMobileSearchOpen(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchDropdownOpen(false);
  };

  const isCurrent = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 1. TOP UTILITY / ANNOUNCEMENT BAR */}
      <div className="bg-[#1c1917] text-stone-300 text-[11px] font-medium border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
          {/* Left: Craftsmanship Highlights */}
          <div className="hidden md:flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-rose-300 font-semibold tracking-tight">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Handcrafted In India</span>
            </span>
            <span className="text-stone-700">•</span>
            <span className="text-stone-400">Complimentary Luxury Gift Packaging Over ₹999</span>
          </div>

          {/* Center (Mobile Highlight) */}
          <div className="flex md:hidden items-center justify-center flex-1 text-center truncate">
            <span className="text-stone-300 font-medium truncate">
              Complimentary Luxury Gift Packaging Over ₹999
            </span>
          </div>

          {/* Right: Quick Utilities */}
          <div className="hidden sm:flex items-center gap-4 text-stone-300">
            <Link
              href="/orders/track"
              className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-rose-400" />
              <span>Track Order</span>
            </Link>
            <span className="text-stone-700">•</span>
            <Link
              href="/contact"
              className="text-stone-300 hover:text-white transition-colors"
            >
              Help & Support
            </Link>

            {isAdmin && (
              <>
                <span className="text-stone-700">•</span>
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-colors font-bold text-[10px]"
                >
                  <SlidersHorizontal className="w-3 h-3 text-rose-400" />
                  <span>Admin Suite</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-200 border-b border-stone-200/80 ${
          isScrolled ? "shadow-md shadow-stone-900/5" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4 lg:gap-8">
            
            {/* Zone 1 (Left): Hamburger (Mobile) + Brand Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-xl text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="flex items-center gap-2 group select-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl sm:text-[26px] font-black tracking-tight text-stone-950 group-hover:text-rose-600 transition-colors">
                    GLIMGLEE
                  </span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 mb-1.5 group-hover:scale-125 transition-transform" />
                </div>
              </Link>
            </div>

            {/* Zone 2 (Center): Primary Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-9 text-[13px] tracking-wide font-medium">
              <Link
                href="/"
                className={`transition-colors relative py-1 whitespace-nowrap ${
                  isCurrent("/") && pathname === "/"
                    ? "text-stone-950 font-bold"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                <span>Home</span>
                {isCurrent("/") && pathname === "/" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-stone-950 rounded-full" />
                )}
              </Link>

              <Link
                href="/shop"
                className={`transition-colors relative py-1 whitespace-nowrap ${
                  isCurrent("/shop")
                    ? "text-stone-950 font-bold"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                <span>Shop</span>
                {isCurrent("/shop") && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-stone-950 rounded-full" />
                )}
              </Link>

              <Link
                href="/categories"
                className={`transition-colors relative py-1 whitespace-nowrap ${
                  pathname === "/categories"
                    ? "text-stone-950 font-bold"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                <span>All Collections</span>
                {pathname === "/categories" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-stone-950 rounded-full" />
                )}
              </Link>

              <Link
                href="/orders/track"
                className={`transition-colors relative py-1 whitespace-nowrap ${
                  pathname === "/orders/track"
                    ? "text-stone-950 font-bold"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                <span>Track Order</span>
                {pathname === "/orders/track" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-stone-950 rounded-full" />
                )}
              </Link>

              <Link
                href="/about"
                className={`transition-colors relative py-1 whitespace-nowrap ${
                  pathname === "/about"
                    ? "text-stone-950 font-bold"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                <span>About</span>
                {pathname === "/about" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-stone-950 rounded-full" />
                )}
              </Link>
            </nav>

            {/* Zone 3 (Right): Search Bar + Wishlist + Cart + Account */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              {/* Desktop Search Input with Autocomplete */}
              <div ref={searchRef} className="hidden md:block relative w-44 lg:w-56 xl:w-64">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setSearchDropdownOpen(true)}
                    placeholder="Search gifts..."
                    className="w-full text-xs bg-stone-100/80 hover:bg-stone-100 focus:bg-white pl-8 pr-7 py-2.5 rounded-full border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all text-stone-800 placeholder-stone-400 outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>

                {/* Autocomplete Dropdown Popover */}
                {searchDropdownOpen && searchResults.length > 0 && (
                  <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      <span>Quick Matches</span>
                      <span className="text-rose-600 font-semibold">{searchResults.length} items</span>
                    </div>

                    <div className="space-y-1">
                      {searchResults.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.slug}`}
                          onClick={() => setSearchDropdownOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors group"
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 flex items-center justify-center">
                            {prod.images?.[0] ? (
                              <Image
                                src={prod.images[0]}
                                alt={prod.title || prod.name || "Gift"}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <Gift className="w-4 h-4 text-rose-300 stroke-[1.5]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-stone-900 truncate group-hover:text-rose-600 transition-colors">
                              {prod.title || prod.name}
                            </h5>
                            <span className="text-[11px] font-bold text-rose-600 font-mono">
                              ₹{prod.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-rose-500 transition-colors" />
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-stone-100 mt-2 pt-2 px-2">
                      <button
                        onClick={() => handleSearchSubmit()}
                        className="w-full text-center text-xs font-bold text-rose-600 hover:text-rose-700 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        View all results for "{searchQuery}" →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Search Trigger Icon */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Button */}
              <Link
                href="/wishlist"
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-stone-700 hover:text-rose-600 hover:bg-rose-50/70 transition-colors flex-shrink-0"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={openCart}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-stone-700 hover:text-rose-600 hover:bg-rose-50/70 transition-colors flex-shrink-0"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-scale-in">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Exclusive Admin Suite Button - ONLY VISIBLE TO LOGGED IN USERS WITH ADMIN ROLE */}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-bold shadow-xs hover:shadow transition-all flex-shrink-0"
                  title="Open Administration Suite"
                >
                  <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline sm:inline">Admin Panel</span>
                  <span className="inline xs:hidden sm:hidden">Admin</span>
                </Link>
              )}

              {/* User Account / Sign In */}
              <div ref={accountRef} className="relative flex-shrink-0">
                {user ? (
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all flex-shrink-0"
                    aria-label="Account Menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center border border-rose-200">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="text-xs font-semibold text-stone-800 max-w-[80px] truncate hidden md:inline-block">
                      {user.displayName?.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                ) : (
                  <Link
                    href={loginTargetUrl}
                    className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white text-xs font-semibold whitespace-nowrap flex-shrink-0 shadow-sm transition-all hover:shadow"
                  >
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">Sign In</span>
                  </Link>
                )}

                {/* Account Menu Popover */}
                {accountMenuOpen && user && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-stone-50 rounded-xl mb-1.5 border border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">{user.displayName}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.2 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100">
                        {user.role}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-xs font-semibold text-stone-700">
                      <Link
                        href="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-stone-50 hover:text-stone-900 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-stone-400" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-stone-50 hover:text-stone-900 rounded-xl transition-colors"
                      >
                        <Package className="w-4 h-4 text-stone-400" />
                        <span>My Orders & Invoices</span>
                      </Link>
                      <Link
                        href="/account/addresses"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-stone-50 hover:text-stone-900 rounded-xl transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-stone-400" />
                        <span>Saved Addresses</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-colors"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                          <span>Admin Suite</span>
                        </Link>
                      )}

                      <div className="border-t border-stone-100 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setAccountMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-left transition-colors font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. SECONDARY CATEGORY / OCCASIONS QUICK-BAR (DESKTOP) */}
        <div className="hidden lg:block border-t border-stone-100 bg-[#faf8f5]/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10 text-[11px] font-semibold text-stone-600">
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
                <Link
                  href="/shop"
                  className="flex items-center gap-1.5 hover:text-rose-600 transition-colors whitespace-nowrap text-stone-900 font-bold"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Trending Gifts</span>
                </Link>
                <Link
                  href="/shop?isCustomizable=true"
                  className="hover:text-rose-600 transition-colors whitespace-nowrap"
                >
                  Personalized Keepsakes
                </Link>
                <Link
                  href="/categories"
                  className="hover:text-rose-600 transition-colors whitespace-nowrap"
                >
                  Curated Hampers
                </Link>
                <Link
                  href="/shop?sort=newest"
                  className="hover:text-rose-600 transition-colors whitespace-nowrap"
                >
                  New Arrivals
                </Link>
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-stone-200 flex-shrink-0">
                <Link
                  href="/shop?maxPrice=499"
                  className="text-stone-700 hover:text-rose-600 transition-colors whitespace-nowrap font-medium"
                >
                  Under ₹499
                </Link>
                <span className="text-stone-300">|</span>
                <Link
                  href="/shop?maxPrice=999"
                  className="text-rose-600 hover:text-rose-700 font-bold transition-colors whitespace-nowrap"
                >
                  Under ₹999
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 4. DEDICATED FULL-SCREEN MOBILE SEARCH MODAL */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex flex-col p-3 sm:p-4 md:hidden animate-in fade-in">
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[88dvh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Search Glimglee Gifts
              </span>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candles, frames, hampers..."
                className="w-full text-xs bg-stone-100 pl-10 pr-9 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-rose-500 font-medium"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Quick search suggestion tags */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block w-full">
                Popular Searches:
              </span>
              {["Gift Hampers", "Personalized Frames", "Soy Candles", "Birthday", "Anniversary"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                  }}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-700 text-[11px] font-medium rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-stone-100 pt-2">
                {searchResults.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/products/${prod.slug}`}
                    onClick={() => setMobileSearchOpen(false)}
                    className="flex items-center gap-3 pt-2.5 first:pt-0"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 flex items-center justify-center">
                      {prod.images?.[0] ? (
                        <Image
                          src={prod.images[0]}
                          alt={prod.title || prod.name || "Gift"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Gift className="w-5 h-5 text-rose-300 stroke-[1.5]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">{prod.title || prod.name}</p>
                      <p className="text-[11px] font-bold text-rose-600 font-mono">
                        ₹{prod.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                  </Link>
                ))}
              </div>
            )}

            <button
              onClick={() => handleSearchSubmit()}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-xs transition-colors"
            >
              Search for "{searchQuery || "Shop"}"
            </button>
          </div>
        </div>
      )}

      {/* 5. MODERN MOBILE SLIDE-OUT DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <div className="fixed inset-y-0 left-0 w-[85vw] max-w-sm h-[100dvh] max-h-[100dvh] bg-white shadow-2xl flex flex-col justify-between p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div className="space-y-6">
              
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 select-none"
                >
                  <span className="text-2xl font-black tracking-tight text-stone-950">GLIMGLEE</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 mb-1" />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Account Quick Card */}
              {user ? (
                <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 rounded-full bg-rose-200 text-rose-800 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-stone-900 truncate">{user.displayName}</p>
                      <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-white text-rose-700 text-[9px] font-bold">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 text-xs font-bold rounded-xl shadow-2xs flex-shrink-0 hover:bg-rose-50 transition-colors"
                  >
                    Account
                  </Link>
                </div>
              ) : (
                <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl space-y-3">
                  <div>
                    <p className="text-xs font-bold text-stone-900">Welcome to Glimglee</p>
                    <p className="text-[11px] text-stone-500">Sign in to track orders & save custom gifts</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={loginTargetUrl}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold text-center hover:bg-stone-800 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-xs font-bold text-center hover:bg-stone-50 transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}

              {/* Collections & Categories */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block px-1">
                  Shop Curated Collections
                </span>
                <nav className="space-y-1 text-xs font-bold text-stone-800">
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Gift className="w-4 h-4 text-rose-500" />
                      <span>All Keepsakes & Gifts</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>

                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    </Link>
                  ))}

                  <Link
                    href="/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    <span>Occasions & Festivals</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                </nav>
              </div>

              {/* Customer Care & Services */}
              <div className="space-y-1 pt-4 border-t border-stone-100 text-xs font-semibold text-stone-700">
                <Link
                  href="/orders/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-rose-600 font-bold hover:bg-rose-50 transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track My Delivery</span>
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-stone-400" />
                  <span>Our Craft & Story</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  <Phone className="w-4 h-4 text-stone-400" />
                  <span>Customer Support</span>
                </Link>

                {/* Role-Guarded Admin Operations Link */}
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-colors mt-2"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-rose-400" />
                    <span>Admin Operations</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Drawer Bottom Info */}
            <div className="pt-6 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
              <p className="font-bold text-stone-800">Glimglee Concierge</p>
              <p>Mon–Sat 9AM–8PM IST • +91 98765 43210</p>
              <p className="text-[10px] text-stone-400 pt-1">
                Handcrafted with pride in India • ISO 9001 Certified
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
