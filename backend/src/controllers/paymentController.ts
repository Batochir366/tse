import { Request, Response } from "express";
import axios from "axios";
import Payment from "../models/Payment";
import Course from "../models/Course";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

const QPAY_BASE = process.env.QPAY_BASE_URL ?? "https://quickqr.qpay.mn/v2";
const QPAY_USERNAME = process.env.QPAY_USERNAME ?? "";
const QPAY_PASSWORD = process.env.QPAY_PASSWORD ?? "";
const QPAY_TERMINAL_ID = process.env.QPAY_TERMINAL_ID ?? "";
const quickUser = process.env.QUICK_USER ?? ({} as any);
// QPay access token авах
export async function getQpayToken(): Promise<string> {
  const res = await axios.post(
    `${QPAY_BASE}/auth/token`,
    {
      terminal_id: QPAY_TERMINAL_ID,
    },
    {
      auth: { username: QPAY_USERNAME, password: QPAY_PASSWORD },
    },
  );
  return res.data.access_token;
}

// Хэрэглэгч — QPay invoice үүсгэж QR буцаана
export const createInvoice = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { courseId } = req.body;
  console.log("worked");
  const course = await Course.findById(courseId);
  if (!course || !course.isActive) {
    res.status(404).json({ message: "Курс олдсонгүй" });
    return;
  }
  console.log(course, "course");

  // Payment record үүсгэх
  const payment = await Payment.create({
    userId: req.user!.id,
    itemType: "course",
    itemId: courseId,
    amount: course.price,
    status: "PENDING",
  });
  console.log("payment:", payment);

  try {
    const token = await getQpayToken();

    const invoiceRes = await axios.post(
      `${QPAY_BASE}/invoice`,
      {
        merchant_id: quickUser.id,
        branch_code: "BRANCH_021",
        currency: "MNT",
        mcc_code: quickUser?.mcc_code ?? "",
        customer_name: quickUser.last_name + " " + quickUser.first_name,
        description: course.name,
        amount: payment.amount,
        customer_logo: "",
        callback_url: "https://microphysical-tameka-explicitly.ngrok-free.dev",
        bank_accounts: [
          {
            default: true,
            account_bank_code: "050000",
            account_number: "5676172124",
            account_name: "Бат-Очир Ганхуяг",
            is_default: true,
          },
        ],
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log(invoiceRes);
    // QPay invoice id хадгалах
    payment.qpayInvoiceId = invoiceRes.data.invoice_id;
    await payment.save();

    res.status(201).json({
      paymentId: payment._id,
      invoiceId: invoiceRes.data.id,
      qrImage: invoiceRes.data.qr_image,
      qrText: invoiceRes.data.qr_text,
      urls: invoiceRes.data.urls,
    });
  } catch (err) {
    await Payment.findByIdAndDelete(payment._id);
    res.status(502).json({ message: "QPay холболтын алдаа" });
  }
};

// QPay callback — төлбөр хийгдсэн үед QPay дуудна (no auth)
export const qpayCheckStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { invoice_id } = req.body;

  try {
    const token = await getQpayToken();

    // QPay-д төлбөр шалгах
    const checkRes = await axios.post(
      `${QPAY_BASE}/payment/check`,
      {
        invoice_id: invoice_id,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log(checkRes.data, "checkRes");
    const paid = checkRes.data?.count > 0;

    if (paid) {
      const qpayPaymentId = checkRes.data?.rows?.[0]?.payment_id ?? invoice_id;

      const payment = await Payment.findOneAndUpdate(
        { qpayInvoiceId: invoice_id, status: "PENDING" },
        { status: "PAID", qpayPaymentId, paidAt: new Date() },
        { new: true },
      );

      if (payment?.itemType === "course") {
        const course = await Course.findById(payment.itemId).select(
          "durationDays",
        );
        if (course) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + course.durationDays);
          await User.findByIdAndUpdate(payment.userId, {
            $push: { courseAccess: { courseId: payment.itemId, expiresAt } },
          });
        }
      }

      res.json({ status: "PAID", received: true });
      return;
    }

    res.json({ status: "PENDING", received: true });
  } catch {
    res.status(500).json({ message: "Callback алдаа" });
  }
};

// Хэрэглэгч — өөрийн төлбөрүүд
export const getMyPayments = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const payments = await Payment.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .select("-qpayInvoiceId -qpayPaymentId");
  res.json(payments);
};

// Admin — бүх төлбөр (курсын нэрийг itemType=course үед хавсаргана)
export const getAllPayments = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const payments = await Payment.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
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
