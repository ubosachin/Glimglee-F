import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { Review } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const status = searchParams.get("status");

    if (!isMongoConfigured) {
      return NextResponse.json({ reviews: [] });
    }

    const db = await getDb();
    const col = db.collection<Review>("reviews");

    const filter: any = {};
    if (productId) filter.productId = productId;
    if (status) filter.status = status;
    else if (productId) filter.status = "approved"; // Public views only approved

    const reviews = await col.find(filter).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ reviews });
  } catch (err: any) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json({ error: err?.message, reviews: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const reviewData: Omit<Review, "id" | "createdAt" | "status"> = await req.json();

    if (!reviewData.productId || !reviewData.rating || !reviewData.userName) {
      return NextResponse.json(
        { error: "productId, rating, and userName are required" },
        { status: 400 }
      );
    }

    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      status: "approved",
      createdAt: new Date().toISOString(),
    };

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true, review: newReview });
    }

    const db = await getDb();
    await db.collection("reviews").insertOne(newReview);

    return NextResponse.json({ success: true, review: newReview });
  } catch (err: any) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true });
    }

    const db = await getDb();
    await db.collection("reviews").updateOne({ id }, { $set: { status } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PATCH /api/reviews error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
