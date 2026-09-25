export interface PersonalizationField {
  id: string;
  type: "text" | "textarea" | "date" | "image" | "select";
  label: string;
  name?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  helpText?: string;
  maxLength?: number;
}

export interface PersonalizationConfig {
  enabled: boolean;
  fields: PersonalizationField[];
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
  priceAdjustment?: number;
}

export interface Product {
  id: string;
  name: string;
  title?: string;
  slug: string;
  description: string;
  shortDescription?: string;
  story?: string;
  careInstructions?: string;
  categoryId: string;
  category?: string;
  subcategoryId?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  thumbnail?: string;
  variants?: ProductVariant[];
  personalization?: PersonalizationConfig;
  personalizationFields?: PersonalizationField[];
  isCustomizable?: boolean;
  inventory: number;
  lowStockThreshold: number;
  sku: string;
  tags: string[];
  occasion?: string[];
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  rating: number;
  reviewCount: number;
  displayOrder?: number;
  sortOrder?: number;
  status: "active" | "draft" | "archived";
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  imageUrl?: string;
  parentId?: string;
  order: number;
  featured?: boolean;
  active: boolean;
  productCount?: number;
  itemCount?: number;
  createdAt?: string;
}

export interface ShippingAddress {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  selectedVariant?: { name: string; value: string };
  personalizationData?: Record<string, string | number>;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount: number;
  giftWrap: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "cashfree" | "razorpay" | "upi" | "card" | "cod";
  paymentId?: string;
  orderStatus:
    | "placed"
    | "confirmed"
    | "processing"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  trackingNumber?: string;
  courierPartner?: string;
  notes?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariant?: { name: string; value: string };
  personalizationData?: Record<string, string | number>;
  giftWrap?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  active: boolean;
  autoApply?: boolean;
  description?: string;
  applicableCategories?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaText: string;
  ctaLink: string;
  priority: number;
  active: boolean;
  placement: "hero" | "mid_banner" | "promo_strip";
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  status: "approved" | "pending" | "hidden";
  featured?: boolean;
  createdAt: string;
}

export type UserRole = "CUSTOMER" | "ADMIN" | "MANAGER";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: UserRole;
  addresses?: ShippingAddress[];
  totalOrders: number;
  totalSpend: number;
  status: "active" | "disabled";
  notes?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BroadcastProductItem {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  slug: string;
}

export interface EmailBroadcast {
  id: string;
  subject: string;
  preheader?: string;
  badge?: string;
  heading: string;
  bodyText: string;
  heroImageUrl?: string;
  featuredProducts?: BroadcastProductItem[];
  promoCouponCode?: string;
  ctaText?: string;
  ctaLink?: string;
  senderName?: string;
  senderEmail?: string;
  recipientCount?: number;
  successCount?: number;
  failureCount?: number;
  status: "draft" | "sent" | "failed";
  sentAt?: string;
  createdAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  change?: number;
  changeType?: "add" | "deduct";
  quantity?: number;
  previousStock: number;
  newStock: number;
  reason: "Restock" | "Order Placed" | "Order Cancelled" | "Damaged/Lost" | "Damage/Lost" | "Manual Adjustment" | "Sale";
  referenceId?: string;
  adminEmail?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  resource: "product" | "category" | "order" | "inventory" | "coupon" | "cms" | "review";
  resourceId: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface HomepageCMS {
  announcement: string;
  heroBadge: string;
  heroHeading: string;
  heroSubheading: string;
  heroPrimaryCtaText: string;
  heroPrimaryCtaLink: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaLink: string;
  heroImage: string;
  trustHighlights: {
    icon: string;
    title: string;
    description: string;
  }[];
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number;
  freeShippingThreshold: number;
  standardShippingRate: number;
  expressShippingRate: number;
  giftWrapRate: number;
  address?: string;
}
