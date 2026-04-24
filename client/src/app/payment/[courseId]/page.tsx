"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  Suspense,
} from "react";
import { io, Socket } from "socket.io-client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  QrCode,
  XCircle,
  CircleDollarSign,
  CreditCard,
  Smartphone,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast, getErrMsg } from "@/lib/toast";

import { coursesService } from "@/lib/services/courses.service";
import { CourseDetail } from "@/lib/api/courses.api";
import { paymentService } from "@/lib/services/payment.service";
import { EMPTY_VIDEO_POSTER_SRC, fallbackToEmptyVideoPoster } from "@/lib/media";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

function formatCountdownMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface PaymentData {
  paymentId: string;
  invoiceId: string;
  qrImage: string;
  qrText: string;
  expiresAt: string;
  urls?: {
    name: string;
    description: string;
    logo: string;
    link: string;
  }[];
}

function PaymentPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const courseId = params.courseId as string;
  const resumePaymentId = searchParams.get("paymentId");

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING");
  const [checking, setChecking] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [showAppUrls, setShowAppUrls] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const autoCancelFiredRef = useRef(false);

  const loadCourse = async () => {
    try {
      const data = await coursesService.getOne(courseId);
      setCourse(data);
    } catch (err) {
      toast.error(getErrMsg(err, "Курс ачаалахад алдаа гарлаа"));
      router.push("/courses");
    } finally {
      setLoadingCourse(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, []);

  useEffect(() => {
    if (!resumePaymentId || !user || !course || loadingCourse) return;

    let cancelled = false;

    void (async () => {
      setCreatingInvoice(true);
      try {
        const data = await paymentService.resumePayment(resumePaymentId);
        if (cancelled) return;
        if (data.courseId && data.courseId !== courseId) {
          toast.error("Энэ төлбөр өөр курсад хамаарна");
          router.replace(
            `/payment/${data.courseId}?paymentId=${resumePaymentId}`,
          );
          return;
        }
        setPaymentData({
          paymentId: data.paymentId,
          invoiceId: data.invoiceId,
          qrImage: data.qrImage,
          qrText: data.qrText,
          urls: data.urls,
          expiresAt: data.expiresAt,
        });
        setPaymentStatus("PENDING");
        toast.success("Нэхэмжлэх ачаалагдлаа");
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrMsg(err, "Нэхэмжлэх ачаалахад алдаа гарлаа"));
          router.replace(`/payment/${courseId}`);
        }
      } finally {
        if (!cancelled) setCreatingInvoice(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resumePaymentId, user, course, loadingCourse, courseId, router]);

  const createInvoice = useCallback(async () => {
    setCreatingInvoice(true);
    try {
      const data = await paymentService.createInvoice(courseId);
      setPaymentData(data);
      toast.success("QR код амжилттай үүсгэлээ");
    } catch (err) {
      toast.error(getErrMsg(err, "Төлбөр үүсгэхэд алдаа гарлаа"));
    } finally {
      setCreatingInvoice(false);
    }
  }, [courseId, toast]);

  useEffect(() => {
    if (loadingCourse || !course) return;
    if (!user) {
      toast.error("Төлбөр төлөхийн тулд нэвтэрнэ үү.");
      router.replace(`/courses/${courseId}`);
    }
  }, [loadingCourse, course, user, courseId, router, toast]);

  useEffect(() => {
    autoCancelFiredRef.current = false;
    setShowAppUrls(false);
  }, [paymentData?.paymentId]);

  useEffect(() => {
    if (!paymentData?.expiresAt) {
      setRemainingMs(0);
      return;
    }
    setRemainingMs(
      Math.max(
        0,
        new Date(paymentData.expiresAt).getTime() - Date.now(),
      ),
    );
  }, [paymentData?.expiresAt]);

  useEffect(() => {
    if (!paymentData?.invoiceId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.emit("watch-payment", paymentData.invoiceId);

    socket.on("payment-success", () => {
      setPaymentStatus("PAID");
      toast.success("Төлбөр амжилттай төлөгдлөө!");
      void (async () => {
        await refreshUser();
        setTimeout(() => {
          router.push(`/courses/${courseId}`);
        }, 2000);
      })();
    });

    socket.on("payment-cancelled", () => {
      let hadPendingPayment = false;
      setPaymentData((prev) => {
        if (!prev) return prev;
        hadPendingPayment = true;
        return null;
      });
      setPaymentStatus("PENDING");
      if (hadPendingPayment) {
        toast.info("Төлбөр цуцлагдлаа.");
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [paymentData?.invoiceId, refreshUser, router, courseId, toast]);

  useEffect(() => {
    if (!paymentData?.expiresAt || paymentStatus !== "PENDING") return;

    const expiresAtMs = new Date(paymentData.expiresAt).getTime();
    const paymentId = paymentData.paymentId;

    const tick = (): void => {
      const remaining = Math.max(0, expiresAtMs - Date.now());
      setRemainingMs(remaining);

      if (remaining <= 0 && !autoCancelFiredRef.current) {
        autoCancelFiredRef.current = true;
        void (async () => {
          try {
            await paymentService.cancelPayment(paymentId);
            toast.info(
              "Нэхэмжлэхийн хугацаа дууссан, төлбөр автоматаар цуцлагдлаа.",
            );
          } catch (err) {
            toast.error(getErrMsg(err, "Төлбөр цуцлахад алдаа гарлаа"));
          } finally {
            setPaymentData(null);
            setPaymentStatus("PENDING");
          }
        })();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [paymentData?.expiresAt, paymentData?.paymentId, paymentStatus]);

  const handleCancelPayment = async () => {
    if (!paymentData || remainingMs <= 0 || cancelling) return;
    setCancelling(true);
    try {
      await paymentService.cancelPayment(paymentData.paymentId);
      toast.info("Төлбөр цуцлагдлаа.");
      setPaymentData(null);
      setPaymentStatus("PENDING");
      setTimeout(() => {
        router.push(`/courses/${courseId}`);
      }, 2000);
    } catch (err) {
      toast.error(getErrMsg(err, "Төлбөр цуцлахад алдаа гарлаа"));
    } finally {
      setCancelling(false);
    }
  };

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentData?.invoiceId) return;

    setChecking(true);
    try {
      const status = await paymentService.checkStatus(paymentData.invoiceId);
      setPaymentStatus(status.status);

      if (status.status === "PAID") {
        toast.success("Төлбөр амжилттай төлөгдлөө!");
        await refreshUser();
        setTimeout(() => {
          router.push(`/courses/${courseId}`);
        }, 2000);
      } else if (status.status === "PENDING") {
        toast.info("Төлбөр хүлээгдэж байна");
      }
    } catch (err) {
      toast.error(getErrMsg(err, "Төлбөрийн төлөв шалгахад алдаа гарлаа"));
    } finally {
      setChecking(false);
    }
  }, [paymentData, courseId, router, toast, refreshUser]);



  if (loadingCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      <header
        className="border-b"
        style={{ borderColor: "rgba(43, 95, 111, 0.1)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
          <Link href={`/courses/${courseId}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary bg-background"
              style={{
                boxShadow: "3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.9)",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Буцах
            </motion.button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.28fr)] items-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div
              className="rounded-2xl overflow-hidden bg-background p-5 sm:p-6"
              style={{
                boxShadow:
                  "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7)",
              }}
            >
              <div className="flex items-center gap-2 text-foreground font-bold text-lg mb-4">
                <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                Курсын мэдээлэл
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 mb-4">
                <img
                  src={
                    course.coverImage?.trim()
                      ? course.coverImage
                      : EMPTY_VIDEO_POSTER_SRC
                  }
                  alt={course.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={fallbackToEmptyVideoPoster}
                />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2 leading-snug">
                {course.name}
              </h2>
              <p className="text-sm text-muted leading-relaxed mb-4 max-h-44 overflow-y-auto pr-1">
                {course.description}
              </p>
              <div
                className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted border-t pt-4"
                style={{ borderColor: "rgba(43, 95, 111, 0.12)" }}
              >
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  {course.lessons.length} хичээл
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                  {course.durationDays} өдөр эрх
                </span>
              </div>
            </div>

            {course.includedMerch.length > 0 && (
              <div
                className="rounded-2xl bg-background p-5 sm:p-6"
                style={{
                  boxShadow:
                    "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7)",
                }}
              >
                <div className="flex items-center gap-2 text-foreground font-bold text-base mb-3">
                  <Package className="w-5 h-5 text-primary shrink-0" />
                  Багцад орсон
                </div>
                <ul className="space-y-2 text-sm text-foreground">
                  {course.includedMerch.map((row, i) => {
                    const m = row.merchId;
                    const pop =
                      typeof m === "object" && m !== null ? m : null;
                    const name = pop?.name ?? "Бараа";
                    const imageUrl = pop?.imageUrl?.trim();
                    const rowKey =
                      pop?._id ?? (typeof m === "string" ? m : String(i));
                    return (
                      <li
                        key={rowKey}
                        className="flex items-center gap-3 border-b last:border-0 pb-2 last:pb-0"
                        style={{ borderColor: "rgba(43, 95, 111, 0.08)" }}
                      >
                        <div
                          className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-surface-alt flex items-center justify-center"
                          style={{
                            boxShadow:
                              "inset 1px 1px 3px rgba(0,0,0,0.06), inset -1px -1px 2px rgba(255,255,255,0.8)",
                          }}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <Package
                              className="w-5 h-5 text-muted"
                              aria-hidden
                            />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                          <span className="text-muted truncate">{name}</span>
                          <span className="font-medium tabular-nums shrink-0">
                            {row.quantity} ширхэг
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </motion.div>

          <div className="min-w-0">
            {!paymentData && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 sm:p-8 bg-background"
                style={{
                  boxShadow:
                    "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7)",
                }}
              >
                <div className="flex items-center gap-2 mb-6 pb-4 border-b" style={{ borderColor: "rgba(43, 95, 111, 0.12)" }}>
                  <CreditCard className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-bold text-lg text-foreground">Төлбөр</span>
                </div>
                <div
                  className="rounded-xl p-4 mb-6 space-y-2 text-sm bg-surface-alt"
                  style={{
                    boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="flex justify-between gap-2 text-muted">
                    <span>Курс</span>
                    <span className="font-medium text-foreground text-right line-clamp-2">
                      {course.name}
                    </span>
                  </div>
                  <div
                    className="flex justify-between pt-2 border-t font-semibold text-foreground"
                    style={{ borderColor: "rgba(43, 95, 111, 0.12)" }}
                  >
                    <span>Нийт дүн</span>
                    <span className="text-primary tabular-nums">
                      ₮{course.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={() => void createInvoice()}
                  disabled={creatingInvoice}
                  whileHover={{ scale: creatingInvoice ? 1 : 1.02 }}
                  whileTap={{ scale: creatingInvoice ? 1 : 0.98 }}
                  className={`w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer ${creatingInvoice ? "bg-muted cursor-not-allowed" : "bg-primary"
                    }`}
                  style={{
                    boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.25)",
                  }}
                >
                  {creatingInvoice ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Түр хүлээнэ үү...
                    </>
                  ) : (
                    <>
                      <CircleDollarSign className="w-5 h-5" />
                      Төлөх
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {paymentData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 bg-background"
                style={{
                  boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7)",
                }}
              >
                <div className="flex items-center justify-between mb-6 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <CreditCard className="w-5 h-5 text-primary shrink-0" />
                    <h2 className="text-xl font-bold text-foreground truncate">
                      Төлбөр
                    </h2>
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    {paymentStatus === "PENDING" && paymentData.expiresAt && (
                      <span
                        className="text-sm font-mono font-semibold tabular-nums text-primary"
                        aria-live="polite"
                      >
                        {formatCountdownMs(remainingMs)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className="rounded-2xl p-4 mb-4 bg-white"
                    style={{
                      boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.08), inset -2px -2px 4px rgba(255,255,255,0.9)",
                    }}
                  >
                    <img
                      src={`data:image/jpeg;base64, ${paymentData.qrImage}`}
                      alt="QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  </div>

                  <div className="flex gap-2">
                    {paymentData.urls &&
                      paymentData.urls.length > 0 &&
                      paymentStatus === "PENDING" && (
                        <motion.button
                          type="button"
                          onClick={() => setShowAppUrls((v) => !v)}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{
                            scale: 0.97,
                            boxShadow: `
                            inset 2px 2px 5px rgba(0,0,0,0.2),
                            inset -2px -2px 5px rgba(255,255,255,0.7)
                          `,
                          }}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                          style={{
                            background: "#efeadb",
                            color: "#0c756f",
                            boxShadow: `
                            4px 4px 10px rgba(0,0,0,0.1),
                            -4px -4px 10px rgba(255,255,255,0.8)
                          `,
                          }}
                        >
                          <Smartphone className="w-4 h-4" />
                          Төлөх
                          {showAppUrls ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </motion.button>
                      )}
                    <motion.button
                      onClick={checkPaymentStatus}
                      disabled={checking || paymentStatus === "PAID"}
                      whileHover={{ scale: checking || paymentStatus === "PAID" ? 1 : 1.03 }}
                      whileTap={{ scale: checking || paymentStatus === "PAID" ? 1 : 0.97 }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                      style={{
                        background:
                          checking || paymentStatus === "PAID"
                            ? "#e5e5e5"
                            : "rgba(12,117,111,0.15)",

                        color:
                          checking || paymentStatus === "PAID"
                            ? "#9ca3af"
                            : "#0c756f",

                        boxShadow:
                          checking || paymentStatus === "PAID"
                            ? `inset 2px 2px 5px rgba(0,0,0,0.1)`
                            : `
          4px 4px 10px rgba(0,0,0,0.12),
          -4px -4px 10px rgba(255,255,255,0.8)
        `,
                      }}
                    >
                      {checking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Шалгаж байна...
                        </>
                      ) : paymentStatus === "PAID" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Төлөгдсөн
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4" />
                          Төлбөр шалгах
                        </>
                      )}
                    </motion.button>

                    {paymentStatus === "PENDING" && (
                      <motion.button
                        type="button"
                        onClick={handleCancelPayment}
                        disabled={cancelling || remainingMs <= 0 || !paymentData}
                        whileHover={{
                          scale: cancelling || remainingMs <= 0 ? 1 : 1.03,
                        }}
                        whileTap={{
                          scale: cancelling || remainingMs <= 0 ? 1 : 0.97,
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                        style={{
                          background:
                            cancelling || remainingMs <= 0
                              ? "#e5e5e5"
                              : "rgba(220,38,38,0.12)",

                          color:
                            cancelling || remainingMs <= 0
                              ? "#9ca3af"
                              : "#dc2626",

                          boxShadow:
                            cancelling || remainingMs <= 0
                              ? `inset 2px 2px 5px rgba(0,0,0,0.1)`
                              : `
                        4px 4px 10px rgba(0,0,0,0.12),
                        -4px -4px 10px rgba(255,255,255,0.8)
                      `,
                        }}
                      >
                        {cancelling ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Цуцлаж байна...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Төлбөр цуцлах
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {paymentData.urls &&
                    paymentData.urls.length > 0 &&
                    showAppUrls && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full space-y-3 mt-1"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
                          {paymentData.urls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 rounded-2xl border border-white/45 bg-gradient-to-br from-background to-surface-alt text-foreground shadow-[inset_1px_1px_0_rgba(255,255,255,0.95),inset_-1px_-1px_0_rgba(43,95,111,0.04),4px_6px_10px_rgba(43,95,111,0.1),-3px_-4px_10px_rgba(255,255,255,0.85)] hover:shadow-[inset_1px_1px_0_rgba(255,255,255,0.85),3px_4px_8px_rgba(43,95,111,0.08),-2px_-3px_8px_rgba(255,255,255,0.8)] active:translate-y-px transition-shadow"
                            >
                              {url.logo && (
                                <img
                                  src={url.logo}
                                  alt={url.name}
                                  className="w-6 h-6 object-contain shrink-0"
                                />
                              )}
                              <span className="text-sm font-medium line-clamp-2">
                                {url.name}
                              </span>
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}

                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface-alt">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
