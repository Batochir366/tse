"use client";

import { motion } from "framer-motion";
import EmptyState from "./EmptyState";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (row: T) => string;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "Өгөгдөл байхгүй",
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#efeadb",
        backdropFilter: "blur(10px)",
        boxShadow: `
          6px 6px 12px rgba(0,0,0,0.08),
          -6px -6px 12px rgba(255,255,255,0.5)
        `,
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(12,117,111,0.1)",
                background: "rgba(12,117,111,0.04)",
              }}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#0c756f" }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-sm"
                  style={{ color: "#0c756f99" }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "#0c756f", borderTopColor: "transparent" }}
                    />
                    Ачааллаж байна...
                  </div>
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-6">
                  <EmptyState size="compact" message={emptyMessage} className="py-2" />
                </td>
              </tr>
            )}
            {!loading &&
              data.map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      "rgba(12,117,111,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      "transparent";
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-5 py-3 text-sm"
                      style={{ color: "#000201" }}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
