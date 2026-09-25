import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { invalidateCacheKey } from "@/lib/cache/apiCache";
import { defaultCMS } from "@/lib/config/defaults";
import { HomepageCMS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    if (!isMongoConfigured) {
      return NextResponse.json(
        { cms: defaultCMS },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
      );
    }

    const db = await getDb();
    const doc = await db.collection("cms").findOne({ _id: "homepage" as any });

    if (!doc) {
      return NextResponse.json(
        { cms: defaultCMS },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
      );
    }

    const { _id, ...cms } = doc as any;
    return NextResponse.json(
      { cms },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/cms error:", err);
    return NextResponse.json(
      { cms: defaultCMS },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
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

    return NextResponse.json(
      { success: true, cms },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (err: any) {
    console.error("POST /api/cms error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
