"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getProducts, getInventoryLogs, adjustProductStock } from "@/lib/services/storeDb";
import { Product, InventoryLog } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import {
  Archive,
  AlertTriangle,
  Plus,
  Minus,
  RotateCcw,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";

export default function AdminInventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<InventoryLog["reason"]>("Restock");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const [prods, auditLogs] = await Promise.all([getProducts(), getInventoryLogs()]);
      setProducts(prods);
      setLogs(auditLogs);
    }
    load();
  }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    await adjustProductStock(
      selectedProduct.id,
      stockDelta,
      adjustReason,
      user?.email || "admin@glimglee.com"
    );

    const [updatedProds, updatedLogs] = await Promise.all([getProducts(), getInventoryLogs()]);
    setProducts(updatedProds);
    setLogs(updatedLogs);

    setModalOpen(false);
    toast(`Adjusted stock for "${selectedProduct.name}" by ${stockDelta > 0 ? "+" : ""}${stockDelta}`, "success");
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Warehouse & Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Stock Management & Audit Logs
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Monitor real-time stock levels, prevent stockouts, and record warehouse adjustments.
          </p>
        </div>
      </div>

      {/* Stock Levels Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-base font-bold text-stone-900">Current Stock Levels</h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or SKU..."
              className="w-full text-xs bg-stone-50 pl-8 pr-3 py-2 rounded-xl border border-stone-200 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Quick Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.inventory <= 0;
                const isLowStock = p.inventory <= p.lowStockThreshold && p.inventory > 0;

                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200 flex items-center justify-center">
                          {p.images?.[0] || p.thumbnail ? (
                            <Image src={p.images?.[0] || p.thumbnail || ""} alt={p.name} fill className="object-cover" />
                          ) : (
                            <Archive className="w-4 h-4 text-stone-300" />
                          )}
                        </div>
                        <span className="font-bold text-stone-900 truncate max-w-xs">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-stone-600">{p.sku}</td>
                    <td className="py-3 px-4 font-black text-stone-900 text-sm">{p.inventory}</td>
                    <td className="py-3 px-4 text-stone-500">{p.lowStockThreshold} units</td>
                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          OUT OF STOCK
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          HEALTHY
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setStockDelta(20);
                          setAdjustReason("Restock");
                          setModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition-colors shadow-sm"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <Archive className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="font-semibold text-stone-700 text-xs">No inventory items found</p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Products added in the catalog will appear here for stock tracking.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="md:hidden divide-y divide-stone-100">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No inventory products matching search.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isOutOfStock = p.inventory <= 0;
              const isLowStock = p.inventory <= p.lowStockThreshold && p.inventory > 0;

              return (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200 flex items-center justify-center">
                      {p.images?.[0] || p.thumbnail ? (
                        <Image src={p.images?.[0] || p.thumbnail || ""} alt={p.name} fill className="object-cover" />
                      ) : (
                        <Archive className="w-5 h-5 text-stone-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 text-xs truncate">{p.name}</p>
                      <span className="font-mono text-[11px] text-stone-500">SKU: {p.sku}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-stone-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Current Stock</span>
                      <span className="font-black text-stone-900 text-sm">{p.inventory} units</span>
                    </div>
                    <div className="text-right">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          OUT OF STOCK
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          HEALTHY
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(p);
                      setStockDelta(20);
                      setAdjustReason("Restock");
                      setModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors shadow-sm active:scale-95"
                  >
                    Adjust Stock
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Audit History Log */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-stone-900">Inventory Adjustment History</h2>
        <p className="text-xs text-stone-500">Live trail of artisan restocks and customer order deductions.</p>

        <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="py-3 first:pt-0 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">{log.productName}</span>
                  <span className="font-mono text-stone-400">({log.sku})</span>
                </div>
                <p className="text-stone-500 text-[11px]">
                  Reason: <strong>{log.reason}</strong> {log.referenceId && `• Ref: ${log.referenceId}`} • By: {log.adminEmail}
                </p>
              </div>

              {(() => {
                const changeVal = log.change ?? (log.changeType === "deduct" ? -(log.quantity || 0) : (log.quantity || 0));
                return (
                  <div className="text-right">
                    <span className={`font-mono font-bold text-sm ${changeVal > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {changeVal > 0 ? `+${changeVal}` : changeVal}
                    </span>
                    <span className="block text-[10px] text-stone-400">
                      {log.previousStock} → {log.newStock}
                    </span>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>

      {/* Adjust Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              Adjust Stock: {selectedProduct.name}
            </h3>
            <p className="text-xs text-stone-500">Current stock: <strong>{selectedProduct.inventory}</strong></p>

            <form onSubmit={handleAdjust} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Stock Change Amount (+ or -)</label>
                <input
                  type="number"
                  required
                  value={stockDelta}
                  onChange={(e) => setStockDelta(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:ring-1 focus:ring-rose-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Reason for Adjustment</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as InventoryLog["reason"])}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none"
                >
                  <option value="Restock">Fresh Artisan Restock (+)</option>
                  <option value="Manual Adjustment">Manual Audit Correction</option>
                  <option value="Damaged/Lost">Damaged in Transit / Warehouse (-)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
