"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import {
  announcementsApi,
  type Announcement,
} from "@/lib/api/announcements.api";

const STORAGE_PREFIX = "tse:announcement:dismissed:";

function dismissedKey(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

export default function AnnouncementModalGate() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    let cancelled = false;
    void (async () => {
      try {
        const list = await announcementsApi.getActive();
        if (cancelled || list.length === 0) return;
        const latest = list[0];
        if (localStorage.getItem(dismissedKey(latest._id))) return;
        if (cancelled) return;
        setAnnouncement(latest);
        setOpen(true);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  const dismiss = useCallback(() => {
    if (announcement) {
      try {
        localStorage.setItem(dismissedKey(announcement._id), "1");
      } catch {
        /* private mode etc. */
      }
    }
    setOpen(false);
  }, [announcement]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && announcement && (
        <motion.div
          key={announcement._id}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Хаах"
            onClick={dismiss}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative z-[101] w-full max-w-lg rounded-2xl bg-background text-foreground shadow-2xl border border-[rgba(43,95,111,0.12)] max-h-[min(90vh,640px)] flex flex-col overflow-hidden"
            style={{
              boxShadow:
                "8px 12px 40px rgba(0,0,0,0.18), -4px -4px 20px rgba(255,255,255,0.5)",
            }}
          >
            <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-[rgba(43,95,111,0.1)] shrink-0">
              <h2
                id="announcement-modal-title"
                className="text-lg sm:text-xl font-bold leading-snug pr-2"
              >
                {announcement.title}
              </h2>
              <button
                type="button"
                onClick={dismiss}
                className="shrink-0 p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
                aria-label="Хаах"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
              {announcement.imageUrl?.trim() && (
                <div className="rounded-xl overflow-hidden bg-surface-alt">
                  <img
                    src={announcement.imageUrl}
                    alt=""
                    className="w-full max-h-56 object-contain"
                  />
                </div>
              )}
              {announcement.description?.trim() && (
                <p className="text-sm sm:text-base text-muted leading-relaxed whitespace-pre-wrap">
                  {announcement.description}
                </p>
              )}
              {announcement.link?.trim() && (
                <Link
                  href={announcement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  Дэлгэрэнгүй холбоос →
                </Link>
              )}
            </div>
            <div className="p-4 sm:p-5 pt-0 shrink-0">
              <button
                type="button"
                onClick={dismiss}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:opacity-95 transition-opacity"
                style={{
                  boxShadow: "4px 4px 12px rgba(43, 95, 111, 0.28)",
                }}
              >
                Ойлголоо
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
