import multer from "multer";
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./authMiddleware";

const maxBytes = 5 * 1024 * 1024; // 5MB

export const uploadAvatarMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes },
  fileFilter(_req, file, cb) {
    const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    if (!ok) {
      cb(new Error("Зөвхөн зургийн файл (JPEG, PNG, WebP, GIF)"));
      return;
    }
    cb(null, true);
  },
});

export function withAvatarUpload(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  uploadAvatarMemory.single("image")(req, res, (err: unknown) => {
    if (err) {
      const msg = err instanceof Error ? err.message : "Upload алдаа";
      res.status(400).json({ message: msg });
      return;
    }
    next();
  });
}
