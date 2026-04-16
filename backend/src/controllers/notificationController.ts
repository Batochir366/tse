import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import UserNotification from "../models/UserNotification";

export const listMyNotifications = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const raw = Number(req.query.limit);
  const limit = Number.isFinite(raw) ? Math.min(Math.max(raw, 1), 100) : 50;

  const items = await UserNotification.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json(items);
};

export const markNotificationRead = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const doc = await UserNotification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { readAt: new Date() },
    { new: true },
  ).lean();

  if (!doc) {
    res.status(404).json({ message: "Мэдэгдэл олдсонгүй" });
    return;
  }

  res.json(doc);
};
