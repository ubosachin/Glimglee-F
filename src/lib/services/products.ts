import { Product } from "@/lib/types";

const LOCAL_KEY = "glimglee_live_products";
const LEGACY_KEY = "glimglee_db_products";

// In-memory TTL cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let productsCache: CacheEntry<Product[]> | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds TTL

export function invalidateProductsCache() {
  productsCache = null;
}

function getLocalProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    if (localStorage.getItem(LEGACY_KEY)) {
      localStorage.removeItem(LEGACY_KEY);
    }
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list;
  } catch {
    return [];
  }
}

function saveLocalProducts(products: Product[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save local products:", e);
    }
  }
}

export interface ProductFilterOptions {
  category?: string;
  categoryId?: string;
  occasion?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  isCustomizable?: boolean;
  featured?: boolean;
  bestseller?: boolean;
  limitCount?: number;
  offset?: number;
}

export async function getProducts(options?: ProductFilterOptions): Promise<Product[]> {
  const now = Date.now();
  let list: Product[] = [];

  // Check in-memory cache first
  if (productsCache && now - productsCache.timestamp < CACHE_TTL_MS) {
    list = productsCache.data;
    // Check local storage for instant zero-latency start
    if (typeof window !== "undefined") {
      const local = getLocalProducts();
      if (local.length > 0) {
        list = local;
      }
    }

    if (typeof window === "undefined") {
      try {
        const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
        if (isMongoConfigured) {
          const db = await getDb();
          const docs = await db
            .collection<Product>("products")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
          list = docs;
        }
      } catch (err) {
        console.warn("Server direct MongoDB getProducts error:", err);
      }
    } else {
      // In the browser, fetch from the /api/products route with Edge caching
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products) && data.products.length > 0) {
            list = data.products;
          }
        }
      } catch (e) {
        console.warn("Fetch /api/products error, falling back to local storage:", e);
      }
    }

    if (list.length === 0) {
      list = getLocalProducts();
    }

    if (list.length > 0) {
      productsCache = {
        data: list,
        timestamp: now,
      };
      if (typeof window !== "undefined") {
        saveLocalProducts(list);
      }
    }
  }

  // Filter storefront products
  let filtered = [...list];

  const targetCategory = options?.category || options?.categoryId;
  if (targetCategory && targetCategory !== "all") {
    filtered = filtered.filter(
      (p) =>
        p.categoryId?.toLowerCase() === targetCategory.toLowerCase() ||
        p.category?.toLowerCase() === targetCategory.toLowerCase()
    );
  }

  if (options?.occasion && options.occasion !== "all") {
    filtered = filtered.filter((p) => {
      const occStr = Array.isArray(p.occasion) ? p.occasion.join(" ") : (p.occasion || "");
      return (
        occStr.toLowerCase().includes(options.occasion!.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase() === options.occasion!.toLowerCase())
      );
    });
  }

  if (options?.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= options.minPrice!);
  }

  if (options?.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= options.maxPrice!);
  }

  if (options?.isCustomizable) {
    filtered = filtered.filter(
      (p) =>
        p.isCustomizable ||
        p.personalization?.enabled ||
        (p.personalizationFields && p.personalizationFields.length > 0)
    );
  }

  if (options?.featured) {
    filtered = filtered.filter((p) => p.featured);
  }

  if (options?.bestseller) {
    filtered = filtered.filter((p) => p.bestseller);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        (p.title || p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.category || p.categoryId || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Dynamic sorting
  if (options?.sort) {
    switch (options.sort) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case "bestseller":
        filtered.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        break;
      default:
        break;
    }
  }

  if (options?.limitCount && options.limitCount > 0) {
    filtered = filtered.slice(0, options.limitCount);
  }

  return filtered;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (typeof window === "undefined") {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const p = await db.collection<Product>("products").findOne({
          $or: [{ slug }, { id: slug }],
        });
        if (p) return p;
      }
    } catch (e) {
      console.warn("Direct mongo getProductBySlug error:", e);
    }
  } else {
    try {
      const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.product) return data.product;
      }
    } catch (e) {
      console.warn("Fetch getProductBySlug error:", e);
    }
  }

  const products = await getProducts();
  return products.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (productsCache && Date.now() - productsCache.timestamp < CACHE_TTL_MS) {
    const found = productsCache.data.find((p) => p.id === id);
    if (found) return found;
  }

  if (typeof window === "undefined") {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const p = await db.collection<Product>("products").findOne({ id });
        if (p) return p;
      }
    } catch (e) {
      console.warn("Direct mongo getProductById error:", e);
    }
  } else {
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.product) return data.product;
      }
    } catch (e) {
      console.warn("Fetch getProductById error:", e);
    }
  }

  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

export async function getRelatedProducts(
  currentProductId: string,
  categoryId: string,
  tags: string[] = [],
  limitCount = 4
): Promise<Product[]> {
  const all = await getProducts();
  const candidates = all.filter((p) => p.id !== currentProductId && p.status !== "archived" && p.active !== false);

  const scored = candidates.map((p) => {
    let score = 0;
    if (p.categoryId === categoryId) score += 3;
    if (p.tags && tags.length > 0) {
      const match = p.tags.filter((t) => tags.includes(t)).length;
      score += match * 2;
    }
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limitCount).map((s) => s.product);
}

export async function saveProduct(product: Partial<Product> & { id?: string }): Promise<Product> {
  const id = product.id || `prod_${Date.now()}`;
  const now = new Date().toISOString();

  const fullProduct: Product = {
    id,
    name: product.name || product.title || "Untitled Gift",
    title: product.title || product.name || "Untitled Gift",
    slug: product.slug || `gift-${Date.now()}`,
    description: product.description || "",
    shortDescription: product.shortDescription || "",
    price: product.price ?? 0,
    compareAtPrice: product.compareAtPrice,
    categoryId: product.categoryId || "",
    category: product.category || "",
    images: product.images && product.images.length > 0 ? product.images : [],
    inventory: product.inventory ?? 0,
    lowStockThreshold: product.lowStockThreshold ?? 5,
    sku: product.sku || `GLM-${Date.now().toString().slice(-4)}`,
    tags: product.tags || [],
    occasion: Array.isArray(product.occasion)
      ? product.occasion
      : (product.occasion ? [product.occasion] : []),
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    isCustomizable: product.isCustomizable ?? false,
    personalizationFields: product.personalizationFields || [],
    personalization: product.personalization || {
      enabled: product.isCustomizable ?? false,
      fields: product.personalizationFields || [],
    },
    featured: product.featured ?? false,
    bestseller: product.bestseller ?? false,
    newArrival: product.newArrival ?? false,
    status: (product.status as any) || (product.active === false ? "archived" : "active"),
    active: product.active ?? (product.status !== "archived"),
    createdAt: product.createdAt || now,
    updatedAt: now,
  };

  // Persist to MongoDB via API or direct driver
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullProduct),
      });
    } catch (e) {
      console.warn("POST /api/products error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("products").updateOne(
          { id },
          { $set: fullProduct },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn("Server direct MongoDB saveProduct error:", e);
    }
  }

  const local = getLocalProducts();
  const idx = local.findIndex((p) => p.id === id);
  if (idx >= 0) {
    local[idx] = fullProduct;
  } else {
    local.unshift(fullProduct);
  }
  saveLocalProducts(local);
  invalidateProductsCache();

  return fullProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.warn("DELETE /api/products error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("products").deleteOne({ id });
      }
    } catch (e) {
      console.warn("Server direct MongoDB deleteProduct error:", e);
    }
  }

  const local = getLocalProducts().filter((p) => p.id !== id);
  saveLocalProducts(local);
  invalidateProductsCache();

  return true;
}
