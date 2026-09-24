"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { ShippingAddress } from "@/lib/types";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  Gift,
  ArrowLeft,
  Sparkles,
  MapPin,
  Building,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { loadCashfreeCheckout } from "@/lib/payment/cashfree-client";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, giftWrapFee, total, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Address, 2: Review, 3: Payment
  const [loading, setLoading] = useState(false);
  const idempotencyKeyRef = useRef<string>("");

  useEffect(() => {
    // Generate unique idempotency key for this checkout attempt
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }
  }, []);

  // Address State (defaults from authenticated user if available)
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.displayName || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phoneNumber || "",
      }));
    }
  }, [user]);

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  // Payment Method: Cashfree PG or Cash on Delivery
  const [paymentMethod, setPaymentMethod] = useState<"cashfree" | "cod">("cashfree");

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const expressSurcharge = shippingMethod === "express" ? 150 : 0;
  const finalPayable = total + expressSurcharge;

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.email || !address.phone || !address.addressLine1 || !address.pincode) {
      toast("Please fill in all mandatory address fields", "error");
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Verify with backend server
      const verifyRes = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            selectedVariant: i.selectedVariant,
            personalizationData: i.personalizationData,
          })),
          couponCode: appliedCoupon?.code,
          giftWrapTotal: giftWrapFee,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        toast(verifyData.error || "Server price verification failed", "error");
        setLoading(false);
        return;
      }

      // 2. Submit order to server with unique idempotency key to prevent double charging
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": idempotencyKeyRef.current,
        },
        body: JSON.stringify({
          userId: user?.uid || "guest",
          customerName: address.fullName,
          customerEmail: address.email,
          customerPhone: address.phone,
          shippingAddress: address,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            selectedVariant: i.selectedVariant,
            personalizationData: i.personalizationData,
          })),
          couponCode: appliedCoupon?.code,
          paymentMethod,
          giftWrapTotal: giftWrapFee + expressSurcharge,
          idempotencyKey: idempotencyKeyRef.current,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order) {
        toast(orderData.error || "Failed to create order", "error");
        setLoading(false);
        return;
      }

      // 3. Handle Cashfree Checkout Flow
      if (paymentMethod === "cashfree" && orderData.paymentSessionId) {
        clearCart();
        const cfEnv = (process.env.NEXT_PUBLIC_CASHFREE_ENV || "sandbox").toLowerCase() === "production" ? "production" : "sandbox";
        try {
          await loadCashfreeCheckout(orderData.paymentSessionId, cfEnv);
          return;
        } catch (sdkErr) {
          console.error("Cashfree SDK launch notice:", sdkErr);
          router.push(`/order-success/${orderData.order.id}`);
          return;
        }
      }

      // 4. Handle Cash on Delivery (COD)
      clearCart();
      router.push(`/order-success/${orderData.order.id}`);
    } catch (err) {
      console.error("Checkout submission error:", err);
      toast("Error processing order. Please check network.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg" className="py-6 sm:py-10">
      {/* Checkout Stepper */}
      <div className="flex items-center justify-center max-w-lg mx-auto mb-10 text-xs font-bold">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${
            step >= 1 ? "border-rose-600 text-rose-600" : "border-stone-200 text-stone-400"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
            1
          </span>
          <span>Delivery Address</span>
        </button>

        <div className="w-12 h-0.5 bg-stone-200 -mt-2 mx-2" />

        <button
          onClick={() => step >= 2 && setStep(2)}
          className={`flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${
            step >= 2 ? "border-rose-600 text-rose-600" : "border-stone-200 text-stone-400"
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
            step >= 2 ? "bg-rose-600 text-white" : "bg-stone-200 text-stone-600"
          }`}>
            2
          </span>
          <span>Review Gifts</span>
        </button>

        <div className="w-12 h-0.5 bg-stone-200 -mt-2 mx-2" />

        <button
          onClick={() => step >= 3 && setStep(3)}
          className={`flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${
            step === 3 ? "border-rose-600 text-rose-600" : "border-stone-200 text-stone-400"
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
            step === 3 ? "bg-rose-600 text-white" : "bg-stone-200 text-stone-600"
          }`}>
            3
          </span>
          <span>Payment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form Area */}
        <div className="lg:col-span-7">
          {/* STEP 1: ADDRESS */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-600" />
                  <span>Where Should We Send Your Gifts?</span>
                </h2>
                <span className="text-[11px] text-stone-400">Step 1 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Full Name of Recipient *</label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone Number (For Courier) *</label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Flat / House No. / Building *</label>
                  <input
                    type="text"
                    required
                    value={address.addressLine1}
                    onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Street / Area / Colony</label>
                  <input
                    type="text"
                    value={address.addressLine2 || ""}
                    onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={address.landmark || ""}
                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Delivery Speed Options */}
              <div className="pt-4 border-t border-stone-100 space-y-2">
                <span className="block text-xs font-bold text-stone-800">Select Dispatch Speed:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    onClick={() => setShippingMethod("standard")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      shippingMethod === "standard"
                        ? "bg-rose-50 border-rose-400 text-rose-900"
                        : "border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>Standard Surface</span>
                      <span>FREE</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">3-5 business days across India</p>
                  </div>

                  <div
                    onClick={() => setShippingMethod("express")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      shippingMethod === "express"
                        ? "bg-rose-50 border-rose-400 text-rose-900"
                        : "border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>Priority Air Express</span>
                      <span>+₹150</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">24-48 hours expedited courier</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
                >
                  <span>Continue to Gift Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ORDER REVIEW */}
          {step === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-stone-900">Review Items & Personalization</h2>
                  <p className="text-xs text-stone-500">Ensure custom engravings and messages are accurate.</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Edit Address
                </button>
              </div>

              {/* Shipping Address Snapshot */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-700 space-y-1">
                <span className="font-bold text-stone-900 block">Deliver to:</span>
                <p className="font-semibold">{address.fullName} • {address.phone}</p>
                <p>{address.addressLine1}, {address.addressLine2}</p>
                <p>{address.city}, {address.state} - {address.pincode}</p>
              </div>

              {/* Items List with Personalization Inspection */}
              <div className="space-y-4 divide-y divide-stone-100">
                {items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                      <Image
                        src={item.product.images[0] || item.product.thumbnail || ""}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 text-xs space-y-1">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-stone-900">{item.product.name}</h4>
                        <span className="font-bold text-stone-900">
                          ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-stone-500">Quantity: {item.quantity}</p>

                      {item.giftWrap && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
                          ✓ Luxury Gift Wrapping Included
                        </span>
                      )}

                      {item.personalizationData && Object.keys(item.personalizationData).length > 0 && (
                        <div className="mt-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                          <span className="font-bold block text-amber-800">Customization Confirmed:</span>
                          {Object.entries(item.personalizationData).map(([key, val]) => (
                            <div key={key}>
                              <span className="capitalize text-stone-500">{key.replace(/_/g, " ")}: </span>
                              <span className="font-medium text-stone-800">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rose-600" />
                  <span>Select Payment Method</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  All transactions are 100% encrypted & processed through PCI-DSS secure servers.
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 text-xs">
                {/* Cashfree Payments */}
                <div
                  onClick={() => setPaymentMethod("cashfree")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "cashfree"
                      ? "bg-rose-50/80 border-rose-500 shadow-sm"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 via-purple-700 to-rose-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                      CF
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900">Cashfree Secure Checkout</h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Instant UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, NetBanking & Wallets
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={paymentMethod === "cashfree"}
                    onChange={() => {}}
                    className="accent-rose-600 w-4 h-4"
                  />
                </div>

                {/* COD */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === "cod"
                      ? "bg-rose-50/80 border-rose-500 shadow-sm"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                      COD
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900">Cash on Delivery</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">Pay upon delivery of your gift at your doorstep</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={paymentMethod === "cod"}
                    onChange={() => {}}
                    className="accent-rose-600 w-4 h-4"
                  />
                </div>
              </div>

              {/* Security Badge */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Zero Risk Guarantee: Free replacements for transit breakages.</span>
              </div>

              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePlaceOrder}
                  className="flex-1 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/25 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? "Confirming Order..." : `Pay ₹${finalPayable.toLocaleString("en-IN")} & Place Order`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Payment Summary
            </h3>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({items.length})</span>
                <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="font-semibold">-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              {giftWrapFee > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>Luxury Gift Wrap</span>
                  <span className="font-semibold">+₹{giftWrapFee.toLocaleString("en-IN")}</span>
                </div>
              )}
              {expressSurcharge > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Priority Air Dispatch</span>
                  <span className="font-semibold">+₹{expressSurcharge}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-extrabold text-stone-900">
                <span>Total Amount</span>
                <span className="text-xl text-rose-600">₹{finalPayable.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[10px] text-stone-400 text-right">All taxes & GST included</p>
            </div>

            {/* Micro items list */}
            <div className="pt-3 border-t border-stone-100 space-y-2.5 max-h-48 overflow-y-auto">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-3 text-xs">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                    <Image
                      src={i.product.images?.[0] || i.product.thumbnail || ""}
                      alt={i.product.title || (i.product as any).name || "Gift item"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-stone-900 truncate">{i.product.title || (i.product as any).name || "Gift"}</p>
                    <span className="text-[10px] text-stone-400">Qty: {i.quantity}</span>
                  </div>
                  <span className="font-bold text-stone-800">₹{(i.product.price * i.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
