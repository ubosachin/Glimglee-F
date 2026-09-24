"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { useCart } from "@/lib/cart/CartContext";
import { useToast } from "@/components/ui/Toast";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleMoveToCart = (product: any) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    toast(`Moved "${product.name}" to your gift bag!`, "success");
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h1 className="text-2xl font-black text-stone-900">Your Wishlist is Empty</h1>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Save the gifts you love and revisit them anytime for upcoming anniversaries, birthdays, or festivals.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all"
        >
          <span>Explore Gifts</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200/80 pb-6 gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            My Saved Wishlist
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            You have {wishlist.length} {wishlist.length === 1 ? "gift" : "gifts"} saved for upcoming celebrations.
          </p>
        </div>
        <button
          onClick={clearWishlist}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 self-start sm:self-auto"
        >
          Clear entire wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((prod) => (
          <div
            key={prod.id}
            className="group relative flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-all"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
              <Link href={`/products/${prod.slug}`}>
                <Image
                  src={prod.images[0] || prod.thumbnail || ""}
                  alt={prod.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <button
                onClick={() => removeFromWishlist(prod.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-stone-500 hover:text-rose-600 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <Link href={`/products/${prod.slug}`}>
                  <h3 className="text-xs font-bold text-stone-900 group-hover:text-rose-600 line-clamp-2">
                    {prod.name}
                  </h3>
                </Link>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-extrabold text-stone-900">
                    ₹{prod.price.toLocaleString("en-IN")}
                  </span>
                  {prod.compareAtPrice && (
                    <span className="text-[11px] text-stone-400 line-through">
                      ₹{prod.compareAtPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleMoveToCart(prod)}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move to Gift Bag</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
