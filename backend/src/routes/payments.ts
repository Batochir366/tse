import { Router } from "express";
import {
  createInvoice,
  qpayCallback,
  qpayCheckStatus,
  getMyPayments,
  getAllPayments,
  cancelPendingPayment,
  resumePayment,
} from "../controllers/paymentController";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/adminMiddleware";

const router = Router();

router.post("/invoice", protect, createInvoice);
router.post("/cancel/:paymentId", protect, cancelPendingPayment);
router.get("/callback", qpayCallback); // QPay webhook — auth хэрэггүй
router.post("/check-status", qpayCheckStatus); // Хэрэглэгч гараар шалгах
router.get("/my", protect, getMyPayments);
router.get("/resume/:paymentId", protect, resumePayment);
router.get("/all", protect, isAdmin, getAllPayments);

export default router;
