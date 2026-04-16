"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Camera,
  CreditCard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api/auth.api";
import { notificationsApi, type UserNotification } from "@/lib/api/notifications.api";
import { paymentService } from "@/lib/services/payment.service";
import type { Payment } from "@/lib/api/payment.api";
import { useToast, getErrMsg } from "@/lib/toast";

/** PENDING + нэхэмжлэхийн хугацаа одоогоос хойш дуусаагүй */
function isActivePendingPayment(p: Payment): boolean {
  if (p.status !== "PENDING") return false;
  if (!p.invoiceExpiresAt) return false;
  return new Date(p.invoiceExpiresAt).getTime() > Date.now();
}

export default function AccountPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading, logout, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwdOtpSent, setPwdOtpSent] = useState(false);
  const [pwdOtp, setPwdOtp] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  type PaymentTab = "all" | "pending" | "paid" | "other";
  const [paymentTab, setPaymentTab] = useState<PaymentTab>("all");

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone ?? "");
  }, [user]);

  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const list = await paymentService.getMyPayments();
      setPayments(list);
    } catch (err) {
      toast.error(getErrMsg(err, "Төлбөр ачаалахад алдаа гарлаа"));
    } finally {
      setPaymentsLoading(false);
    }
  }, [toast]);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const { data } = await notificationsApi.list(40);
      setNotifications(data);
    } catch (err) {
      toast.error(getErrMsg(err, "Мэдэгдэл ачаалахад алдаа гарлаа"));
    } finally {
      setNotifLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    void loadPayments();
    void loadNotifications();
  }, [user, loadPayments, loadNotifications]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await authApi.patchMe({ name, phone: phone.trim() });
      await refreshUser();
      toast.success("Хадгалагдлаа");
      void loadNotifications();
    } catch (err) {
      toast.error(getErrMsg(err, "Хадгалахад алдаа гарлаа"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRequestPwdOtp = async () => {
    setPwdBusy(true);
    try {
      await authApi.requestChangePasswordOtp();
      setPwdOtpSent(true);
      toast.success("И-мэйл рүү код илгээгдлээ");
    } catch (err) {
      toast.error(getErrMsg(err, "Код илгээхэд алдаа гарлаа"));
    } finally {
      setPwdBusy(false);
    }
  };

  const handleConfirmPwd = async () => {
    setPwdBusy(true);
    try {
      await authApi.confirmChangePassword({
        otp: pwdOtp.trim(),
        newPassword: pwdNew,
      });
      toast.success("Нууц үг солигдлоо");
      setPwdOtpSent(false);
      setPwdOtp("");
      setPwdNew("");
    } catch (err) {
      toast.error(getErrMsg(err, "Нууц үг солиход алдаа гарлаа"));
    } finally {
      setPwdBusy(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarUploading(true);
    try {
      await authApi.uploadAvatar(file);
      await refreshUser();
      toast.success("Зураг шинэчлэгдлээ");
      void loadNotifications();
    } catch (err) {
      toast.error(getErrMsg(err, "Зураг оруулахад алдаа гарлаа"));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const { data } = await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, readAt: data.readAt } : n)),
      );
    } catch {
      /* ignore */
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const filteredPayments = useMemo(() => {
    if (paymentTab === "all") {
      return payments.filter(
        (p) => p.status !== "PENDING" || isActivePendingPayment(p),
      );
    }
    if (paymentTab === "pending") {
      return payments.filter(isActivePendingPayment);
    }
    if (paymentTab === "paid") return payments.filter((p) => p.status === "PAID");
    return payments.filter(
      (p) =>
        p.status !== "PAID" &&
        (p.status !== "PENDING" || !isActivePendingPayment(p)),
    );
  }, [payments, paymentTab]);

  const paymentTabCounts = useMemo(() => {
    const pending = payments.filter(isActivePendingPayment).length;
    const paid = payments.filter((p) => p.status === "PAID").length;
    const other = payments.filter(
      (p) =>
        p.status !== "PAID" &&
        (p.status !== "PENDING" || !isActivePendingPayment(p)),
    ).length;
    const all = payments.filter(
      (p) => p.status !== "PENDING" || isActivePendingPayment(p),
    ).length;
    return { all, pending, paid, other };
  }, [payments]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const cardClass =
    "rounded-2xl bg-background p-5 sm:p-6 border border-[rgba(43,95,111,0.1)]";
  const cardShadow = {
    boxShadow:
      "4px 4px 10px rgba(0,0,0,0.06), -4px -4px 10px rgba(255,255,255,0.7)",
  };

  return (
    <div className="min-h-screen bg-surface-alt">
      <header
        className="border-b border-[rgba(43,95,111,0.1)]"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Хичээлүүд
          </Link>
          <motion.button
            type="button"
            onClick={() => void handleLogout()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="p-2 rounded-xl text-error bg-background"
            style={{
              boxShadow:
                "3px 3px 6px rgba(0,0,0,0.08), -3px -3px 6px rgba(255,255,255,0.85)",
            }}
            title="Гарах"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Миний бүртгэл
          </h1>
          <p className="text-sm text-muted mt-1">
            Профайл, төлбөр, мэдэгдлээ энд удирдана.
          </p>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cardClass}
          style={cardShadow}
        >
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-foreground">Профайл</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative w-24 h-24 rounded-2xl overflow-hidden bg-surface-alt flex items-center justify-center"
                style={{
                  boxShadow:
                    "inset 2px 2px 6px rgba(0,0,0,0.08), inset -2px -2px 6px rgba(255,255,255,0.85)",
                }}
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt=""
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User className="w-10 h-10 text-muted" />
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => void handleAvatarChange(e)}
                  disabled={avatarUploading}
                />
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-lg bg-primary/10">
                  <Camera className="w-3.5 h-3.5" />
                  Зураг солих
                </span>
              </label>
            </div>

            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="text-xs font-medium text-muted block mb-1">
                  Нэр
                </label>
                <input
                  className="w-full rounded-xl px-3 py-2.5 text-sm border border-[rgba(43,95,111,0.15)] bg-background text-foreground"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">
                  И-мэйл
                </label>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm bg-surface-alt text-muted border border-[rgba(43,95,111,0.08)]">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>

              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">
                  Утас
                </label>
                <input
                  className="w-full rounded-xl px-3 py-2.5 text-sm border border-[rgba(43,95,111,0.15)] bg-background text-foreground"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="89000000"
                />
              </div>
              <motion.button
                type="button"
                onClick={() => void handleSaveProfile()}
                disabled={savingProfile}
                whileHover={{ scale: savingProfile ? 1 : 1.02 }}
                whileTap={{ scale: savingProfile ? 1 : 0.98 }}
                className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary disabled:opacity-60"
                style={{ boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.25)" }}
              >
                {savingProfile ? "Хадгалж байна..." : "Хадгалах"}
              </motion.button>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cardClass}
          style={cardShadow}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-foreground">Нууц үг</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            Бүртгэлтэй и-мэйл рүү код илгээгдэнэ. Кодыг оруулж, шинэ нууц үгээ
            бичнэ үү.
          </p>
          {!pwdOtpSent ? (
            <motion.button
              type="button"
              onClick={() => void handleRequestPwdOtp()}
              disabled={pwdBusy}
              whileHover={{ scale: pwdBusy ? 1 : 1.02 }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-primary bg-primary/10 border border-primary/20"
            >
              {pwdBusy ? "Илгээж байна..." : "Код илгээх"}
            </motion.button>
          ) : (
            <div className="space-y-3 max-w-md">
              <div>
                <label className="text-xs font-medium text-muted block mb-1">
                  И-мэйлээр ирсэн код
                </label>
                <input
                  className="w-full rounded-xl px-3 py-2.5 text-sm border border-[rgba(43,95,111,0.15)] bg-background"
                  value={pwdOtp}
                  onChange={(e) => setPwdOtp(e.target.value)}
                  autoComplete="one-time-code"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">
                  Шинэ нууц үг (дор хаяж 8 тэмдэгт)
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl px-3 py-2.5 text-sm border border-[rgba(43,95,111,0.15)] bg-background"
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  type="button"
                  onClick={() => void handleConfirmPwd()}
                  disabled={pwdBusy}
                  whileHover={{ scale: pwdBusy ? 1 : 1.02 }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary disabled:opacity-60"
                  style={{ boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.25)" }}
                >
                  {pwdBusy ? "..." : "Нууц үг солих"}
                </motion.button>
                <button
                  type="button"
                  className="px-4 py-2.5 text-sm text-muted"
                  onClick={() => {
                    setPwdOtpSent(false);
                    setPwdOtp("");
                    setPwdNew("");
                  }}
                >
                  Болих
                </button>
              </div>
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cardClass}
          style={cardShadow}
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-foreground">Төлбөрийн түүх</h2>
          </div>
          {paymentsLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted">Төлбөрийн түүх байхгүй.</p>
          ) : (
            <>
              <div
                role="tablist"
                aria-label="Төлбөрийн ангилал"
                className="flex gap-1.5 overflow-x-auto pb-3 mb-1 -mx-1 px-1"
              >
                {(
                  [
                    { id: "all" as const, label: "Бүгд" },
                    { id: "pending" as const, label: "Хүлээгдэж байна" },
                    { id: "paid" as const, label: "Төлөгдсөн" },
                    { id: "other" as const, label: "Бусад" },
                  ] as const
                ).map((tab) => {
                  const count = paymentTabCounts[tab.id];
                  const active = paymentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setPaymentTab(tab.id)}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold border transition-colors ${active
                        ? "border-primary/35 bg-primary/10 text-primary"
                        : "border-[rgba(43,95,111,0.12)] bg-background text-muted hover:text-foreground hover:border-[rgba(43,95,111,0.2)]"
                        }`}
                    >
                      {tab.label}
                      <span
                        className={`tabular-nums rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs ${active ? "bg-primary/15" : "bg-surface-alt"
                          }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {filteredPayments.length === 0 ? (
                <p className="text-sm text-muted">
                  {paymentTab === "all"
                    ? payments.length > 0
                      ? "Идэвхтэй нэхэмжлэх байхгүй. Хугацаа дууссан төлбөрийг «Бусад» табаас харна уу."
                      : "Төлбөрийн түүх байхгүй."
                    : paymentTab === "pending"
                      ? "Хугацаа дуусаагүй идэвхтэй нэхэмжлэх байхгүй."
                      : paymentTab === "paid"
                        ? "Төлөгдсөн төлбөр байхгүй."
                        : "Энэ ангилалд төлбөр байхгүй."}
                </p>
              ) : (
                <ul className="space-y-2">
                  {filteredPayments.map((p) => {
                    const label =
                      p.itemType === "course" && p.course?.name
                        ? p.course.name
                        : p.itemType === "course"
                          ? "Курс"
                          : "Бараа";
                    const canResumePay =
                      isActivePendingPayment(p) && p.itemType === "course";
                    return (
                      <li
                        key={p._id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl px-3 py-3 bg-surface-alt border border-[rgba(43,95,111,0.08)]"
                      >
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {label}
                          </p>
                          <p className="text-xs text-muted tabular-nums">
                            ₮{p.amount.toLocaleString()} · {p.status} ·{" "}
                            {new Date(p.createdAt).toLocaleString("mn-MN")}
                          </p>
                        </div>
                        {canResumePay && (
                          <Link
                            href={`/payment/${p.itemId}?paymentId=${p._id}`}
                            className="text-center text-sm font-semibold text-white bg-primary px-4 py-2 rounded-xl shrink-0"
                            style={{
                              boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.2)",
                            }}
                          >
                            Төлөх
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className={cardClass}
          style={cardShadow}
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg text-foreground">Мэдэгдэл</h2>
            </div>
            <button
              type="button"
              className="text-xs text-primary font-medium"
              onClick={() => void loadNotifications()}
            >
              Шинэчлэх
            </button>
          </div>
          {notifLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted">Мэдэгдэл байхгүй.</p>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`rounded-xl px-3 py-3 border text-sm ${n.readAt
                    ? "bg-surface-alt border-[rgba(43,95,111,0.06)] opacity-80"
                    : "bg-background border-[rgba(43,95,111,0.12)]"
                    }`}
                >
                  <p className="font-semibold text-foreground">{n.title}</p>
                  <p className="text-muted text-xs mt-1">{n.body}</p>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="text-[10px] text-muted tabular-nums">
                      {new Date(n.createdAt).toLocaleString("mn-MN")}
                    </span>
                    {!n.readAt && (
                      <button
                        type="button"
                        className="text-[11px] font-medium text-primary"
                        onClick={() => void handleMarkRead(n._id)}
                      >
                        Уншсан
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </main>
    </div>
  );
}
