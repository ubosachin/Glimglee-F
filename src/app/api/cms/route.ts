import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { getOrSetCache, invalidateCacheKey } from "@/lib/cache/apiCache";
import { defaultCMS } from "@/lib/config/defaults";
import { HomepageCMS } from "@/lib/types";

export async function GET() {
  try {
    const data = await getOrSetCache("cms:homepage", 180, async () => {
      if (!isMongoConfigured) {
        return { cms: defaultCMS };
      }

      const db = await getDb();
      const doc = await db.collection("cms").findOne({ _id: "homepage" as any });

      if (!doc) {
        return { cms: defaultCMS };
      }

      const { _id, ...cms } = doc as any;
      return { cms };
    });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=180, stale-while-revalidate=600",
      },
    });
  } catch (err: any) {
    console.error("GET /api/cms error:", err);
    return NextResponse.json({ cms: defaultCMS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cms: HomepageCMS = await req.json();

    // Invalidate CMS cache
    invalidateCacheKey("cms");

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true, cms });
    }

    const db = await getDb();
    await db.collection("cms").updateOne(
      { _id: "homepage" as any },
      { $set: { ...cms, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, cms });
  } catch (err: any) {
    console.error("POST /api/cms error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
