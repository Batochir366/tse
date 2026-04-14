import type { SyntheticEvent } from "react";

/** public/thumbnail.png — видео poster / thumbnail байхгүй эсвэл алдаатай үед */
export const EMPTY_VIDEO_POSTER_SRC = "/thumbnail2.webp";

/** public/empty.webp — жагсаалт / хүснэгтийн хоосон төлөв */
export const EMPTY_STATE_IMAGE_SRC = "/empty.webp";

/** Зургийн ачаалал амжилтгүй бол poster руу шилжинэ (давтагдахгүй). */
export function fallbackToEmptyVideoPoster(
  e: SyntheticEvent<HTMLImageElement>,
) {
  const el = e.currentTarget;
  if (el.dataset.fallbackPoster === "1") return;
  let path = "";
  try {
    path = new URL(
      el.src,
      typeof window !== "undefined" ? window.location.href : "http://localhost",
    ).pathname;
  } catch {
    /* ignore */
  }
  if (path.endsWith("/thumbnail.png") || path.endsWith("/thumbnail2.webp")) {
    el.dataset.fallbackPoster = "1";
    return;
  }
  el.dataset.fallbackPoster = "1";
  el.src = EMPTY_VIDEO_POSTER_SRC;
}
