"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../../components/Header";
import DataTable, { Column } from "../../../components/DataTable";
import { paymentsService } from "../../../lib/services/payments.service";
import { Payment } from "../../../lib/api/payments.api";
import { useToast, getErrMsg } from "../../../lib/toast";

const PAGE_SIZE = 15;

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  PAID: { bg: "#dcfce7", text: "#16a34a", label: "Төлсөн" },
  PENDING: { bg: "#fef9c3", text: "#ca8a04", label: "Хүлээгдэж буй" },
  FAILED: { bg: "#fee2e2", text: "#dc2626", label: "Амжилтгүй" },
  CANCELLED: { bg: "#f3f4f6", text: "#6b7280", label: "Цуцалсан" },
};

export default function PaymentsPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await paymentsService.getPage(p, PAGE_SIZE);
      setPayments(data.items);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      toastRef.current.error(getErrMsg(err, "Төлбөр ачаалахад алдаа гарлаа"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1);
  }, [loadPage]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns: Column<Payment>[] = [
    { key: "user", label: "Хэрэглэгч", render: (r: any) => r.userId?.name ?? r.userId?.name?.slice(0, 10) ?? "—" },
    {
      key: "course",
      label: "Курс",
      render: (r) =>
        r.itemType === "merch"
          ? "Бараа"
          : r.course?.name ?? r.itemId?.slice(0, 10) ?? "—",
    },
    { key: "amount", label: "Дүн", render: (r) => `₮${r.amount?.toLocaleString() ?? "—"}` },
    {
      key: "status", label: "Төлөв",
      render: (r) => {
        const s = STATUS_STYLE[r.status] ?? STATUS_STYLE.PENDING;
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: s.bg, color: s.text }}>
            {s.label}
          </span>
        );
      },
    },
    {
      key: "createdAt", label: "Огноо",
      render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString("mn-MN") : "—",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm" style={{ color: "#0c756f99" }}>
            Нийт {total} төлбөр
            {total > 0 ? ` · Хуудас ${page} / ${totalPages}` : null}
          </p>
          {total > PAGE_SIZE ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loading || page <= 1}
                onClick={() => loadPage(page - 1)}
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-40"
                style={{
                  background: "rgba(12,117,111,0.12)",
                  color: "#0c756f",
                }}
              >
                Өмнөх
              </button>
              <button
                type="button"
                disabled={loading || page >= totalPages}
                onClick={() => loadPage(page + 1)}
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-40"
                style={{
                  background: "rgba(12,117,111,0.12)",
                  color: "#0c756f",
                }}
              >
                Дараах
              </button>
            </div>
          ) : null}
        </div>
        <DataTable columns={columns} data={payments} loading={loading} keyExtractor={(r) => r._id} emptyMessage="Төлбөрийн мэдээлэл байхгүй байна" />
      </div>
    </div>
  );
}
