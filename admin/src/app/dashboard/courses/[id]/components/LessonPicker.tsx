"use client";

import { useEffect, useState } from "react";
import Modal from "../../../../../components/Modal";
import { lessonsService } from "../../../../../lib/services/lessons.service";
import { Lesson } from "../../../../../lib/api/lessons.api";
import { useToast, getErrMsg } from "../../../../../lib/toast";
import EmptyState from "../../../../../components/EmptyState";

interface Props {
  open: boolean;
  onClose: () => void;
  existingLessonIds: Set<string>;
  onSelectLesson: (lessonId: string) => Promise<void>;
}

export default function LessonPicker({
  open,
  onClose,
  existingLessonIds,
  onSelectLesson,
}: Props) {
  const toast = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    lessonsService
      .getAll()
      .then((data) => setLessons(data as Lesson[]))
      .catch(() => toast.error("Хичээл ачаалахад алдаа гарлаа"))
      .finally(() => setLoading(false));
  }, [open, toast]);

  const available = lessons.filter((l) => !existingLessonIds.has(l._id));

  const handleAdd = async (lessonId: string) => {
    setAdding(lessonId);
    try {
      await onSelectLesson(lessonId);
      onClose();
    } catch (err) {
      toast.error(getErrMsg(err, "Нэмэхэд алдаа гарлаа"));
    } finally {
      setAdding(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Хичээл нэмэх" maxWidth="max-w-md">
      {loading ? (
        <p className="text-sm" style={{ color: "#0c756f99" }}>Ачаалж байна...</p>
      ) : available.length === 0 ? (
        <EmptyState
          size="compact"
          message="Нэмэх боломжтой хичээл байхгүй"
          description="Бүгд аль хэдийн энэ курсад байна."
          className="py-2"
        />
      ) : (
        <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {available.map((l) => (
            <li
              key={l._id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(12,117,111,0.08)" }}
            >
              <span className="text-sm font-medium truncate" style={{ color: "#000201" }}>
                {l.title}
              </span>
              <button
                type="button"
                disabled={adding === l._id}
                onClick={() => handleAdd(l._id)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                style={{ background: "#0c756f" }}
              >
                {adding === l._id ? "..." : "Нэмэх"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
