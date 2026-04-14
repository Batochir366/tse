"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastApi | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getErrMsg(error: unknown, fallback = "Алдаа гарлаа"): string {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<
  ToastType,
  { icon: React.ElementType; bg: string; border: string; color: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "rgba(12,117,111,0.12)",
    border: "rgba(12,117,111,0.3)",
    color: "#0c756f",
  },
  error: {
    icon: XCircle,
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.25)",
    color: "#dc2626",
  },
  info: {
    icon: Info,
    bg: "rgba(253,207,111,0.2)",
    border: "rgba(253,207,111,0.5)",
    color: "#b45309",
  },
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => {
        const next = [...prev, { id, type, message }];
        // keep max 4
        return next.length > 4 ? next.slice(next.length - 4) : next;
      });
      const timer = setTimeout(() => dismiss(id), 3500);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const api: ToastApi = {
    success: (msg) => push("success", msg),
    error: (msg) => push("error", msg),
    info: (msg) => push("info", msg),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Toaster ──────────────────────────────────────────────────────────────────

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const cfg = TOAST_CONFIG[t.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl min-w-[260px] max-w-[360px]"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${cfg.border}`,
                boxShadow:
                  "6px 6px 18px rgba(0,0,0,0.12), -4px -4px 12px rgba(255,255,255,0.7)",
              }}
            >
              <Icon
                size={18}
                className="shrink-0 mt-0.5"
                style={{ color: cfg.color }}
              />
              <p className="flex-1 text-sm font-medium leading-snug" style={{ color: "#000201" }}>
                {t.message}
              </p>
              <button
                onClick={() => onDismiss(t.id)}
                className="shrink-0 mt-0.5 hover:opacity-60 transition-opacity"
                style={{ color: "#000201" }}
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
