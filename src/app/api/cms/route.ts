import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { defaultCMS } from "@/lib/config/defaults";
import { HomepageCMS } from "@/lib/types";

export async function GET() {
  try {
    if (!isMongoConfigured) {
      return NextResponse.json({ cms: defaultCMS });
    }

    const db = await getDb();
    const doc = await db.collection("cms").findOne({ _id: "homepage" as any });

    if (!doc) {
      return NextResponse.json({ cms: defaultCMS });
    }

    const { _id, ...cms } = doc as any;
    return NextResponse.json({ cms });
  } catch (err: any) {
    console.error("GET /api/cms error:", err);
    return NextResponse.json({ cms: defaultCMS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cms: HomepageCMS = await req.json();

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
