import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import { encryptResponse } from "./middleware/encryptResponse";

import authRoutes from "./routes/auth";
import adminAuthRoutes from "./routes/adminAuth";
import courseRoutes from "./routes/courses";
import lessonRoutes from "./routes/lessons";
import paymentRoutes from "./routes/payments";
import merchRoutes from "./routes/merch";
import announcementRoutes from "./routes/announcements";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
    ],
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

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
