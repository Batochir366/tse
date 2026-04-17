import "dotenv/config";
import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import connectDB from "./config/db";
import { encryptResponse } from "./middleware/encryptResponse";
import { initSocket } from "./socket";
import { expireStalePendingPayments } from "./services/paymentCancelService";
import {
  pruneExpiredCourseAccess,
  sendCourseAccessExpiringReminders,
} from "./services/courseAccessCronService";

import authRoutes from "./routes/auth";
import adminAuthRoutes from "./routes/adminAuth";
import courseRoutes from "./routes/courses";
import lessonRoutes from "./routes/lessons";
import paymentRoutes from "./routes/payments";
import merchRoutes from "./routes/merch";
import announcementRoutes from "./routes/announcements";
import notificationRoutes from "./routes/notifications";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT ?? 3000;

/** Өдөр бүр (анхдагч 04:00). Өөр хуваарь: PAYMENT_EXPIRY_CRON node-cron синтакс */
const PAYMENT_EXPIRY_CRON = process.env.PAYMENT_EXPIRY_CRON ?? "1 5 * * *";

initSocket(httpServer);

const defaultAllowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

function buildAllowedOrigins(): string[] {
  const fromEnv =
    process.env.CORS_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0) ?? [];
  return [...new Set([...defaultAllowedOrigins, ...fromEnv])];
}

app.use(
  cors({
    origin: buildAllowedOrigins(),
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Бусад бүх route-д шифрлэлт хэрэглэнэ
app.use(encryptResponse);

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Long Song Academy API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/merch", merchRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);

connectDB()
  .then(() => {
    cron.schedule(PAYMENT_EXPIRY_CRON, () => {
      void (async () => {
        await expireStalePendingPayments().catch((e: unknown) => {
          console.error("[cron] expireStalePendingPayments", e);
        });
        await sendCourseAccessExpiringReminders().catch((e: unknown) => {
          console.error("[cron] sendCourseAccessExpiringReminders", e);
        });
        await pruneExpiredCourseAccess().catch((e: unknown) => {
          console.error("[cron] pruneExpiredCourseAccess", e);
        });
      })();
    });
    console.log(
      `[cron] daily jobs (${PAYMENT_EXPIRY_CRON}): stale payments, course 7d reminders, prune expired courseAccess — set PAYMENT_EXPIRY_CRON to change`,
    );

    httpServer.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
