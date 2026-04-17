"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast, getErrMsg } from "@/lib/toast";
import { Eye, EyeOff, UserPlus, GraduationCap } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ name, email, password, phone: phone || undefined });
      router.push("/courses");
    } catch (err: unknown) {
      toast.error(getErrMsg(err, "Бүртгэх үед алдаа гарлаа"));
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-full flex flex-col justify-center items-center"
    >
      {/* Logo / Brand */}
      <div className="text-center flex flex-col justify-center items-center mb-8">
        <Image style={{ width: "50px", height: "50px" }} src="/tse2.webp" alt="Logo" width={100} height={50} />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Бүртгүүлэх</h1>
      </div>

      {/* Card */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="rounded-2xl p-8 flex flex-col gap-4 bg-background w-full max-w-md mx-4"
        style={{
          boxShadow: "8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.8)",
        }}
      >
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-foreground">
            Нэр
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Таны нэр"
            className={inputClass}
            style={inputStyle}
            onFocus={onFocusShadow}
            onBlur={onBlurShadow}
          />
        </div>

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
            className={inputClass}
            style={inputStyle}
            onFocus={onFocusShadow}
            onBlur={onBlurShadow}
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-foreground">
            Утас <span className="text-xs font-normal text-muted">(заавал биш)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="99001122"
            className={inputClass}
            style={inputStyle}
            onFocus={onFocusShadow}
            onBlur={onBlurShadow}
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

        {/* Submit */}
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
              <UserPlus className="w-4 h-4" />
              Бүртгүүлэх
            </>
          )}
        </motion.button>
      </motion.form>

      <p className="text-sm text-center mt-6 text-muted">
        Бүртгэлтэй юу?{" "}
        <Link href="/login" className="font-medium hover:underline text-primary">
          Нэвтрэх
        </Link>
      </p>
    </motion.div>
  );
}
