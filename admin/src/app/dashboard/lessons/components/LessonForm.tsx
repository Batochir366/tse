"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "lucide-react";
import Modal from "../../../../components/Modal";
import { lessonsService } from "../../../../lib/services/lessons.service";
import { Lesson } from "../../../../lib/api/lessons.api";
import { useToast, getErrMsg } from "../../../../lib/toast";
import { parseDriveFileId } from "../../../../lib/formatters";

const EMPTY_FORM = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnail: "",
};

const INPUT_BASE = {
  background: "rgba(255,255,255,0.7)",
  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06)",
  color: "#000201",
} as const;

interface Props {
  open: boolean;
  editing: Lesson | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function LessonForm({ open, editing, onClose, onSaved }: Props) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description,
        videoUrl: editing.videoUrl ?? "",
        thumbnail: editing.thumbnail ?? "",
      });
      setErrors({});
    } else {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing?._id]);

  const borderFor = (key: string) =>
    errors[key] ? "1px solid #f87171" : "1px solid rgba(12,117,111,0.15)";

  const parsedFileId = parseDriveFileId(form.videoUrl);
  const showIdPreview =
    form.videoUrl.includes("drive.google.com") &&
    parsedFileId !== form.videoUrl;

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Гарчиг оруулна уу";
    if (!form.videoUrl.trim()) errs.videoUrl = "Видео URL оруулна уу";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = { ...form, videoUrl: form.videoUrl };
      if (editing) {
        await lessonsService.update(editing._id, payload);
        toast.success("Хичээл амжилттай шинэчлэгдлээ");
      } else {
        await lessonsService.create(payload);
        toast.success("Хичээл амжилттай нэмэгдлээ");
      }
      onClose();
      onSaved();
    } catch (err) {
      toast.error(getErrMsg(err, "Хадгалахад алдаа гарлаа"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Хичээл засах" : "Шинэ хичээл"}>
      <div className="flex flex-col gap-3">
        {/* Гарчиг */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
            Гарчиг *
          </label>
          <input
            value={form.title}
            onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors((e2) => ({ ...e2, title: "" })); }}
            placeholder="Хичээлийн гарчиг"
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ ...INPUT_BASE, border: borderFor("title") }}
          />
          {errors.title && <p className="text-xs" style={{ color: "#dc2626" }}>{errors.title}</p>}
        </div>

        {/* Тайлбар */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
            Тайлбар
          </label>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Тайлбар"
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ ...INPUT_BASE, border: "1px solid rgba(12,117,111,0.15)" }}
          />
        </div>

        {/* Video URL */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
            Видео URL *
          </label>
          <div className="relative">
            <input
              value={form.videoUrl}
              onChange={(e) => { setForm((f) => ({ ...f, videoUrl: e.target.value })); setErrors((e2) => ({ ...e2, videoUrl: "" })); }}
              placeholder="https://drive.google.com/file/d/... эсвэл бусад видео URL"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none font-mono"
              style={{ ...INPUT_BASE, border: borderFor("videoUrl") }}
            />
          </div>
          {showIdPreview && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono"
              style={{ background: "rgba(12,117,111,0.08)", color: "#0c756f" }}
            >
              <Link size={11} />
              <span className="font-semibold">Preview URL:</span>
              <span>{parsedFileId}</span>
            </div>
          )}
          {errors.videoUrl && <p className="text-xs" style={{ color: "#dc2626" }}>{errors.videoUrl}</p>}
        </div>

        {/* Thumbnail */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
            Thumbnail URL
          </label>
          <input
            value={form.thumbnail}
            onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
            placeholder="https://..."
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ ...INPUT_BASE, border: "1px solid rgba(12,117,111,0.15)" }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: "rgba(0,0,0,0.06)", color: "#000201" }}
        >
          Болих
        </button>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "#0c756f", boxShadow: "3px 3px 10px rgba(12,117,111,0.3)" }}
        >
          {saving ? "Хадгалж байна..." : "Хадгалах"}
        </motion.button>
      </div>
    </Modal>
  );
}
