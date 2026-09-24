"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { useToast } from "@/components/ui/Toast";
import { Heart, Star, Sparkles, Plus, Eye, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  priority = false,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const title = product.title || (product as any).name || "Curated Gift";
  const isFavorited = isInWishlist(product.id);
  const isCustomizable = product.isCustomizable || product.personalization?.enabled || Boolean(product.personalizationFields && product.personalizationFields.length > 0);
  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (!isFavorited) {
      toast(`Added "${title}" to your wishlist!`, "success");
    } else {
      toast(`Removed from wishlist`, "info");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If customizable, redirect to product customization section
    if (isCustomizable) {
      window.location.href = `/products/${product.slug}#personalize`;
      return;
    }

    addToCart(product, 1);
    setJustAdded(true);
    toast(`Added "${title}" to your gift bag!`, "success");
    setTimeout(() => setJustAdded(false), 2000);
  };

  const displayImage = isHovered && product.images?.[1]
    ? product.images[1]
    : product.images?.[0];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 overflow-hidden hover:shadow-card-hover hover:border-rose-300 transition-all duration-300 h-full"
    >
      {/* Product Image Box */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 flex items-center justify-center">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 text-stone-300">
              <Sparkles className="w-8 h-8 text-rose-300 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Glimglee</span>
            </div>
          )}
        </Link>

        {/* Status Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none z-10">
          {product.bestseller && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase shadow-xs">
              BESTSELLER
            </span>
          )}
          {isCustomizable && (
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> CUSTOM
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-700 text-white text-[9px] sm:text-[10px] font-black shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Button - Touch target >= 44px */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 min-w-[40px] min-h-[40px] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm z-20 ${
            isFavorited
              ? "bg-rose-50 text-rose-600 ring-2 ring-rose-200"
              : "bg-white/90 text-stone-600 hover:text-rose-600 hover:bg-white"
          }`}
          aria-label={isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-600 text-rose-600" : ""}`} />
        </button>

        {/* Desktop Quick View Overlay */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="hidden lg:flex absolute bottom-3 left-1/2 -translate-x-1/2 items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 text-stone-900 text-xs font-bold shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:bg-white z-20"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Rating & Stock Indicator */}
          <div className="flex items-center justify-between text-[11px] text-stone-500">
            {product.rating > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-bold text-stone-800">{product.rating.toFixed(1)}</span>
                {product.reviewCount > 0 && (
                  <span className="text-[10px] text-stone-400">({product.reviewCount})</span>
                )}
              </div>
            ) : (
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">New</span>
            )}

            {product.inventory <= 5 && product.inventory > 0 && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                Only {product.inventory} left
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Bag CTA */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-stone-900 font-mono">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-stone-400 line-through font-mono">
                  ₹{product.compareAtPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {/* Touch-Friendly Add CTA (>= 40px) */}
          <button
            onClick={handleAddToCart}
            className={`min-w-[40px] min-h-[40px] h-9 sm:h-9 px-2.5 sm:px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs ${
              justAdded
                ? "bg-emerald-600 text-white"
                : isCustomizable
                ? "bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200"
                : "bg-stone-900 text-white hover:bg-rose-600"
            }`}
            title={isCustomizable ? "Customize Gift" : "Add to Bag"}
            aria-label={isCustomizable ? "Customize Gift" : "Add to Bag"}
          >
            {justAdded ? (
              <Check className="w-4 h-4" />
            ) : isCustomizable ? (
              <>
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">Customize</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
