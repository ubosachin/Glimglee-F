import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { Order } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const orderNumber = searchParams.get("orderNumber");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!isMongoConfigured) {
      return NextResponse.json({ orders: [] });
    }

    const db = await getDb();
    const col = db.collection<Order>("orders");

    if (id || orderNumber) {
      const queryId = id || orderNumber || "";
      const order = await col.findOne({
        $or: [
          { id: queryId },
          { orderNumber: queryId },
          { orderNumber: `#${queryId}` },
        ],
      });
      return NextResponse.json({ order: order || null });
    }

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (status && status !== "all") filter.orderStatus = status;

    const orders = await col
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: err?.message, orders: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const order: Order = await req.json();

    if (!order || !order.items || order.items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 });
    }

    const id = order.id || `ord_${Date.now()}`;
    const orderNumber = order.orderNumber || `#GLM-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const payload: Order = {
      ...order,
      id,
      orderNumber,
      createdAt: order.createdAt || now,
      updatedAt: now,
    };

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true, order: payload });
    }

    const db = await getDb();
    const col = db.collection("orders");

    await col.updateOne({ id }, { $set: payload }, { upsert: true });

    return NextResponse.json({ success: true, order: payload });
  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Order id is required" }, { status: 400 });
    }

    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true, order: { id, ...payload } });
    }

    const db = await getDb();
    const col = db.collection("orders");

    const result = await col.findOneAndUpdate(
      { $or: [{ id }, { orderNumber: id }] },
      { $set: payload },
      { returnDocument: "after" }
    );

    return NextResponse.json({ success: true, order: result });
  } catch (err: any) {
    console.error("PATCH /api/orders error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
