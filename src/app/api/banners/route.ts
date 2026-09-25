import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { getOrSetCache, invalidateCacheKey } from "@/lib/cache/apiCache";
import { Banner } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get("placement");
    const activeOnly = searchParams.get("active") === "true";

    if (!isMongoConfigured) {
      return NextResponse.json({ banners: [] }, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }
      });
    }

    const db = await getDb();
    const col = db.collection<Banner>("banners");

    const filter: any = {};
    if (placement) filter.placement = placement;
    if (activeOnly) filter.active = true;

    const banners = await col
      .find(filter)
      .sort({ priority: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ banners }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("GET /api/banners error:", err);
    return NextResponse.json({ error: err?.message, banners: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const banner: Banner = await req.json();

    if (!banner || !banner.title) {
      return NextResponse.json({ error: "Banner title is required" }, { status: 400 });
    }

    // Invalidate banners cache immediately
    invalidateCacheKey("banners");

    const id = banner.id || `bnr_${Date.now()}`;
    const payload = {
      ...banner,
      id,
      updatedAt: new Date().toISOString(),
    };

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true, banner: payload });
    }

    const db = await getDb();
    const col = db.collection("banners");

    await col.updateOne({ id }, { $set: payload }, { upsert: true });

    return NextResponse.json({ success: true, banner: payload });
  } catch (err: any) {
    console.error("POST /api/banners error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Banner id is required" }, { status: 400 });
    }

    // Invalidate banners cache immediately
    invalidateCacheKey("banners");

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true });
    }

    const db = await getDb();
    await db.collection("banners").deleteOne({ id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/banners error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
