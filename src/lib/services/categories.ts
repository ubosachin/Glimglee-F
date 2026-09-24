import { Category } from "@/lib/types";

const LOCAL_KEY = "glimglee_live_categories";
const LEGACY_KEY = "glimglee_db_categories";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let categoriesCache: CacheEntry<Category[]> | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60s TTL

export function invalidateCategoriesCache() {
  categoriesCache = null;
}

function getLocalCategories(): Category[] {
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

function saveLocalCategories(cats: Category[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(cats));
    } catch (e) {
      console.error("Failed to save local categories:", e);
    }
  }
}

export async function getCategories(includeInactive = false): Promise<Category[]> {
  const now = Date.now();
  let list: Category[] = [];

  if (categoriesCache && now - categoriesCache.timestamp < CACHE_TTL_MS) {
    list = categoriesCache.data;
    // Check local storage for instant zero-latency start
    if (typeof window !== "undefined") {
      const local = getLocalCategories();
      if (local.length > 0) {
        list = local;
      }
    }

    if (typeof window === "undefined") {
      try {
        const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
        if (isMongoConfigured) {
          const db = await getDb();
          const filter = includeInactive ? {} : { active: { $ne: false } };
          const docs = await db
            .collection<Category>("categories")
            .find(filter)
            .sort({ order: 1, createdAt: -1 })
            .toArray();
          list = docs;
        }
      } catch (e) {
        console.warn("Direct mongo getCategories error:", e);
      }
    } else {
      try {
        const res = await fetch(`/api/categories?includeInactive=${includeInactive}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.categories)) {
            list = data.categories;
          }
        }
      } catch (e) {
        console.warn("Fetch /api/categories error:", e);
      }
    }

    if (list.length === 0) {
      list = getLocalCategories();
    }

    if (list.length > 0) {
      categoriesCache = {
        data: list,
        timestamp: now,
      };
      if (typeof window !== "undefined") {
        saveLocalCategories(list);
      }
    }
  }

  const sorted = [...list].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  if (!includeInactive) {
    return sorted.filter((c) => c.active !== false);
  }

  return sorted;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories(true);
  return categories.find((c) => c.slug === slug || c.id === slug) || null;
}

export async function saveCategory(category: Partial<Category> & { id?: string }): Promise<Category> {
  const id = category.id || `cat_${Date.now()}`;
  const now = new Date().toISOString();

  const fullCategory: Category = {
    id,
    name: category.name || "New Collection",
    slug: category.slug || `category-${Date.now()}`,
    description: category.description || "",
    image: category.image || category.imageUrl || "",
    imageUrl: category.imageUrl || category.image || "",
    order: category.order ?? 10,
    featured: category.featured ?? false,
    active: category.active ?? true,
    productCount: category.productCount ?? category.itemCount ?? 0,
    itemCount: category.itemCount ?? category.productCount ?? 0,
    createdAt: category.createdAt || now,
  };

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullCategory),
      });
    } catch (e) {
      console.warn("POST /api/categories error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("categories").updateOne(
          { id },
          { $set: fullCategory },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn("Direct mongo saveCategory error:", e);
    }
  }

  const local = getLocalCategories();
  const idx = local.findIndex((c) => c.id === id);
  if (idx >= 0) {
    local[idx] = fullCategory;
  } else {
    local.push(fullCategory);
  }
  saveLocalCategories(local);
  invalidateCategoriesCache();
  return fullCategory;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.warn("DELETE /api/categories error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("categories").deleteOne({ id });
      }
    } catch (e) {
      console.warn("Direct mongo deleteCategory error:", e);
    }
  }

  const local = getLocalCategories().filter((c) => c.id !== id);
  saveLocalCategories(local);
  invalidateCategoriesCache();
  return true;
}
