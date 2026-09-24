"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getAuditLogs } from "@/lib/services/storeDb";
import { AuditLog } from "@/lib/types";
import { FileText, Shield, Clock, ShieldAlert } from "lucide-react";

export default function AdminAuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    getAuditLogs().then(setLogs);
  }, []);

  const isAuthorized = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  if (user && !isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 bg-white rounded-3xl border border-stone-200 shadow-sm my-12">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900">Restricted Audit Trail</h3>
        <p className="text-xs text-stone-500">
          Only Super Administrators and Store Administrators have permissions to view immutable system audit logs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Security & Compliance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Administrator Audit Trail ({logs.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Immutable log of all catalog mutations, status overrides, and pricing modifications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-stone-100">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Admin Email</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Resource</th>
                <th className="py-3.5 px-4">Resource ID</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-900">{log.adminEmail}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 font-mono text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 capitalize font-semibold text-rose-600">
                    {log.resource}
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-500 text-[11px]">
                    {log.resourceId}
                  </td>
                  <td className="py-3 px-4 text-right text-stone-500">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
