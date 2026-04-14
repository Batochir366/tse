"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  AlertCircle,
  Loader2,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast, getErrMsg } from "@/lib/toast";

import { coursesService } from "@/lib/services/courses.service";
import { CourseDetail } from "@/lib/api/courses.api";
import { paymentService } from "@/lib/services/payment.service";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED"

interface PaymentData {
  paymentId: string;
  invoiceId: string;
  qrImage: string;
  qrText: string;
  urls?: {
    name: string;
    description: string;
    logo: string;
    link: string;
  }[];
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING");
  const [checking, setChecking] = useState(false);
  console.log(paymentData, "paymentData");
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

  const createInvoice = async () => {
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
  };

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentData?.invoiceId) return;

    setChecking(true);
    try {
      const status = await paymentService.checkStatus(paymentData.invoiceId);
      setPaymentStatus(status.status);

      if (status.status === "PAID") {
        toast.success("Төлбөр амжилттай төлөгдлөө!");
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
  }, [paymentData, courseId, router, toast]);



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

  return (
    <div className="min-h-screen bg-surface-alt">
      <header
        className="border-b"
        style={{ borderColor: "rgba(43, 95, 111, 0.1)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-foreground">
            Төлбөр төлөх
          </h1>
          <p className="text-muted">
            {course.name} курс
          </p>
        </motion.div>

        <div className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 bg-background"
            style={{
              boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7)",
            }}
          >
            <h2 className="text-xl font-bold mb-4 text-foreground">
              Төлбөрийн мэдээлэл
            </h2>

            <div className="space-y-3">
              <div
                className="flex justify-between items-center pb-3 border-b"
                style={{ borderColor: "rgba(43, 95, 111, 0.1)" }}
              >
                <span className="text-muted">Курсын нэр:</span>
                <span className="font-semibold text-foreground">{course.name}</span>
              </div>
              <div
                className="flex justify-between items-center pb-3 border-b"
                style={{ borderColor: "rgba(43, 95, 111, 0.1)" }}
              >
                <span className="text-muted">Үнэ:</span>
                <span className="font-semibold text-foreground">₮{course.price.toLocaleString()}</span>
              </div>
              <div
                className="flex justify-between items-center pb-3 border-b"
                style={{ borderColor: "rgba(43, 95, 111, 0.1)" }}
              >
                <span className="text-muted">Хугацаа:</span>
                <span className="font-semibold text-foreground">{course.durationDays} өдөр</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-primary">Нийт дүн:</span>
                <span className="text-2xl font-bold text-primary">₮{course.price.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {!paymentData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={createInvoice}
                disabled={creatingInvoice}
                whileHover={{ scale: creatingInvoice ? 1 : 1.02 }}
                whileTap={{ scale: creatingInvoice ? 1 : 0.98 }}
                className={`w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 ${creatingInvoice ? "bg-muted cursor-not-allowed" : "bg-primary"
                  }`}
                style={{
                  boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.25)",
                }}
              >
                {creatingInvoice ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Үүсгэж байна...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    QR код үүсгэх
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  QR код
                </h2>
                <div className="flex items-center gap-2">
                  {paymentStatus === "PENDING" && (
                    <>
                      <Clock className="w-5 h-5 text-[#f59e0b]" />
                      <span className="text-sm font-medium text-[#f59e0b]">
                        Хүлээгдэж байна
                      </span>
                    </>
                  )}
                  {paymentStatus === "PAID" && (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-sm font-medium text-success">
                        Төлөгдсөн
                      </span>
                    </>
                  )}
                  {paymentStatus === "FAILED" && (
                    <>
                      <AlertCircle className="w-5 h-5 text-error" />
                      <span className="text-sm font-medium text-error">
                        Амжилтгүй
                      </span>
                    </>
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

                <p className="text-center mb-4 text-muted">
                  QPay апп эсвэл банкны аппликейшнаар QR кодыг уншуулан төлбөр төлнө үү
                </p>

                {paymentData.urls && paymentData.urls.length > 0 && (
                  <div className="w-full space-y-2 mb-4">
                    <p className="text-sm font-medium mb-2 text-foreground">
                      Эсвэл дараах банкаар төлнө үү:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {paymentData.urls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-xl hover:opacity-80 transition-opacity bg-surface-alt"
                          style={{
                            boxShadow: "2px 2px 6px rgba(0,0,0,0.08), -2px -2px 6px rgba(255,255,255,0.9)",
                          }}
                        >
                          {url.logo && (
                            <img src={url.logo} alt={url.name} className="w-6 h-6 object-contain" />
                          )}
                          <span className="text-sm font-medium text-foreground">
                            {url.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <motion.button
                  onClick={checkPaymentStatus}
                  disabled={checking || paymentStatus === "PAID"}
                  whileHover={{ scale: checking || paymentStatus === "PAID" ? 1 : 1.02 }}
                  whileTap={{ scale: checking || paymentStatus === "PAID" ? 1 : 0.98 }}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2 ${checking || paymentStatus === "PAID" ? "bg-muted cursor-not-allowed" : "bg-primary"
                    }`}
                  style={{
                    boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.25)",
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
                      Төлбөрийн төлөв шалгах
                    </>
                  )}
                </motion.button>
              </div>

              {paymentStatus === "PENDING" && (
                <div
                  className="mt-4 p-3 rounded-xl flex items-start gap-2"
                  style={{
                    background: "rgba(212, 165, 116, 0.1)",
                    border: "1px solid rgba(212, 165, 116, 0.3)",
                  }}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-accent-dark" />
                  <p className="text-sm text-accent-dark">
                    Төлбөр хийсний дараа автоматаар шалгагдах болно. Хэрэв шалгагдаагүй бол "Төлбөрийн төлөв шалгах" товчийг дарна уу.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
