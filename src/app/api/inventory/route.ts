import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { InventoryLog, Product } from "@/lib/types";

export async function GET() {
  try {
    if (!isMongoConfigured) {
      return NextResponse.json({ logs: [] });
    }

    const db = await getDb();
    const logs = await db
      .collection<InventoryLog>("inventoryLogs")
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("GET /api/inventory error:", err);
    return NextResponse.json({ error: err?.message, logs: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productId, delta, reason, adminEmail } = await req.json();

    if (!productId || delta === undefined) {
      return NextResponse.json(
        { error: "productId and delta are required" },
        { status: 400 }
      );
    }

    if (!isMongoConfigured) {
      return NextResponse.json({ success: true, newStock: Math.max(0, delta) });
    }

    const db = await getDb();
    const productsCol = db.collection<Product>("products");
    const logsCol = db.collection<InventoryLog>("inventoryLogs");

    const prod = await productsCol.findOne({ id: productId });
    if (!prod) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const prevStock = prod.inventory || 0;
    const newStock = Math.max(0, prevStock + Number(delta));

    // Update product stock
    await productsCol.updateOne(
      { id: productId },
      { $set: { inventory: newStock, updatedAt: new Date().toISOString() } }
    );

    // Record audit log
    const log: InventoryLog = {
      id: `inv_${Date.now()}`,
      productId: prod.id,
      productName: prod.title || prod.name || "Product",
      sku: prod.sku || "N/A",
      changeType: Number(delta) >= 0 ? "add" : "deduct",
      quantity: Math.abs(Number(delta)),
      previousStock: prevStock,
      newStock,
      reason: reason || "Manual Adjustment",
      adminEmail: adminEmail || "admin@glimglee.com",
      timestamp: new Date().toISOString(),
    };

    await logsCol.insertOne(log);

    return NextResponse.json({ success: true, newStock, log });
  } catch (err: any) {
    console.error("POST /api/inventory error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
