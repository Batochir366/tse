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
type ToastPosition = 
  | "top-left" 
  | "top-center" 
  | "top-right" 
  | "bottom-left" 
  | "bottom-center" 
  | "bottom-right";

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

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
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

// ─── Position Config ──────────────────────────────────────────────────────────

const POSITION_STYLES: Record<ToastPosition, { 
  container: string; 
  initial: { x?: number; y?: number }; 
  exit: { x?: number; y?: number };
}> = {
  "top-left": {
    container: "top-6 left-6",
    initial: { x: -60, y: 0 },
    exit: { x: -60, y: 0 },
  },
  "top-center": {
    container: "top-6 left-1/2 -translate-x-1/2",
    initial: { x: 0, y: -60 },
    exit: { x: 0, y: -60 },
  },
  "top-right": {
    container: "top-6 right-6",
    initial: { x: 60, y: 0 },
    exit: { x: 60, y: 0 },
  },
  "bottom-left": {
    container: "bottom-6 left-6",
    initial: { x: -60, y: 0 },
    exit: { x: -60, y: 0 },
  },
  "bottom-center": {
    container: "bottom-6 left-1/2 -translate-x-1/2",
    initial: { x: 0, y: 60 },
    exit: { x: 0, y: 60 },
  },
  "bottom-right": {
    container: "bottom-6 right-6",
    initial: { x: 60, y: 0 },
    exit: { x: 60, y: 0 },
  },
};

const TOAST_CONFIG: Record<
  ToastType,
  { icon: React.ElementType; bg: string; border: string; color: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "rgba(43, 95, 111, 0.12)",
    border: "rgba(43, 95, 111, 0.3)",
    color: "#2B5F6F",
  },
  error: {
    icon: XCircle,
    bg: "rgba(220, 38, 38, 0.1)",
    border: "rgba(220, 38, 38, 0.25)",
    color: "#dc2626",
  },
  info: {
    icon: Info,
    bg: "rgba(212, 165, 116, 0.2)",
    border: "rgba(212, 165, 116, 0.5)",
    color: "#8B4513",
  },
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children, position = "top-right" }: ToastProviderProps) {
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
      <Toaster toasts={toasts} onDismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
}

// ─── Toaster ──────────────────────────────────────────────────────────────────

function Toaster({
  toasts,
  onDismiss,
  position = "top-right",
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  position?: ToastPosition;
}) {
  const posConfig = POSITION_STYLES[position];
  
  return (
    <div className={`fixed ${posConfig.container} z-[9999] flex flex-col gap-2.5 pointer-events-none`}>
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const cfg = TOAST_CONFIG[t.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, ...posConfig.initial, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, ...posConfig.exit, scale: 0.9 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl min-w-[260px] max-w-[360px]"
              style={{
                background: "#F5F1E8",
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
              <p className="flex-1 text-sm font-medium leading-snug" style={{ color: "#1a1a2e" }}>
                {t.message}
              </p>
              <button
                onClick={() => onDismiss(t.id)}
                className="shrink-0 mt-0.5 hover:opacity-60 transition-opacity"
                style={{ color: "#1a1a2e" }}
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
