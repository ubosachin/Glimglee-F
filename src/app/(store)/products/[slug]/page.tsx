"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/products";
import { getReviews, addReview } from "@/lib/services/storeDb";
import { Product, Review, PersonalizationField } from "@/lib/types";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { ProductSection } from "@/components/product/ProductSection";
import { Container } from "@/components/ui/Container";
import { ProductPageSkeleton } from "@/components/ui/LoadingSkeletons";
import { uploadCustomizationPhoto } from "@/lib/storage/upload";
import {
  Star,
  Heart,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  Gift,
  Upload,
  Calendar,
  Check,
  ArrowRight,
  ChevronDown,
  Info,
  Clock,
  RotateCcw,
  X,
  Loader2,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImg, setSelectedImg] = useState(0);

  // Order state
  const [quantity, setQuantity] = useState(1);
  const [giftWrap, setGiftWrap] = useState(false);
  const [personalizationValues, setPersonalizationValues] = useState<Record<string, string>>({});
  const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState<string | null>(null);
  const [uploadingCustomPhoto, setUploadingCustomPhoto] = useState(false);

  // Delivery estimation pincode
  const [pincode, setPincode] = useState("");
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  // Accordion open/close states
  const [openAccordion, setOpenAccordion] = useState<string>("details");

  // Review submission state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await getProductBySlug(slug);
        setProduct(prod);

        if (prod) {
          const [related, revs] = await Promise.all([
            getRelatedProducts(prod.id, prod.categoryId, prod.tags, 4),
            getReviews(prod.id),
          ]);
          setRelatedProducts(related);
          setReviews(revs);
        }
      } catch (err) {
        console.error("Error loading product detail:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    return (
      <Container size="sm" className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Gift Not Found</h2>
        <p className="text-xs text-stone-500">The product you are looking for is currently unavailable.</p>
        <Link
          href="/shop"
          className="inline-block px-5 py-2.5 rounded-2xl bg-stone-900 text-white text-xs font-bold"
        >
          Explore All Gifts
        </Link>
      </Container>
    );
  }

  const title = product.title || (product as any).name || "Curated Gift";
  const isFavorited = isInWishlist(product.id);
  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  // Resolve dynamic personalization fields schema
  const personalizationFields: PersonalizationField[] =
    product.personalizationFields && product.personalizationFields.length > 0
      ? product.personalizationFields
      : (product as any).personalization?.fields || [];

  const isCustomizable = product.isCustomizable || personalizationFields.length > 0;

  // Handle Custom Photo upload directly to Cloudinary CDN
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Please select a valid image file", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast("Image must be under 10MB", "error");
      return;
    }

    setUploadingCustomPhoto(true);
    try {
      const res = await uploadCustomizationPhoto(file, user?.uid || "guest");
      setUploadedPhotoPreview(res.url);
      setPersonalizationValues((prev) => ({
        ...prev,
        [fieldName]: res.url,
      }));
      toast("Custom photo uploaded to Cloudinary successfully!", "success");
    } catch (err: any) {
      console.warn("Cloudinary upload failed, falling back to local preview:", err);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setUploadedPhotoPreview(dataUrl);
        setPersonalizationValues((prev) => ({
          ...prev,
          [fieldName]: dataUrl,
        }));
        toast("Photograph uploaded successfully!", "success");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingCustomPhoto(false);
    }
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setDeliveryEstimate(`Delivery to ${pincode} available in 2–4 business days. Priority Express available.`);
    } else {
      setDeliveryEstimate("Please enter a valid 6-digit Indian PIN code.");
    }
  };

  const handleAddToCart = () => {
    // Validate required personalization fields
    for (const field of personalizationFields) {
      const fieldKey = field.name || field.id;
      if (field.required && !personalizationValues[fieldKey]) {
        toast(`Please complete the required field: "${field.label}"`, "error");
        const el = document.getElementById("personalize");
        el?.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    addToCart(product, quantity, personalizationValues, undefined, giftWrap);
    toast(`Added ${quantity} × "${title}" to your gift bag!`, "success");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) {
      toast("Please fill in both a title and review comment", "error");
      return;
    }

    await addReview({
      productId: product.id,
      userId: user?.uid || "guest",
      userName: user?.displayName || "Verified Giver",
      rating: newRating,
      title: newTitle.trim(),
      comment: newComment.trim(),
      verifiedPurchase: true,
    });

    toast("Thank you! Your verified review has been submitted.", "success");
    setShowReviewModal(false);
    setNewTitle("");
    setNewComment("");
    // Reload reviews
    getReviews(product.id).then(setReviews);
  };

  const images = product.images && product.images.length > 0 ? product.images : [];

  const totalPrice = product.price * quantity + (giftWrap ? 99 : 0);

  return (
    <div className="py-6 sm:py-10 pb-28 md:pb-16 space-y-12 w-full max-w-full overflow-x-hidden">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs text-stone-500 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none max-w-full py-1">
          <Link href="/" className="hover:text-rose-600 flex-shrink-0">Home</Link>
          <span className="flex-shrink-0">/</span>
          <Link href="/shop" className="hover:text-rose-600 flex-shrink-0">Gifts</Link>
          <span className="flex-shrink-0">/</span>
          <Link href={`/category/${product.categoryId}`} className="hover:text-rose-600 capitalize flex-shrink-0">
            {product.category || product.categoryId.replace(/-/g, " ")}
          </Link>
          <span className="flex-shrink-0">/</span>
          <span className="text-stone-900 font-semibold truncate max-w-[200px] sm:max-w-none">{title}</span>
        </nav>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Left Column: Image Gallery & Accordions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Main Selected Image */}
            <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-sm flex items-center justify-center">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImg] || images[0]}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 text-stone-300">
                  <Sparkles className="w-12 h-12 text-rose-300 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Glimglee Keepsake</span>
                </div>
              )}
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-black shadow-md">
                  {discountPercent}% OFF
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product);
                }}
                className={`absolute top-4 right-4 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                  isFavorited
                    ? "bg-rose-50 text-rose-600 ring-2 ring-rose-200"
                    : "bg-white/90 text-stone-600 hover:text-rose-600 hover:bg-white"
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-rose-600 text-rose-600" : ""}`} />
              </button>
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImg === idx
                        ? "border-rose-600 scale-105 shadow-md"
                        : "border-stone-200 hover:border-stone-300 opacity-80"
                    }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Collapsible Accordions (Description, Packaging, Shipping) */}
            <div className="border border-stone-200 rounded-3xl divide-y divide-stone-200 bg-white shadow-xs overflow-hidden">
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === "details" ? "" : "details")}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs font-bold text-stone-900 uppercase tracking-wider hover:bg-stone-50 transition-colors"
                >
                  <span>Curator's Story & Specifications</span>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${openAccordion === "details" ? "rotate-180" : ""}`} />
                </button>
                {openAccordion === "details" && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-stone-600 leading-relaxed space-y-3 bg-[#fdfcfb]">
                    <p>{product.description}</p>
                    <p className="text-xs text-stone-400 font-mono">SKU: {product.sku}</p>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === "packaging" ? "" : "packaging")}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs font-bold text-stone-900 uppercase tracking-wider hover:bg-stone-50 transition-colors"
                >
                  <span>Signature Gifting Experience</span>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${openAccordion === "packaging" ? "rotate-180" : ""}`} />
                </button>
                {openAccordion === "packaging" && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-stone-600 leading-relaxed space-y-2 bg-[#fdfcfb]">
                    <p>Every Glimglee gift arrives nestled in our custom matte keepsake gift box, surrounded by celebratory confetti ribbons, and sealed with an authentic wax stamp.</p>
                    <p>Complimentary handwritten greeting card included upon request.</p>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === "shipping" ? "" : "shipping")}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs font-bold text-stone-900 uppercase tracking-wider hover:bg-stone-50 transition-colors"
                >
                  <span>Pan-India Shipping & Replacements</span>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${openAccordion === "shipping" ? "rotate-180" : ""}`} />
                </button>
                {openAccordion === "shipping" && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-stone-600 leading-relaxed space-y-2 bg-[#fdfcfb]">
                    <p>• Dispatched within 24–48 hours across tier-1 logistics networks.</p>
                    <p>• Free shipping on orders above ₹999.</p>
                    <p>• <strong>Glimglee Happiness Guarantee:</strong> Free replacement if fragile items break during courier transit.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Personalization Studio, Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {product.bestseller && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                    BESTSELLER
                  </span>
                )}
                {isCustomizable && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> PERSONALIZED
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider">
                  {product.category || product.categoryId.replace(/-/g, " ")}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                {title}
              </h1>

              {/* Ratings & Stock */}
              <div className="flex items-center gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold text-stone-900">{product.rating}</span>
                  <span className="text-stone-400">({reviews.length} reviews)</span>
                </div>
                <span className="text-stone-300">•</span>
                {product.inventory > 0 ? (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> In Stock ({product.inventory} available)
                  </span>
                ) : (
                  <span className="font-bold text-rose-600">Out of Stock</span>
                )}
              </div>

              {/* Price Banner */}
              <div className="mt-4 p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/80 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-stone-400 line-through font-mono">
                    ₹{product.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-[11px] text-stone-500 ml-auto">Inclusive of all taxes</span>
              </div>
            </div>

            {/* DYNAMIC PERSONALIZATION STUDIO (Generated from schema) */}
            {isCustomizable && (
              <div id="personalize" className="p-5 sm:p-6 rounded-3xl bg-rose-50/60 border border-rose-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-800 font-black text-sm">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    <span>Personalization Studio</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                    Bespoke
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Enter your custom names, dates, or upload photographs. Our master artisans hand-finish each piece with precision.
                </p>

                {/* Dynamically Rendered Form Inputs */}
                <div className="space-y-3.5">
                  {personalizationFields.length > 0 ? (
                    personalizationFields.map((field) => {
                      const fieldKey = field.name || field.id;
                      const maxLen = (field as any).maxLength;
                      return (
                        <div key={fieldKey} className="space-y-1">
                          <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                            <span>
                              {field.label} {field.required && <strong className="text-rose-600">*</strong>}
                            </span>
                            {maxLen && (
                              <span className="text-[10px] text-stone-400 font-mono">
                                {(personalizationValues[fieldKey] || "").length}/{maxLen}
                              </span>
                            )}
                          </label>

                          {field.type === "textarea" ? (
                            <textarea
                              rows={3}
                              maxLength={maxLen || 200}
                              value={personalizationValues[fieldKey] || ""}
                              onChange={(e) =>
                                setPersonalizationValues({
                                  ...personalizationValues,
                                  [fieldKey]: e.target.value,
                                })
                              }
                              placeholder={field.placeholder || "Enter heartfelt message..."}
                              className="w-full p-3 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:border-rose-500"
                            />
                          ) : field.type === "image" ? (
                            <div className="space-y-2">
                              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-2xl bg-white cursor-pointer transition-colors group">
                                {uploadingCustomPhoto ? (
                                  <>
                                    <Loader2 className="w-6 h-6 text-rose-500 animate-spin mb-1" />
                                    <span className="text-xs font-bold text-stone-800">
                                      Uploading to Cloudinary...
                                    </span>
                                    <span className="text-[10px] text-stone-400">Optimizing photo on CDN</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform mb-1" />
                                    <span className="text-xs font-bold text-stone-800">
                                      {uploadedPhotoPreview ? "Change Photo" : "Upload High-Resolution Photo"}
                                    </span>
                                    <span className="text-[10px] text-stone-400">JPG, PNG up to 10MB</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={uploadingCustomPhoto}
                                  onChange={(e) => handlePhotoUpload(e, fieldKey)}
                                  className="hidden"
                                />
                              </label>

                              {uploadedPhotoPreview && (
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-rose-300 shadow-sm">
                                  <Image
                                    src={uploadedPhotoPreview}
                                    alt="Custom Photo"
                                    fill
                                    className="object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUploadedPhotoPreview(null);
                                      setPersonalizationValues((prev) => {
                                        const next = { ...prev };
                                        delete next[fieldKey];
                                        return next;
                                      });
                                    }}
                                    className="absolute top-1 right-1 p-0.5 bg-stone-900 text-white rounded-full"
                                    aria-label="Remove photo"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : field.type === "date" ? (
                            <input
                              type="date"
                              value={personalizationValues[fieldKey] || ""}
                              onChange={(e) =>
                                setPersonalizationValues({
                                  ...personalizationValues,
                                  [fieldKey]: e.target.value,
                                })
                              }
                              className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:border-rose-500 font-mono"
                            />
                          ) : field.type === "select" && field.options ? (
                            <select
                              value={personalizationValues[fieldKey] || ""}
                              onChange={(e) =>
                                setPersonalizationValues({
                                  ...personalizationValues,
                                  [fieldKey]: e.target.value,
                                })
                              }
                              className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:border-rose-500 font-bold"
                            >
                              <option value="">Select an option...</option>
                              {field.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              maxLength={maxLen || 50}
                              value={personalizationValues[fieldKey] || ""}
                              onChange={(e) =>
                                setPersonalizationValues({
                                  ...personalizationValues,
                                  [fieldKey]: e.target.value,
                                })
                              }
                              placeholder={field.placeholder || "e.g. Priya & Rohan"}
                              className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:border-rose-500"
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    // Default fallback personalization inputs if no specific schema
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-stone-800 block mb-1">
                          Custom Engraving Text / Names
                        </label>
                        <input
                          type="text"
                          maxLength={35}
                          value={personalizationValues["custom_text"] || ""}
                          onChange={(e) =>
                            setPersonalizationValues({
                              ...personalizationValues,
                              custom_text: e.target.value,
                            })
                          }
                          placeholder="e.g. Priya & Rohan Forever"
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gift Wrap Addon Option */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
              <input
                type="checkbox"
                id="giftwrap-opt"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
                className="mt-1 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="giftwrap-opt" className="text-xs cursor-pointer space-y-0.5">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                  <span>Add Luxury Gift Wrap & Handwritten Card (+₹99)</span>
                </span>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Nestled in champagne satin ribbon, sealed with wax stamp, and accompanied by a seed-embedded greeting card.
                </p>
              </label>
            </div>

            {/* Quantity Selector & Desktop Add To Cart */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="min-w-[36px] h-9 px-3 text-stone-600 hover:bg-stone-50 font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-xs font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.inventory || 10, quantity + 1))}
                    className="min-w-[36px] h-9 px-3 text-stone-600 hover:bg-stone-50 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Desktop CTAs */}
              <div className="hidden md:grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.inventory === 0}
                  className="py-3.5 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Gift Bag</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.inventory === 0}
                  className="py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-600/20"
                >
                  <span>Instant Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Delivery Pincode Checker */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-stone-500" />
                <span>Estimate Delivery Date:</span>
              </span>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit PIN code..."
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
                >
                  Check
                </button>
              </form>
              {deliveryEstimate && (
                <p className="text-[11px] font-semibold text-rose-700 pt-1">{deliveryEstimate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-16 pt-12 border-t border-stone-200 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                Verified Recipient Reviews ({reviews.length})
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Authentic feedback from happy gift givers
              </p>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors self-start sm:self-auto"
            >
              Write a Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-stone-200">
              <Star className="w-7 h-7 text-amber-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-stone-800">No reviews yet for this keepsake</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Be the first to share your gifting story with us!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-stone-900">{rev.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="font-semibold text-stone-700">{rev.userName}</span>
                    {rev.verifiedPurchase && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified Buyer
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Dynamic Related Products */}
        {relatedProducts.length > 0 && (
          <ProductSection
            title="You May Also Love"
            subtitle="Frequently gifted together with this keepsake"
            products={relatedProducts}
            mobileLayout="carousel"
            className="mt-16"
          />
        )}
      </Container>

      {/* MOBILE STICKY BOTTOM ACTION BAR (Section 26) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 w-full max-w-full bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-40 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[9px] uppercase font-bold text-stone-400 block leading-tight">Total</span>
          <span className="text-base font-black text-stone-900 font-mono">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <button
            onClick={handleAddToCart}
            disabled={product.inventory === 0}
            className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-stone-900 text-white font-bold text-xs active:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            Add to Bag
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.inventory === 0}
            className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-rose-600 text-white font-bold text-xs active:bg-rose-700 disabled:opacity-50 shadow-md shadow-rose-600/20 transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            onClick={() => setShowReviewModal(false)}
            className="fixed inset-0"
          />
          <div className="relative z-10 bg-white rounded-3xl max-w-md w-full shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-stone-100 bg-white flex-shrink-0">
              <h3 className="font-black text-base text-stone-900">Review This Gift</h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Gorgeous anniversary frame!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Your Experience *</label>
                <textarea
                  rows={4}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tell other gift givers about the packaging, quality, and recipient reaction..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2.5 rounded-xl text-stone-600 font-bold hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
