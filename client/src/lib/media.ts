import type { SyntheticEvent } from "react";

export const EMPTY_VIDEO_POSTER_SRC = "/thumbnail2.webp";
export const EMPTY_STATE_IMAGE_SRC = "/empty.webp";

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
