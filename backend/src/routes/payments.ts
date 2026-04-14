import { Router } from "express";
import {
  createInvoice,
  getMyPayments,
  getAllPayments,
  qpayCheckStatus,
} from "../controllers/paymentController";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/adminMiddleware";

const router = Router();

router.post("/invoice", protect, createInvoice);
router.post("/check-status", qpayCheckStatus); // QPay дуудна — auth хэрэггүй
router.get("/my", protect, getMyPayments);
router.get("/all", protect, isAdmin, getAllPayments);

export default router;
