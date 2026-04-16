import axios from "axios";
import type { HydratedDocument } from "mongoose";
import Payment from "../models/Payment";
import type { IPayment } from "../models/Payment";
import { getIO } from "../socket";
import { getQpayToken, QPAY_BASE } from "./qpayTokenService";

/** PENDING баримтыг QPay + DB дээр цуцлах (cron болон HTTP хоёуланд). */
export async function cancelPendingPaymentDoc(
  payment: HydratedDocument<IPayment>,
): Promise<void> {
  const invoiceId = payment.qpayInvoiceId;

  const finalizeCancel = async (): Promise<void> => {
    payment.status = "CANCELLED";
    payment.qrImage = undefined;
    payment.qrText = undefined;
    payment.invoiceUrls = undefined;
    await payment.save();
    if (invoiceId) {
      getIO().to(`payment:${invoiceId}`).emit("payment-cancelled", {
        status: "CANCELLED",
      });
    }
  };

  if (!invoiceId) {
    await finalizeCancel();
    return;
  }

  try {
    const token = await getQpayToken();
    await axios.delete(`${QPAY_BASE}/invoice/${invoiceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("QPay cancel:", err);
  }

  await finalizeCancel();
}

const STALE_BATCH = 100;

/** `invoiceExpiresAt` өнгөрсөн PENDING-уудыг цуцлана. Дахин дуудагдахад үлдсэнүүдийг барина. */
export async function expireStalePendingPayments(): Promise<number> {
  const now = new Date();
  const stale = await Payment.find({
    status: "PENDING",
    invoiceExpiresAt: { $lte: now },
  }).limit(STALE_BATCH);

  let n = 0;
  for (const payment of stale) {
    try {
      await cancelPendingPaymentDoc(payment);
      n++;
    } catch (err) {
      console.error("[expireStalePendingPayments]", payment._id, err);
    }
  }
  if (n > 0) {
    console.log(
      `[expireStalePendingPayments] cancelled ${n} stale payment(s)`,
    );
  }
  return n;
}
