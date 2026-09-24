"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { useToast } from "@/components/ui/Toast";
import { X, Star, Heart, ShoppingBag, ArrowRight, Sparkles, Check } from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const [selectedImg, setSelectedImg] = useState(0);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.personalization?.enabled) {
      window.location.href = `/products/${product.slug}#personalize`;
      return;
    }
    addToCart(product, 1);
    toast(`Added "${product.name}" to your gift bag!`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-3xl max-h-[92dvh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-stone-900 shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery side */}
          <div className="p-4 sm:p-6 bg-stone-50 flex flex-col justify-between">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-stone-200/60">
              <Image
                src={product.images[selectedImg] || product.thumbnail || ""}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImg === idx ? "border-rose-500 scale-105" : "border-stone-200 opacity-70"
                    }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info side */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase tracking-wider">
                  {product.categoryId.replace("-", " ")}
                </span>
                {product.personalization?.enabled && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Customizable
                  </span>
                )}
              </div>

              <h2 className="text-lg md:text-xl font-bold text-stone-900 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  <span className="font-bold text-stone-800 ml-1">{product.rating}</span>
                </div>
                <span>•</span>
                <span>{product.reviewCount} customer reviews</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> In Stock
                </span>
              </div>

              <div className="flex items-baseline gap-2.5 mt-4">
                <span className="text-2xl font-black text-stone-900">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    ₹{product.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 mt-4 leading-relaxed line-clamp-4">
                {product.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
                >
                  {product.personalization?.enabled ? (
                    <>
                      <Sparkles className="w-4 h-4" /> Customize & Order
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Gift Bag
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-xl border transition-colors ${
                    isFavorited
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>
              </div>

              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="w-full text-center block text-xs font-semibold text-stone-500 hover:text-stone-900 py-1 transition-colors"
              >
                View full product specifications & reviews →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
