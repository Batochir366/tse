"use client";

import type { ReactNode } from "react";
import { EMPTY_STATE_IMAGE_SRC } from "../lib/media";

export type EmptyStateSize = "default" | "compact" | "inline";

export default function EmptyState({
  message,
  description,
  size = "default",
  inverse = false,
  tone = "default",
  className = "",
  children,
}: {
  message: string;
  description?: string;
  size?: EmptyStateSize;
  /** Харанхуй дэвсгэр дээр (видео overlay гэх мэт) */
  inverse?: boolean;
  tone?: "default" | "error";
  className?: string;
  children?: ReactNode;
}) {
  const imgClass =
    size === "inline"
      ? "max-h-14 w-auto max-w-[min(100%,8rem)] object-contain"
      : size === "compact"
        ? "max-h-28 sm:max-h-32 w-auto object-contain"
        : "max-h-36 sm:max-h-44 w-auto object-contain";

  const titleColor = inverse
    ? "rgba(255,255,255,0.92)"
    : tone === "error"
      ? "#dc2626"
      : "#3f3f46";

  const descColor = inverse ? "rgba(255,255,255,0.65)" : "#71717a";

  const gap = size === "inline" ? "gap-1.5" : size === "compact" ? "gap-2" : "gap-3";
  const py = size === "inline" ? "py-2" : size === "compact" ? "py-4" : "py-8";
  const titleClass =
    size === "inline" ? "text-xs font-semibold" : size === "compact" ? "text-sm font-semibold" : "text-base font-semibold";
  const descClass = size === "inline" ? "text-[10px] mt-0.5" : size === "compact" ? "text-xs mt-1" : "text-sm mt-1.5";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${gap} ${py} px-3 ${className}`}
      role="status"
    >
      <img
        src={EMPTY_STATE_IMAGE_SRC}
        alt=""
        className={`select-none ${imgClass}`}
        draggable={false}
      />
      <div className="min-w-0 max-w-md">
        <p className={titleClass} style={{ color: titleColor }}>
          {message}
        </p>
        {description ? (
          <p className={descClass} style={{ color: descColor }}>
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
