"use client";

import { useState, useRef, useEffect, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api/auth.api";
import { useToast, getErrMsg } from "@/lib/toast";
import { ShieldCheck } from "lucide-react";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const toast = useToast();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.replace("/forgot-password");
  }, [email, router]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const verifyOtp = async (code: string) => {
    if (loading || isExpired) return;

    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(email, code);
      router.push(`/reset-password?token=${encodeURIComponent(data.resetToken)}`);
    } catch (err: unknown) {
      toast.error(getErrMsg(err, "Код буруу байна"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);

    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }

    if (value && idx === 5) {
      const fullCode = next.join("");
      if (fullCode.length === 6 && !isExpired) {
        setTimeout(() => verifyOtp(fullCode), 100);
      }
    }
  };

  const handleKeyDown = (idx: number, key: string) => {
    if (key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();

    if (pasted.length === 6 && !isExpired) {
      setTimeout(() => verifyOtp(pasted), 100);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("6 оронтой код оруулна уу");
      return;
    }
    await verifyOtp(code);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-full flex flex-col justify-center items-center"
    >
      {/* Logo / Brand */}
      <div className="text-center mb-8">

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Код оруулах
        </h1>
        <p className="text-sm mt-2 text-muted">
          Бид <span className="font-semibold text-foreground">{email}</span> руу код илгээлээ
        </p>
        <p
          className={`text-xs mt-1 font-semibold ${isExpired ? "text-error" : timeLeft < 60 ? "text-accent" : "text-muted"
            }`}
        >
          {isExpired ? "Код дууссан байна" : `${formatTime(timeLeft)} үлдсэн`}
        </p>
        {isExpired && (
          <Link
            href="/forgot-password"
            className="inline-block text-sm font-medium hover:underline mt-2 text-primary"
          >
            Шинэ код авах
          </Link>
        )}
      </div>

      {/* Card */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="rounded-2xl p-8 flex flex-col gap-6 bg-background w-full max-w-md mx-4"
        style={{
          boxShadow: "8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.8)",
        }}
      >
        {/* OTP Input */}
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={isExpired || loading}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e.key)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-background text-primary border border-border focus:border-primary"
              style={{
                boxShadow: "inset 3px 3px 6px rgba(0,0,0,0.1), inset -3px -3px 6px rgba(255,255,255,0.9)",
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "inset 3px 3px 6px rgba(0,0,0,0.1), 0 0 0 3px rgba(43, 95, 111, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "inset 3px 3px 6px rgba(0,0,0,0.1), inset -3px -3px 6px rgba(255,255,255,0.9)";
              }}
            />
          ))}
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-2">
          <motion.button
            type="submit"
            disabled={loading || isExpired}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-primary"
            style={{
              boxShadow: "5px 5px 12px rgba(43, 95, 111, 0.35), -3px -3px 8px rgba(255,255,255,0.7)",
            }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Баталгаажуулах"
            )}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <span
          className="w-8 h-8 border-3 border-white/30 rounded-full animate-spin"
          style={{ borderTopColor: "var(--primary)" }}
        />
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
