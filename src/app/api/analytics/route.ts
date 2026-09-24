import { NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { Order } from "@/lib/types";

export async function GET() {
  try {
    if (!isMongoConfigured) {
      return NextResponse.json({
        analytics: {
          totalRevenue: 0,
          totalOrders: 0,
          pendingOrdersCount: 0,
          averageOrderValue: 0,
          paidOrdersCount: 0,
          recentOrders: [],
        },
      });
    }

    const db = await getDb();
    const ordersCol = db.collection<Order>("orders");

    const orders = await ordersCol
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const pendingOrdersCount = orders.filter(
      (o) => o.orderStatus === "placed" || o.orderStatus === "processing"
    ).length;
    const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    return NextResponse.json({
      analytics: {
        totalRevenue,
        totalOrders,
        pendingOrdersCount,
        averageOrderValue,
        paidOrdersCount: paidOrders.length,
        recentOrders: orders.slice(0, 10),
      },
    });
  } catch (err: any) {
    console.error("GET /api/analytics error:", err);
    return NextResponse.json(
      {
        analytics: {
          totalRevenue: 0,
          totalOrders: 0,
          pendingOrdersCount: 0,
          averageOrderValue: 0,
          paidOrdersCount: 0,
          recentOrders: [],
        },
      },
      { status: 500 }
    );
  }
}
