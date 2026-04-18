import { Request, Response } from "express";
import axios from "axios";
import mongoose from "mongoose";
import Payment, { type PaymentItemType } from "../models/Payment";
import Course from "../models/Course";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import { QPayInvoiceResponse, QPayCheckResponse } from "../types/qpay";
import { getIO } from "../socket";
import { createUserNotification } from "../services/userNotificationService";
import { getQpayToken, QPAY_BASE } from "../services/qpayTokenService";
import { cancelPendingPaymentDoc } from "../services/paymentCancelService";
import type { IPayment } from "../models/Payment";

const INVOICE_HOLD_MS = 10 * 60 * 1000;

function paymentCallbackUrl(paymentMongoId: string): string {
  return `${process.env.BACKEND_URL ?? "https://tse-5l34.onrender.com"}/api/payments/callback?invoice_id=${paymentMongoId}`;
}
interface QuickUser {
  id: string;
  last_name: string;
  first_name: string;
  mcc_code: string;
}

let quickUser: QuickUser = {
  id: "",
  last_name: "",
  first_name: "",
  mcc_code: "",
};

try {
  if (process.env.QUICK_USER) {
    quickUser = JSON.parse(process.env.QUICK_USER);
  }
} catch (e) {
  console.error("Invalid QUICK_USER JSON", e);
}

/** PENDING → PAID, курсын эрх, мэдэгдэл. Анх удаа PAID болсон үед л буцаана. */
async function finalizePaidCoursePayment(
  invoiceId: string,
  qpayPaymentId: string,
): Promise<IPayment | null> {
  const payment = await Payment.findOneAndUpdate(
    { qpayInvoiceId: invoiceId, status: "PENDING" },
    { status: "PAID", qpayPaymentId, paidAt: new Date() },
    { returnDocument: 'after' },
  );
  if (!payment) return null;

  let courseName: string | undefined;
  if (payment.itemType === "course") {
    const course = await Course.findById(payment.itemId).select(
      "durationDays name",
    );
    if (course) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + course.durationDays);
      await User.findByIdAndUpdate(payment.userId, {
        $push: { courseAccess: { courseId: payment.itemId, expiresAt } },
      });
      courseName = course.name;
    }
  }

  await createUserNotification(
    String(payment.userId),
    "payment_paid",
    courseName ? `Төлбөр амжилттай: ${courseName}` : "Төлбөр амжилттай",
    courseName
      ? `Таны «${courseName}» курсын эрх идэвхжлээ.`
      : "Төлбөр төлөгдөж баталгаажлаа.",
  );

  return payment;
}

// Хэрэглэгч — QPay invoice үүсгэж QR буцаана
export const createInvoice = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course || !course.isActive) {
    res.status(404).json({ message: "Курс олдсонгүй" });
    return;
  }

  const buyer = await User.findById(req.user!.id).select("courseAccess");
  if (!buyer) {
    res.status(401).json({ message: "Хэрэглэгч олдсонгүй" });
    return;
  }
  if (buyer.hasCourseAccess(course._id)) {
    res.status(409).json({
      message:
        "Та энэ курсыг одоогоор эзэмшиж байна. Эрхийн хугацаа дууссаны дараа дахин худалдан авна уу.",
    });
    return;
  }

  // Payment record үүсгэх
  const payment = await Payment.create({
    userId: req.user!.id,
    itemType: "course",
    itemId: courseId,
    amount: course.price,
    status: "PENDING",
  });

  try {
    const token = await getQpayToken();

    const invoiceRes = await axios.post<QPayInvoiceResponse>(
      `${QPAY_BASE}/invoice`,
      {
        merchant_id: quickUser.id,
        branch_code: "BRANCH_052",
        currency: "MNT",
        mcc_code: quickUser?.mcc_code ?? "",
        customer_name: quickUser.last_name + " " + quickUser.first_name,
        description: `${course.name} - ${payment._id}`,
        amount: payment.amount,
        customer_logo: "",
        callback_url: paymentCallbackUrl(String(payment._id)),
        bank_accounts: [
          {
            default: true,
            account_bank_code: "050000",
            account_number: "5676172124",
            account_name: "ГАНХУЯГ БАТ-ОЧИР",
            is_default: true,
          },
        ],
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log(invoiceRes, "invoiceRes");
    // QPay invoice id + QR (resume-д ашиглана)
    payment.qpayInvoiceId = invoiceRes.data.id;
    payment.invoiceExpiresAt = new Date(Date.now() + INVOICE_HOLD_MS);
    payment.qrImage = invoiceRes.data.qr_image;
    payment.qrText = invoiceRes.data.qr_text ?? "";
    payment.invoiceUrls = invoiceRes.data.urls ?? [];
    await payment.save();

    res.status(201).json({
      paymentId: payment._id,
      invoiceId: invoiceRes.data.id,
      qrImage: invoiceRes.data.qr_image,
      qrText: invoiceRes.data.qr_text,
      urls: invoiceRes.data.urls,
      expiresAt: payment.invoiceExpiresAt!.toISOString(),
    });
  } catch (err) {
    await Payment.findByIdAndDelete(payment._id);
    res.status(502).json({ message: "QPay холболтын алдаа" });
  }
};

// QPay GET callback — query invoice_id = Mongo Payment._id
export const qpayCallback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("callback worked");
  const paymentIdRaw = req.query.invoice_id;
  const mongoPaymentId =
    typeof paymentIdRaw === "string" ? paymentIdRaw : undefined;
  console.log("callback worked :", paymentIdRaw);

  // Query байхгүй — QPay зөвхөн URL шалгах GET
  if (!mongoPaymentId) {
    res.json({ status: "ok" });
    return;
  }

  const paymentDoc = await Payment.findById(mongoPaymentId);
  if (!paymentDoc?.qpayInvoiceId) {
    res.json({ received: true });
    return;
  }

  const invoice_id = paymentDoc.qpayInvoiceId;

  try {
    const token = await getQpayToken();
    const checkRes = await axios.post<QPayCheckResponse>(
      `${QPAY_BASE}/payment/check`,
      { invoice_id },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (checkRes.data.invoice_status === "PAID") {
      const qpayPaymentId = checkRes.data.payments?.[0]?.id ?? invoice_id;
      const payment = await finalizePaidCoursePayment(
        invoice_id,
        qpayPaymentId,
      );
      if (payment) {
        getIO().to(`payment:${invoice_id}`).emit("payment-success", {
          status: "PAID",
        });
      }
    }

    res.json({ received: true });
  } catch {
    res.status(500).json({ message: "Callback алдаа" });
  }
};

// Хэрэглэгч гараар шалгах — QPay callback дуудна — auth хэрэггүй
export const qpayCheckStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { invoice_id } = req.body;
  try {
    const token = await getQpayToken();

    // QPay-д төлбөр шалгах
    const checkRes = await axios.post<QPayCheckResponse>(
      `${QPAY_BASE}/payment/check`,
      {
        invoice_id: invoice_id,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const paid = checkRes.data.invoice_status === "PAID";

    if (paid) {
      const qpayPaymentId = checkRes.data.payments?.[0]?.id ?? invoice_id;
      await finalizePaidCoursePayment(invoice_id, qpayPaymentId);
      res.json({ status: "PAID", received: true });
      return;
    }

    res.json({ status: "PENDING", received: true });
  } catch {
    res.status(500).json({ message: "Callback алдаа" });
  }
};

// Хэрэглэгч — өөрийн төлбөрүүд (QR-гүй — жагсаалт хөнгөн)
export const getMyPayments = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const payments = await Payment.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .select("-qpayInvoiceId -qpayPaymentId -qrImage -qrText -invoiceUrls")
    .lean();

  const courseIds = payments
    .filter((p) => p.itemType === "course")
    .map((p) => p.itemId);
  const courses =
    courseIds.length > 0
      ? await Course.find({ _id: { $in: courseIds } })
          .select("name")
          .lean()
      : [];
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));

  const enriched = payments.map((p) => ({
    ...p,
    course:
      p.itemType === "course" ? courseMap.get(String(p.itemId)) : undefined,
  }));

  res.json(enriched);
};

// PENDING нэхэмжлэхийг дахин нээх (QR буцаах)
export const resumePayment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { paymentId } = req.params;

  const payment = await Payment.findOne({
    _id: paymentId,
    userId: req.user!.id,
    status: "PENDING",
  });

  if (!payment?.qpayInvoiceId || !payment.invoiceExpiresAt) {
    res.status(404).json({ message: "Төлбөр олдсонгүй" });
    return;
  }

  if (payment.invoiceExpiresAt <= new Date()) {
    res.status(410).json({
      message: "Нэхэмжлэхийн хугацаа дууссан. Шинэ нэхэмжлэх үүсгэнэ үү.",
    });
    return;
  }

  if (!payment.qrImage) {
    res.status(410).json({
      message: "QR мэдээлэл байхгүй. Шинэ нэхэмжлэх үүсгэнэ үү.",
    });
    return;
  }

  res.json({
    paymentId: payment._id,
    invoiceId: payment.qpayInvoiceId,
    qrImage: payment.qrImage,
    qrText: payment.qrText ?? "",
    urls: payment.invoiceUrls ?? [],
    expiresAt: payment.invoiceExpiresAt.toISOString(),
    courseId:
      payment.itemType === "course" ? String(payment.itemId) : undefined,
  });
};

type PaymentLeanRow = {
  itemType: PaymentItemType;
  itemId: unknown;
} & Record<string, unknown>;

async function attachCourseNamesToPayments(
  payments: PaymentLeanRow[],
): Promise<
  Array<PaymentLeanRow & { course?: { _id: unknown; name: string } }>
> {
  const courseIds = payments
    .filter((p) => p.itemType === "course")
    .map((p) => p.itemId) as mongoose.Types.ObjectId[];
  const courses =
    courseIds.length > 0
      ? await Course.find({ _id: { $in: courseIds } })
          .select("name")
          .lean()
      : [];
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));

  return payments.map((p) => ({
    ...p,
    course:
      p.itemType === "course" ? courseMap.get(String(p.itemId)) : undefined,
  }));
}

// Admin — бүх төлбөр (курсын нэрийг itemType=course үед хавсаргана)
// Query: limit байхгүй бол бүгдийг буцаана (dashboard). limit-тэй бол { items, total, page, pageSize }.
export const getAllPayments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const baseQuery = Payment.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  const limitRaw = req.query.limit;
  const parsedLimit =
    limitRaw !== undefined && String(limitRaw) !== ""
      ? parseInt(String(limitRaw), 10)
      : NaN;
  const usePagination = !Number.isNaN(parsedLimit) && parsedLimit > 0;

  if (!usePagination) {
    const payments = await baseQuery.lean();
    res.json(
      await attachCourseNamesToPayments(
        payments as unknown as PaymentLeanRow[],
      ),
    );
    return;
  }

  const pageSize = Math.min(100, Math.max(1, parsedLimit));
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const skip = (page - 1) * pageSize;

  const [payments, total] = await Promise.all([
    Payment.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Payment.countDocuments(),
  ]);

  const items = await attachCourseNamesToPayments(
    payments as unknown as PaymentLeanRow[],
  );
  res.json({ items, total, page, pageSize });
};

// Хэрэглэгч — PENDING төлбөрийг QPay болон DB дээр цуцлах
export const cancelPendingPayment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { paymentId } = req.params;

  const payment = await Payment.findOne({
    _id: paymentId,
    userId: req.user!.id,
    status: "PENDING",
  });

  if (!payment) {
    res.status(404).json({ message: "Төлбөр олдсонгүй" });
    return;
  }

  await cancelPendingPaymentDoc(payment);
  res.json({ ok: true });
};
