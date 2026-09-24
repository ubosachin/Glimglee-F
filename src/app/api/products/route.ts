import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { Product } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const occasion = searchParams.get("occasion");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "featured";
    const isCustomizable = searchParams.get("isCustomizable");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!isMongoConfigured) {
      return NextResponse.json({ products: [] });
    }

    const db = await getDb();
    const col = db.collection<Product>("products");

    if (slug) {
      const product = await col.findOne({ slug });
      return NextResponse.json({ product: product || null });
    }

    if (id) {
      const product = await col.findOne({ id });
      return NextResponse.json({ product: product || null });
    }

    // Build filter query
    const filter: any = {};

    if (category && category !== "all") {
      filter.$or = [{ categorySlug: category }, { categoryId: category }];
    }

    if (categoryId && categoryId !== "all") {
      filter.categoryId = categoryId;
    }

    if (occasion && occasion !== "all") {
      filter.occasions = { $in: [occasion] };
    }

    if (isCustomizable === "true") {
      filter.isCustomizable = true;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    if (sort === "price-asc") sortOptions = { price: 1 };
    else if (sort === "price-desc") sortOptions = { price: -1 };
    else if (sort === "rating") sortOptions = { rating: -1, reviewCount: -1 };
    else if (sort === "bestseller") sortOptions = { bestseller: -1, rating: -1 };

    const products = await col
      .find(filter)
      .sort(sortOptions)
      .skip(offset)
      .limit(limit)
      .toArray();

    return NextResponse.json({ products });
  } catch (err: any) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: err?.message, products: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const product: Product = await req.json();

    if (!product || !product.name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    if (!isMongoConfigured) {
      return NextResponse.json({
        success: true,
        product,
        warning: "MongoDB not connected; item processed in memory.",
      });
    }

    const db = await getDb();
    const col = db.collection("products");

    // Upsert by id
    await col.updateOne(
      { id: product.id },
      { $set: { ...product, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error("POST /api/products error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true });
    }

    const db = await getDb();
    await db.collection("products").deleteOne({ id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/products error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
