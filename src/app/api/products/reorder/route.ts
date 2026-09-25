import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { invalidateCacheKey } from "@/lib/cache/apiCache";

interface ReorderItem {
  id: string;
  displayOrder: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: ReorderItem[] = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items array is required with at least one product" },
        { status: 400 }
      );
    }

    // Invalidate API products cache so changes show immediately
    await invalidateCacheKey("products");

    if (!isMongoConfigured) {
      return NextResponse.json({
        success: true,
        updatedCount: items.length,
        warning: "MongoDB not configured, processed in memory mode.",
      });
    }

    const db = await getDb();
    const col = db.collection("products");

    const now = new Date().toISOString();
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { id: item.id },
        update: {
          $set: {
            displayOrder: Number(item.displayOrder),
            sortOrder: Number(item.displayOrder),
            updatedAt: now,
          },
        },
      },
    }));

    const result = await col.bulkWrite(bulkOps, { ordered: false });

    return NextResponse.json({
      success: true,
      updatedCount: result.modifiedCount || items.length,
      matchedCount: result.matchedCount,
    });
  } catch (error: any) {
    console.error("POST /api/products/reorder error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update product order" },
      { status: 500 }
    );
  }
}
