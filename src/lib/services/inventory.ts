import { InventoryLog } from "@/lib/types";
import { getProductById, saveProduct } from "./products";

const LOCAL_KEY = "glimglee_db_inventoryLogs";

function getLocalLogs(): InventoryLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLogs(logs: InventoryLog[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error("Failed to save local inventory logs:", e);
    }
  }
}

export async function getInventoryLogs(): Promise<InventoryLog[]> {
  let list: InventoryLog[] = [];

  if (typeof window === "undefined") {
    try {
      const { getDb, isMongoConfigured } = await import("@/lib/mongodb/client");
      if (isMongoConfigured) {
        const db = await getDb();
        const docs = await db
          .collection<InventoryLog>("inventoryLogs")
          .find({})
          .sort({ timestamp: -1 })
          .limit(100)
          .toArray();
        list = docs;
      }
    } catch (e) {
      console.warn("Direct mongo getInventoryLogs error:", e);
    }
  } else {
    try {
      const res = await fetch("/api/inventory", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          list = data.logs;
        }
      }
    } catch (e) {
      console.warn("Fetch /api/inventory error:", e);
    }
  }

  if (list.length === 0) {
    list = getLocalLogs();
  }

  list.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return list;
}

export async function adjustStock(
  productId: string,
  delta: number,
  reason: "Restock" | "Damage/Lost" | "Manual Adjustment" | "Sale",
  adminEmail = "admin@glimglee.com"
): Promise<{ success: boolean; newStock: number }> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, delta, reason, adminEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, newStock: data.newStock };
      }
    } catch (e) {
      console.warn("POST /api/inventory error:", e);
    }
  }

  // Fallback / local client adjustment
  const prod = await getProductById(productId);
  if (!prod) return { success: false, newStock: 0 };

  const prevStock = prod.inventory;
  const newStock = Math.max(0, prevStock + delta);

  await saveProduct({ ...prod, inventory: newStock });

  const log: InventoryLog = {
    id: `inv_${Date.now()}`,
    productId: prod.id,
    productName: prod.title || prod.name || "Product",
    sku: prod.sku || "N/A",
    changeType: delta >= 0 ? "add" : "deduct",
    quantity: Math.abs(delta),
    previousStock: prevStock,
    newStock,
    reason,
    adminEmail,
    timestamp: new Date().toISOString(),
  };

  const local = getLocalLogs();
  local.unshift(log);
  saveLocalLogs(local);

  return { success: true, newStock };
}
