"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api/auth.api";
import { useToast, getErrMsg } from "@/lib/toast";
import { Mail, ArrowLeft, GraduationCap } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      toast.error(getErrMsg(err, "Алдаа гарлаа"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Нууц үг сэргээх
          </h1>
          <p className="text-sm mt-2 text-muted">
            Бүртгэлтэй и-мэйл хаягаа оруулна уу
          </p>
        </div>

        {/* Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="rounded-2xl p-8 flex flex-col gap-5 bg-background"
          style={{
            boxShadow: "8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.8)",
          }}
        >
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-foreground">
              И-мэйл
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-background text-foreground border border-border focus:border-primary"
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
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
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
              <>
                <Mail className="w-4 h-4" />
                Код илгээх
              </>
            )}
          </motion.button>
        </motion.form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-medium hover:underline text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Нэвтрэх хуудас руу буцах
          </Link>
        </div>
    </motion.div>
  );
}
