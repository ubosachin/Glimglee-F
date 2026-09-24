import { Order } from "@/lib/types";

const LOCAL_KEY = "glimglee_live_orders";
const LEGACY_KEY = "glimglee_db_orders";

function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    if (localStorage.getItem(LEGACY_KEY)) {
      localStorage.removeItem(LEGACY_KEY);
    }
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list;
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent("glimglee_orders_updated", { detail: orders }));
    } catch (e) {
      console.error("Failed to save local orders:", e);
    }
  }
}

export interface OrderQueryOptions {
  statusFilter?: string;
  userId?: string;
  limitCount?: number;
  offset?: number;
}

export async function getOrders(optionsOrStatus?: OrderQueryOptions | string): Promise<Order[]> {
  const options: OrderQueryOptions =
    typeof optionsOrStatus === "string"
      ? { statusFilter: optionsOrStatus }
      : optionsOrStatus || {};

  const { statusFilter, userId, limitCount } = options;
  let list: Order[] = [];

  if (typeof window === "undefined") {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const filter: any = {};
        if (statusFilter && statusFilter !== "all") filter.orderStatus = statusFilter;
        if (userId) filter.userId = userId;

        const docs = await db
          .collection<Order>("orders")
          .find(filter)
          .sort({ createdAt: -1 })
          .limit(limitCount && limitCount > 0 ? limitCount : 100)
          .toArray();
        list = docs;
      }
    } catch (e) {
      console.warn("Direct mongo getOrders error:", e);
    }
  } else {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (userId) params.set("userId", userId);
      if (limitCount) params.set("limit", limitCount.toString());

      const res = await fetch(`/api/orders?${params.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          list = data.orders;
        }
      }
    } catch (e) {
      console.warn("Fetch /api/orders error:", e);
    }
  }

  if (list.length === 0) {
    list = getLocalOrders();
  }

  list.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  if (statusFilter && statusFilter !== "all") {
    list = list.filter((o) => o.orderStatus === statusFilter);
  }
  if (userId) {
    list = list.filter((o) => o.userId === userId);
  }
  if (limitCount && limitCount > 0) {
    list = list.slice(0, limitCount);
  }

  return list;
}

export interface StoreAnalytics {
  totalRevenue: number;
  totalOrders: number;
  pendingOrdersCount: number;
  averageOrderValue: number;
  paidOrdersCount: number;
  recentOrders: Order[];
}

export async function getStoreAnalytics(): Promise<StoreAnalytics> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/analytics", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.analytics) {
          return data.analytics;
        }
      }
    } catch (e) {
      console.warn("Fetch /api/analytics error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const orders = await db
          .collection<Order>("orders")
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

        return {
          totalRevenue,
          totalOrders,
          pendingOrdersCount,
          averageOrderValue,
          paidOrdersCount: paidOrders.length,
          recentOrders: orders.slice(0, 10),
        };
      }
    } catch (e) {
      console.warn("Direct mongo analytics error:", e);
    }
  }

  const orders = await getOrders({ limitCount: 50 });
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === "placed" || o.orderStatus === "processing"
  ).length;
  const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  return {
    totalRevenue,
    totalOrders,
    pendingOrdersCount,
    averageOrderValue,
    paidOrdersCount: paidOrders.length,
    recentOrders: orders.slice(0, 10),
  };
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (typeof window === "undefined") {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const cleanId = id.replace(/^#/, "");
        const o = await db.collection<Order>("orders").findOne({
          $or: [
            { id },
            { orderNumber: id },
            { orderNumber: `#${cleanId}` },
            { orderNumber: cleanId },
          ],
        });
        if (o) return o;
      }
    } catch (e) {
      console.warn("Direct mongo getOrderById error:", e);
    }
  } else {
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) return data.order;
      }
    } catch (e) {
      console.warn("Fetch getOrderById error:", e);
    }
  }

  const orders = getLocalOrders();
  return (
    orders.find((o) => o.id === id || o.orderNumber === id || o.orderNumber === `#${id}`) || null
  );
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  const id = orderData.id || `ord_${Date.now()}`;
  const now = new Date().toISOString();
  const orderNumber = orderData.orderNumber || `#GLM-${Math.floor(100000 + Math.random() * 900000)}`;

  const fullOrder: Order = {
    id,
    orderNumber,
    userId: orderData.userId || "guest",
    customerEmail: orderData.customerEmail || "",
    customerName: orderData.customerName || "Gifting Customer",
    customerPhone: orderData.customerPhone || "",
    items: orderData.items || [],
    shippingAddress: orderData.shippingAddress || {
      fullName: orderData.customerName || "Recipient",
      email: orderData.customerEmail || "",
      addressLine1: "123 Gift Lane",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      phone: orderData.customerPhone || "",
    },
    subtotal: orderData.subtotal ?? 0,
    discount: orderData.discount ?? 0,
    giftWrap: orderData.giftWrap ?? 0,
    shipping: orderData.shipping ?? 0,
    tax: orderData.tax ?? 0,
    total: orderData.total ?? 0,
    couponCode: orderData.couponCode,
    paymentStatus: orderData.paymentStatus || "paid",
    paymentMethod: orderData.paymentMethod || "upi",
    paymentId: orderData.paymentId || `pay_${Date.now()}`,
    orderStatus: orderData.orderStatus || "placed",
    trackingNumber: orderData.trackingNumber,
    courierPartner: orderData.courierPartner || "Delhivery Express",
    notes: orderData.notes,
    createdAt: orderData.createdAt || now,
    updatedAt: now,
  };

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullOrder),
      });
    } catch (e) {
      console.warn("POST /api/orders error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("orders").updateOne(
          { id },
          { $set: fullOrder },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn("Direct mongo createOrder error:", e);
    }
  }

  const local = getLocalOrders();
  local.unshift(fullOrder);
  saveLocalOrders(local);

  return fullOrder;
}

export async function updateOrderStatus(
  id: string,
  statusOrUpdates: Order["orderStatus"] | Partial<Order>,
  trackingNumber?: string,
  courierPartner?: string
): Promise<Order | null> {
  const now = new Date().toISOString();
  let updatePayload: Record<string, any>;

  if (typeof statusOrUpdates === "object" && statusOrUpdates !== null) {
    updatePayload = {
      ...statusOrUpdates,
      updatedAt: now,
    };
  } else {
    updatePayload = {
      orderStatus: statusOrUpdates,
      updatedAt: now,
    };
    if (trackingNumber !== undefined) updatePayload.trackingNumber = trackingNumber;
    if (courierPartner !== undefined) updatePayload.courierPartner = courierPartner;
  }

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatePayload }),
      });
    } catch (e) {
      console.warn("PATCH /api/orders error:", e);
    }
  } else {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        await db.collection("orders").updateOne(
          { $or: [{ id }, { orderNumber: id }] },
          { $set: updatePayload }
        );
      }
    } catch (e) {
      console.warn("Direct mongo updateOrderStatus error:", e);
    }
  }

  const local = getLocalOrders();
  const idx = local.findIndex((o) => o.id === id || o.orderNumber === id);
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...updatePayload };
    saveLocalOrders(local);
    return local[idx];
  }

  return null;
}

export function subscribeToOrder(
  idOrOrderNumber: string,
  callback: (order: Order | null) => void
): () => void {
  const emitCurrent = () => {
    const orders = getLocalOrders();
    const found = orders.find(
      (o) =>
        o.id === idOrOrderNumber ||
        o.orderNumber === idOrOrderNumber ||
        o.orderNumber === `#${idOrOrderNumber}`
    );
    callback(found || null);
  };

  emitCurrent();

  // Also fetch latest from API in background
  if (typeof window !== "undefined") {
    fetch(`/api/orders?id=${encodeURIComponent(idOrOrderNumber)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) {
          callback(data.order);
        }
      })
      .catch(() => {});
  }

  const handleCustomUpdate = () => emitCurrent();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_KEY) emitCurrent();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("glimglee_orders_updated", handleCustomUpdate);
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("glimglee_orders_updated", handleCustomUpdate);
      window.removeEventListener("storage", handleStorage);
    }
  };
}
