"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast, getErrMsg } from "@/lib/toast";
import { Eye, EyeOff, LogIn, GraduationCap } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/courses");
    } catch (err: unknown) {
      toast.error(getErrMsg(err, "Нэвтрэх үед алдаа гарлаа"));
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
        <Image style={{ width: "50px", height: "50px" }} src="/tse2.webp" alt="Logo" width={100} height={50} />
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

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-foreground">
            Нууц үг
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm outline-none transition-all bg-background text-foreground border border-border focus:border-primary"
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
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70 text-primary"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium hover:underline text-primary"
          >
            Нууц үг мартсан?
          </Link>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all mt-1 disabled:opacity-60 disabled:cursor-not-allowed bg-primary"
          style={{
            boxShadow: "5px 5px 12px rgba(43, 95, 111, 0.35), -3px -3px 8px rgba(255,255,255,0.7)",
          }}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Нэвтрэх
            </>
          )}
        </motion.button>
      </motion.form>

      <p className="text-sm text-center mt-6 text-muted">
        Бүртгэл байхгүй юу?{" "}
        <Link href="/register" className="font-medium hover:underline text-primary">
          Бүртгүүлэх
        </Link>
      </p>
    </motion.div>
  );
}
