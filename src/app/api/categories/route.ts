import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { getOrSetCache, invalidateCacheKey } from "@/lib/cache/apiCache";
import { Category } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const cacheKey = `categories:${slug || ""}:${id || ""}:${includeInactive}`;

    const data = await getOrSetCache(cacheKey, 120, async () => {
      if (!isMongoConfigured) {
        return { categories: [] };
      }

      const db = await getDb();
      const col = db.collection<Category>("categories");

      if (slug) {
        const category = await col.findOne({ slug });
        return { category: category || null };
      }

      if (id) {
        const category = await col.findOne({ id });
        return { category: category || null };
      }

      const filter: any = {};
      if (!includeInactive) {
        filter.active = { $ne: false };
      }

      const categories = await col
        .find(filter)
        .sort({ order: 1, createdAt: -1 })
        .toArray();

      return { categories };
    });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (err: any) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json({ error: err?.message, categories: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const category: Category = await req.json();

    if (!category || !category.name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // Invalidate categories cache immediately
    invalidateCacheKey("categories");

    const id = category.id || `cat_${Date.now()}`;
    const payload = {
      ...category,
      id,
      slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      updatedAt: new Date().toISOString(),
    };

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true, category: payload });
    }

    const db = await getDb();
    const col = db.collection("categories");

    await col.updateOne({ id }, { $set: payload }, { upsert: true });

    return NextResponse.json({ success: true, category: payload });
  } catch (err: any) {
    console.error("POST /api/categories error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }

    // Invalidate categories cache immediately
    invalidateCacheKey("categories");

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true });
    }

    const db = await getDb();
    await db.collection("categories").deleteOne({ id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/categories error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
