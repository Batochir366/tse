"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import DataTable, { Column } from "../../../components/DataTable";
import { paymentsService } from "../../../lib/services/payments.service";
import { Payment } from "../../../lib/api/payments.api";
import { useToast, getErrMsg } from "../../../lib/toast";

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  PAID: { bg: "#dcfce7", text: "#16a34a", label: "Төлсөн" },
  PENDING: { bg: "#fef9c3", text: "#ca8a04", label: "Хүлээгдэж буй" },
  FAILED: { bg: "#fee2e2", text: "#dc2626", label: "Амжилтгүй" },
  CANCELLED: { bg: "#f3f4f6", text: "#6b7280", label: "Цуцалсан" },
};

export default function PaymentsPage() {
  const toast = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsService
      .getAll()
      .then((data) => setPayments(data as Payment[]))
      .catch((err) => toast.error(getErrMsg(err, "Төлбөр ачаалахад алдаа гарлаа")))
      .finally(() => setLoading(false));
  }, []);

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
        <p className="text-sm" style={{ color: "#0c756f99" }}>{payments.length} төлбөр</p>
        <DataTable columns={columns} data={payments} loading={loading} keyExtractor={(r) => r._id} emptyMessage="Төлбөрийн мэдээлэл байхгүй байна" />
      </div>
    </div>
  );
}
