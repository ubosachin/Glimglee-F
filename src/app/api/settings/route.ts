import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { defaultStoreSettings } from "@/lib/config/defaults";
import { StoreSettings } from "@/lib/types";

export async function GET() {
  try {
    if (!isMongoConfigured) {
      return NextResponse.json({ settings: defaultStoreSettings });
    }

    const db = await getDb();
    const doc = await db.collection("settings").findOne({ _id: "store" as any });

    if (!doc) {
      return NextResponse.json({ settings: defaultStoreSettings });
    }

    const { _id, ...settings } = doc as any;
    return NextResponse.json({ settings });
  } catch (err: any) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json({ settings: defaultStoreSettings });
  }
}

export async function POST(req: NextRequest) {
  try {
    const settings: StoreSettings = await req.json();

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true, settings });
    }

    const db = await getDb();
    await db.collection("settings").updateOne(
      { _id: "store" as any },
      { $set: { ...settings, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error("POST /api/settings error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
