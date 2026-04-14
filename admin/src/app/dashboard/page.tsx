"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  GraduationCap,
  Megaphone,
  ChevronRight,
} from "lucide-react";
import Header from "../../components/Header";
import EmptyState from "../../components/EmptyState";
import StatCard from "../../components/StatCard";
import { coursesService } from "../../lib/services/courses.service";
import { paymentsService } from "../../lib/services/payments.service";
import { announcementsService } from "../../lib/services/announcements.service";
import { lessonsService } from "../../lib/services/lessons.service";
import { Payment } from "../../lib/api/payments.api";
import { useToast } from "../../lib/toast";
import { useDashboardSearch } from "../../context/DashboardSearchContext";
import { matchesSearch } from "../../lib/searchFilter";

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  PAID: { bg: "#dcfce7", text: "#16a34a", label: "Төлсөн" },
  PENDING: { bg: "#fef9c3", text: "#ca8a04", label: "Хүлээгдэж буй" },
  FAILED: { bg: "#fee2e2", text: "#dc2626", label: "Амжилтгүй" },
  CANCELLED: { bg: "#f3f4f6", text: "#6b7280", label: "Цуцалсан" },
};

export default function DashboardPage() {
  const toast = useToast();
  const { searchQuery } = useDashboardSearch();
  const [stats, setStats] = useState({
    courses: 0,
    payments: 0,
    lessons: 0,
    announcements: 0,
  });
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [courses, payments, lessons, announcements] = await Promise.allSettled([
          coursesService.getAll(),
          paymentsService.getAll(),
          lessonsService.getAll(),
          announcementsService.getAll(),
        ]);

        if (courses.status === "rejected") toast.error("Курс ачаалахад алдаа гарлаа");
        if (payments.status === "rejected") toast.error("Төлбөр ачаалахад алдаа гарлаа");
        if (lessons.status === "rejected") toast.error("Хичээл ачаалахад алдаа гарлаа");
        if (announcements.status === "rejected") toast.error("Мэдэгдэл ачаалахад алдаа гарлаа");

        setStats({
          courses:
            courses.status === "fulfilled" ? (courses.value as unknown[]).length : 0,
          payments:
            payments.status === "fulfilled" ? (payments.value as unknown[]).length : 0,
          lessons:
            lessons.status === "fulfilled" ? (lessons.value as unknown[]).length : 0,
          announcements:
            announcements.status === "fulfilled"
              ? (announcements.value as unknown[]).length
              : 0,
        });

        if (payments.status === "fulfilled") {
          const list = payments.value as Payment[];
          setRecentPayments(list.slice(-5).reverse());
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredRecentPayments = useMemo(
    () =>
      recentPayments.filter((p) => {
        const s = STATUS_STYLE[p.status] ?? STATUS_STYLE.PENDING;
        const userStr = p.user?.name ?? p.userId?.slice(0, 8) ?? "—";
        const courseStr =
          p.itemType === "merch"
            ? "Бараа"
            : p.course?.name ?? p.itemId?.slice(0, 8) ?? "—";
        const amountStr = `₮${p.amount?.toLocaleString() ?? "—"}`;
        const dateStr = p.createdAt
          ? new Date(p.createdAt).toLocaleDateString("mn-MN")
          : "—";
        return matchesSearch(
          searchQuery,
          userStr,
          courseStr,
          amountStr,
          s.label,
          dateStr
        );
      }),
    [recentPayments, searchQuery]
  );

  return (
    <div className="flex flex-col h-full">
      <Header />

      <div className="p-6 flex flex-col gap-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Нийт хичээл"
            value={loading ? "—" : stats.lessons}
            icon={GraduationCap}
            accent="#0c756f"
            delay={0}
          />
          <StatCard
            title="Нийт төлбөр"
            value={loading ? "—" : stats.payments}
            icon={CreditCard}
            accent="#fdcf6f"
            delay={0.07}
          />
          <StatCard
            title="Нийт курс"
            value={loading ? "—" : stats.courses}
            icon={Users}
            accent="#0c756f"
            delay={0.14}
          />
          <StatCard
            title="Мэдэгдэл"
            value={loading ? "—" : stats.announcements}
            icon={Megaphone}
            accent="#fdcf6f"
            delay={0.21}
          />
        </div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#efeadb",
            boxShadow: `
          6px 6px 12px rgba(0,0,0,0.08),
          -6px -6px 12px rgba(255,255,255,0.5)
        `,
          }}
        >
          {/* Table header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(12,117,111,0.08)" }}
          >
            <h2 className="font-semibold text-base" style={{ color: "#000201" }}>
              Сүүлийн төлбөрүүд
            </h2>
            <a
              href="/dashboard/payments"
              className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: "#0c756f" }}
            >
              Бүгдийг харах <ChevronRight size={14} />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "rgba(12,117,111,0.03)" }}>
                  {["Хэрэглэгч", "Курс", "Дүн", "Төлөв", "Огноо"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#0c756f" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm" style={{ color: "#0c756f99" }}>
                      Ачааллаж байна...
                    </td>
                  </tr>
                )}
                {!loading && recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4">
                      <EmptyState size="compact" message="Төлбөрийн мэдээлэл байхгүй байна" className="py-2" />
                    </td>
                  </tr>
                )}
                {!loading &&
                  recentPayments.length > 0 &&
                  filteredRecentPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4">
                        <EmptyState
                          size="compact"
                          message="Хайлтын үр дүн олдсонгүй"
                          className="py-2"
                        />
                      </td>
                    </tr>
                  )}
                {!loading &&
                  filteredRecentPayments.map((payment, idx) => {
                    const s =
                      STATUS_STYLE[payment.status] ?? STATUS_STYLE.PENDING;
                    return (
                      <motion.tr
                        key={payment._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background =
                            "rgba(12,117,111,0.03)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background =
                            "transparent";
                        }}
                      >
                        <td className="px-6 py-3 text-sm" style={{ color: "#000201" }}>
                          {payment.user?.name ?? payment.userId?.slice(0, 8) ?? "—"}
                        </td>
                        <td className="px-6 py-3 text-sm" style={{ color: "#000201" }}>
                          {payment.itemType === "merch"
                            ? "Бараа"
                            : payment.course?.name ?? payment.itemId?.slice(0, 8) ?? "—"}
                        </td>
                        <td className="px-6 py-3 text-sm font-medium" style={{ color: "#000201" }}>
                          ₮{payment.amount?.toLocaleString() ?? "—"}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: s.bg, color: s.text }}
                          >
                            {s.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm" style={{ color: "#0c756f99" }}>
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleDateString("mn-MN")
                            : "—"}
                        </td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
