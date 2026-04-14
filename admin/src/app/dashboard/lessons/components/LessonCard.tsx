"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, PlayCircle, X } from "lucide-react";
import { DeleteIcon, EditIcon } from "../../../../components/Icons";
import { Lesson } from "../../../../lib/api/lessons.api";
import { lessonsService } from "../../../../lib/services/lessons.service";
import EmptyState from "../../../../components/EmptyState";
import { EMPTY_VIDEO_POSTER_SRC, fallbackToEmptyVideoPoster } from "../../../../lib/media";
import { parseDriveFileId } from "../../../../lib/formatters";

interface Props {
  lesson: Lesson;
  index: number;
  onEdit: (l: Lesson) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
}

export default function LessonCard({ lesson: r, index, onEdit, onDelete, onToggle }: Props) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    setPlaying(true);
  };

  const handleClose = () => setPlaying(false);

  // Google Drive URL бол preview format руу хөрвүүлнэ
  const videoUrl = r.videoUrl
    ? r.videoUrl.includes('drive.google.com')
      ? `https://drive.google.com/file/d/${parseDriveFileId(r.videoUrl)}/preview`
      : r.videoUrl
    : undefined;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "#efeadb",
        boxShadow: `
        4px 4px 10px rgba(0,0,0,0.08),
        -4px -4px 10px rgba(255,255,255,0.7)
      `,
      }}
    >
      {/* ── Thumbnail / player area ── */}
      <div className="relative aspect-video bg-black/5 shrink-0 overflow-hidden">
        {playing && videoUrl ? (
          <>
            <iframe
              key={videoUrl}
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{ border: "none" }}
            />
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full transition-opacity hover:opacity-90"
              style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
              title="Хаах"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <img
              src={r.thumbnail?.trim() ? r.thumbnail : EMPTY_VIDEO_POSTER_SRC}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={fallbackToEmptyVideoPoster}
            />

            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.28)" }} />

            <div className="absolute top-2 right-2">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: r.isPublished ? "#dcfce7" : "rgba(0,0,0,0.55)",
                  color: r.isPublished ? "#16a34a" : "#fff",
                }}
              >
                {r.isPublished ? "Нийтлэгдсэн" : "Нууц"}
              </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              {!videoUrl ? (
                <EmptyState
                  size="inline"
                  inverse
                  message="Видео URL олдсонгүй"
                  className="pointer-events-none max-w-[85%] py-1"
                />
              ) : (
                <motion.button
                  type="button"
                  onClick={handlePlay}
                  whileHover={{ scale: 1.12 }}
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 48,
                    height: 48,
                    background: "#efeadb",
                    boxShadow: `
                      3px 3px 8px rgba(0,0,0,0.12),
                      -3px -3px 8px rgba(255,255,255,0.7)
                    `,
                    color: "#0c756f",
                  }}
                >
                  <PlayCircle size={28} strokeWidth={1.5} />
                </motion.button>
              )}
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 px-3 py-2"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
              }}
            >
              <p className="text-xs font-semibold text-white truncate">{r.title}</p>
            </div>
          </>
        )}
      </div>

      {/* ── Description ── */}
      <div className="flex flex-col gap-1 p-4 flex-1 min-h-0">
        <h3
          className="text-sm font-bold leading-snug line-clamp-2"
          style={{ color: "#000201" }}
        >
          {r.title}
        </h3>
        {r.description ? (
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: "#000201aa" }}
          >
            {r.description}
          </p>
        ) : null}
      </div>

      {/* ── Actions ── */}
      <div
        className="flex flex-wrap gap-2 justify-end px-4 pb-4 pt-1 mt-auto"
        style={{ borderTop: "1px solid rgba(12,117,111,0.1)" }}
      >
        <button
          type="button"
          onClick={() => onToggle(r._id, r.isPublished)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90 cursor-pointer"
          style={{ background: "rgba(253,207,111,0.25)", color: "#a16207" }}
        >
          {r.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}

        </button>
        <button
          type="button"
          onClick={() => onEdit(r)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
          style={{ background: "rgba(12,117,111,0.12)", color: "#0c756f" }}
        >
          <EditIcon />

        </button>
        <button
          type="button"
          onClick={() => onDelete(r._id)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
          style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626" }}
        >
          <DeleteIcon />

        </button>
      </div>
    </motion.article>
  );
}
