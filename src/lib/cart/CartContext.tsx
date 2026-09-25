"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { CartItem, Product, Coupon } from "@/lib/types";
import { validateCoupon } from "@/lib/services/storeDb";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  giftWrapFee: number;
  total: number;
  appliedCoupon: Coupon | null;
  isCartOpen: boolean;
  isLoaded: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  freeShippingProgress: number;
  addToCart: (
    product: Product,
    quantity?: number,
    personalizationData?: Record<string, string | number>,
    selectedVariant?: { name: string; value: string },
    giftWrap?: boolean
  ) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  toggleGiftWrap: (itemId: string) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "glimglee_cart_v1";
const FREE_SHIPPING_THRESHOLD = 1500;
const STANDARD_SHIPPING_FEE = 100;
const GIFT_WRAP_FEE = 99;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load cart from storage on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to storage only after initial hydration
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items, isLoaded]);

  // Recalculate coupon if cart changes
  useEffect(() => {
    if (appliedCoupon) {
      const currentSubtotal = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      if (currentSubtotal < appliedCoupon.minOrderValue) {
        setAppliedCoupon(null);
        setDiscountAmount(0);
      } else {
        if (appliedCoupon.discountType === "percentage") {
          let disc = (currentSubtotal * appliedCoupon.discountValue) / 100;
          if (appliedCoupon.maxDiscount && disc > appliedCoupon.maxDiscount) {
            disc = appliedCoupon.maxDiscount;
          }
          setDiscountAmount(Math.round(disc));
        } else {
          setDiscountAmount(appliedCoupon.discountValue);
        }
      }
    }
  }, [items, appliedCoupon]);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const giftWrapFee = useMemo(
    () => items.reduce((sum, item) => sum + (item.giftWrap ? GIFT_WRAP_FEE : 0), 0),
    [items]
  );

  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }, [subtotal]);

  const total = useMemo(() => {
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    return afterDiscount + giftWrapFee + shippingFee;
  }, [subtotal, discountAmount, giftWrapFee, shippingFee]);

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const addToCart = (
    product: Product,
    quantity: number = 1,
    personalizationData?: Record<string, string | number>,
    selectedVariant?: { name: string; value: string },
    giftWrap: boolean = false
  ) => {
    const itemId = `cart-${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    // If no personalization, check if exact item already exists
    if (!personalizationData || Object.keys(personalizationData).length === 0) {
      const existingIndex = items.findIndex(
        (i) =>
          i.product.id === product.id &&
          i.selectedVariant?.value === selectedVariant?.value &&
          (!i.personalizationData || Object.keys(i.personalizationData).length === 0)
      );

      if (existingIndex >= 0) {
        const updated = [...items];
        updated[existingIndex].quantity += quantity;
        setItems(updated);
        setIsCartOpen(true);
        return;
      }
    }

    const newItem: CartItem = {
      id: itemId,
      product,
      quantity,
      personalizationData,
      selectedVariant,
      giftWrap,
    };

    setItems((prev) => [newItem, ...prev]);
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const toggleGiftWrap = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, giftWrap: !item.giftWrap } : item
      )
    );
  };

  const applyCouponCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (subtotal === 0) {
      return { success: false, message: "Your cart is empty." };
    }

    const res = await validateCoupon(code, subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setDiscountAmount(res.discountAmount);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discountAmount,
        shippingFee,
        giftWrapFee,
        total,
        appliedCoupon,
        isCartOpen,
        isLoaded,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
        freeShippingProgress,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCoupon,
        toggleGiftWrap,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
