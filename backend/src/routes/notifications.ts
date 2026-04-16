import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  listMyNotifications,
  markNotificationRead,
} from "../controllers/notificationController";

const router = Router();

router.get("/", protect, listMyNotifications);
router.patch("/:id/read", protect, markNotificationRead);

export default router;
