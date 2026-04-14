"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { authService } from "../lib/services/auth.service";
import { useToast, getErrMsg } from "../lib/toast";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "И-мэйл оруулна уу";
    if (!password) errs.password = "Нууц үг оруулна уу";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      await authService.login({ email, password });
      toast.success("Амжилттай нэвтэрлээ");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(getErrMsg(err, "Нэвтрэх алдаа гарлаа"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#efeadb" }}
    >
      {/* Background blobs */}
      <div
        className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: "#0c756f" }}
      />
      <div
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: "#fdcf6f" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm mx-4"
      >

        {/* Card */}
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="rounded-2xl p-8 flex flex-col gap-5"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(10px)",
            boxShadow:
              "8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.7)",
          }}
        >
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#000201" }}
            >
              И-мэйл
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
              placeholder="admin@example.com"
              className="rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.7)",
                boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.08), inset -2px -2px 6px rgba(255,255,255,0.9)",
                border: fieldErrors.email ? "1px solid #f87171" : "1px solid rgba(12,117,111,0.15)",
                color: "#000201",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = fieldErrors.email ? "#f87171" : "#0c756f";
                e.target.style.boxShadow = "inset 2px 2px 6px rgba(0,0,0,0.08), 0 0 0 3px rgba(12,117,111,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = fieldErrors.email ? "#f87171" : "rgba(12,117,111,0.15)";
                e.target.style.boxShadow = "inset 2px 2px 6px rgba(0,0,0,0.08), inset -2px -2px 6px rgba(255,255,255,0.9)";
              }}
            />
            {fieldErrors.email && <p className="text-xs" style={{ color: "#dc2626" }}>{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#000201" }}
            >
              Нууц үг
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.08), inset -2px -2px 6px rgba(255,255,255,0.9)",
                  border: fieldErrors.password ? "1px solid #f87171" : "1px solid rgba(12,117,111,0.15)",
                  color: "#000201",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = fieldErrors.password ? "#f87171" : "#0c756f";
                  e.target.style.boxShadow = "inset 2px 2px 6px rgba(0,0,0,0.08), 0 0 0 3px rgba(12,117,111,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = fieldErrors.password ? "#f87171" : "rgba(12,117,111,0.15)";
                  e.target.style.boxShadow = "inset 2px 2px 6px rgba(0,0,0,0.08), inset -2px -2px 6px rgba(255,255,255,0.9)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: "#0c756f" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>{fieldErrors.password}</p>}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#0c756f",
              boxShadow:
                "4px 4px 12px rgba(12,117,111,0.35), -2px -2px 8px rgba(255,255,255,0.6)",
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </motion.button>
        </motion.form>


      </motion.div>
    </div>
  );
}
