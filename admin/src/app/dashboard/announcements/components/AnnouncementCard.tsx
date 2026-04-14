"use client";

import { motion } from "framer-motion";
import { DeleteIcon, EditIcon } from "../../../../components/Icons";
import IsActiveToggle from "../../../../components/IsActiveToggle";
import { EMPTY_VIDEO_POSTER_SRC, fallbackToEmptyVideoPoster } from "../../../../lib/media";
import { Announcement } from "../../../../lib/api/announcements.api";

interface Props {
  announcement: Announcement;
  index: number;
  onToggleActive: (a: Announcement) => void;
  onEdit: (a: Announcement) => void;
  onDelete: (id: string) => void;
}

export default function AnnouncementCard({
  announcement: a,
  index,
  onToggleActive,
  onEdit,
  onDelete,
}: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="flex flex-col rounded-2xl overflow-hidden h-full"
      style={{
        background: "#efeadb",
        boxShadow: `
          4px 4px 10px rgba(0,0,0,0.08),
          -4px -4px 10px rgba(255,255,255,0.7)
        `,
      }}
    >
      <div className="relative aspect-video bg-black/5 shrink-0">
        <img
          src={a.imageUrl?.trim() ? a.imageUrl : EMPTY_VIDEO_POSTER_SRC}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={fallbackToEmptyVideoPoster}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)" }}
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
            style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
          >
            {a.type}
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: a.isActive ? "#dcfce7" : "rgba(0,0,0,0.55)",
              color: a.isActive ? "#16a34a" : "#fff",
            }}
          >
            {a.isActive ? "Идэвхтэй" : "Идэвхгүй"}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1 min-h-0">
        <h3 className="text-sm font-bold leading-snug line-clamp-2" style={{ color: "#000201" }}>
          {a.title}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-3 flex-1" style={{ color: "#000201aa" }}>
          {a.description}
        </p>
        {a.link?.trim() ? (
          <a
            href={a.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium truncate hover:underline"
            style={{ color: "#0c756f" }}
          >
            {a.link}
          </a>
        ) : null}
        <div
          className="flex items-center justify-between gap-2 pt-1 border-t mt-auto"
          style={{ borderColor: "rgba(12,117,111,0.12)" }}
        >
          <IsActiveToggle
            isActive={a.isActive}
            onToggle={() => onToggleActive(a)}
          />
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              aria-label="Засах"
              onClick={() => onEdit(a)}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ background: "rgba(12,117,111,0.1)", color: "#0c756f" }}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              aria-label="Устгах"
              onClick={() => onDelete(a._id)}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}
            >
              <DeleteIcon />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
