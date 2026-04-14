"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Course } from "../../../../lib/api/courses.api";
import { EMPTY_VIDEO_POSTER_SRC, fallbackToEmptyVideoPoster } from "../../../../lib/media";

interface Props {
  course: Course;
  index: number;
}

export default function CourseCard({ course: r, index }: Props) {
  return (
    <Link
      href={`/dashboard/courses/${r._id}`}
      className="block group rounded-2xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0c756f]"
    >
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.04, 0.3) }}
        className="flex flex-col rounded-2xl overflow-hidden h-full transition-transform group-hover:scale-[1.01] group-active:scale-[0.99]"
        style={{
          background: "#efeadb",
          boxShadow: `
          4px 4px 10px rgba(0,0,0,0.08),
          -4px -4px 10px rgba(255,255,255,0.7)
        `,
        }}
      >
        <div className="relative aspect-video bg-black/5 shrink-0">
          {r.coverImage && (
            <img
              src={r.coverImage?.trim() ? r.coverImage : EMPTY_VIDEO_POSTER_SRC}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
              onError={fallbackToEmptyVideoPoster}
            />
          )}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.22)" }} />

          <div className="absolute top-2 left-2">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: r.isActive ? "#dcfce7" : "rgba(0,0,0,0.55)",
                color: r.isActive ? "#16a34a" : "#fff",
              }}
            >
              {r.isActive ? "Идэвхтэй" : "Идэвхгүй"}
            </span>
          </div>

          <div className="absolute top-2 right-2">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-mono font-bold"
              style={{ background: "rgba(0,0,0,0.65)", color: "#fdcf6f" }}
            >
              ₮{r.price.toLocaleString()}
            </span>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
            }}
          >
            <p className="text-xs font-semibold text-white truncate">{r.name}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-4 flex-1 min-h-0">
          <h3 className="text-sm font-bold leading-snug line-clamp-2" style={{ color: "#000201" }}>
            {r.name}
          </h3>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#000201aa" }}>
            {r.description}
          </p>
          <p className="text-xs font-medium pb-1" style={{ color: "#0c756f99" }}>
            {r.durationDays} өдөр · {r.lessons?.length ?? 0} хичээл
          </p>
        </div>
      </motion.article>
    </Link>
  );
}
