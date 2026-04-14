"use client";

import { useState, useEffect, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api/auth.api";
import { useToast, getErrMsg } from "@/lib/toast";
import { Eye, EyeOff, KeyRound, CheckCircle, GraduationCap } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token") || "";
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resetToken) router.replace("/forgot-password");
  }, [resetToken, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Нууц үг таарахгүй байна");
      return;
    }
    if (password.length < 6) {
      toast.error("Нууц үг хамгийн багадаа 6 тэмдэгт");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, password);
      setSuccess(true);
    } catch (err: unknown) {
      toast.error(getErrMsg(err, "Алдаа гарлаа"));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-background text-foreground border border-border focus:border-primary";
  const inputStyle = {
    boxShadow: "inset 3px 3px 6px rgba(0,0,0,0.1), inset -3px -3px 6px rgba(255,255,255,0.9)",
  };
  const onFocusShadow = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.boxShadow = "inset 3px 3px 6px rgba(0,0,0,0.1), 0 0 0 3px rgba(43, 95, 111, 0.1)";
  };
  const onBlurShadow = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.boxShadow = "inset 3px 3px 6px rgba(0,0,0,0.1), inset -3px -3px 6px rgba(255,255,255,0.9)";
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full rounded-2xl p-10 text-center bg-background"
          style={{
            boxShadow: "8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.8)",
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center bg-background"
              style={{
                boxShadow: "inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)",
              }}
            >
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold mb-3 text-foreground">
            Амжилттай!
          </h1>
          <p className="text-sm mb-8 text-muted">
            Нууц үг амжилттай солигдлоо. Одоо шинэ нууц үгээрээ нэвтэрнэ үү.
          </p>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-primary"
              style={{
                boxShadow: "5px 5px 12px rgba(43, 95, 111, 0.35), -3px -3px 8px rgba(255,255,255,0.7)",
              }}
            >
              Нэвтрэх
            </motion.button>
          </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-full max-w-md mx-4"
    >
        <div className="text-center mb-8">

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Шинэ нууц үг
          </h1>
          <p className="text-sm mt-2 text-muted">
            Шинэ нууц үгээ оруулна уу
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="rounded-2xl p-8 flex flex-col gap-4 bg-background"
          style={{
            boxShadow: "8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.8)",
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-foreground">
              Шинэ нууц үг
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6+ тэмдэгт"
                className={`w-full pr-11 ${inputClass}`}
                style={inputStyle}
                onFocus={onFocusShadow}
                onBlur={onBlurShadow}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70 text-primary"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-foreground">
              Нууц үг давтах
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              style={inputStyle}
              onFocus={onFocusShadow}
              onBlur={onBlurShadow}
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed bg-primary"
            style={{
              boxShadow: "5px 5px 12px rgba(43, 95, 111, 0.35), -3px -3px 8px rgba(255,255,255,0.7)",
            }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Нууц үг солих
              </>
            )}
          </motion.button>
        </motion.form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <span
          className="w-8 h-8 border-3 border-white/30 rounded-full animate-spin"
          style={{ borderTopColor: "var(--primary)" }}
        />
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
