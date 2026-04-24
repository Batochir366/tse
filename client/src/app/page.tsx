"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const features = [
  {
    icon: PlayCircle,
    title: "Видео хичээл",
    desc: "Өөрийн хурдаар үзэж, дахин тоглуулж суралцаарай.",
  },
  {
    icon: GraduationCap,
    title: "Системтэй хөтөлбөр",
    desc: "Алхам алхмаар бүтэцлэгдсэн сургалтын агуулга.",
  },
  {
    icon: Sparkles,
    title: "Онлайн платформ",
    desc: "Хаанаас ч, хэзээ ч нэвтэрч үргэлжлүүлэх боломжтой.",
  },
];

const steps = [
  "Бүртгэл үүсгэх эсвэл нэвтрэх",
  "Хичээл сонгох, төлбөр төлөх",
  "Хичээлээ эхлүүлж, дуусгах",
];

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header
        className="shrink-0 backdrop-blur-md bg-background/95 border-b z-50"
        style={{ borderColor: "rgba(43, 95, 111, 0.08)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              style={{ width: "50px", height: "50px" }}
              src="/tse2.webp"
              alt="TSE Academy"
              width={100}
              height={50}
            />
            <h1 className="text-xs sm:text-2xl font-bold tracking-tight text-foreground">Tse Academy</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <a href="#features" className="hover:text-primary transition-colors">
              Онцлог
            </a>
            <a href="#how" className="hover:text-primary transition-colors">
              Хэрхэн ажилладаг вэ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <Link href="/courses">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary"
                  style={{
                    boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.25)",
                  }}
                >
                  Хичээлүүд
                </motion.button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2 rounded-xl text-sm font-medium text-primary bg-transparent"
                  >
                    Нэвтрэх
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary"
                    style={{
                      boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.25)",
                    }}
                  >
                    Бүртгүүлэх
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b" style={{ borderColor: "rgba(43, 95, 111, 0.08)" }}>
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(12, 117, 111, 0.22), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(212, 165, 116, 0.15), transparent)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="max-w-3xl"
            >
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/15 mb-6"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden />
                Онлайн сургалтын платформ
              </motion.p>
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]"
              >
                Мэргэжлээ өсгөхөд{" "}
                <span className="text-primary">Tse Academy</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mt-6 text-lg sm:text-xl text-muted max-w-2xl leading-relaxed"
              >
                Чанартай видео хичээл, ойлгомжтой бүтэц — өөрийн зав зайнд
                суралцаж, дараагийн түвшиндээ гарцгаая.
              </motion.p>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
              >
                <Link href="/courses" className="inline-flex">
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-primary cursor-pointer w-full sm:w-auto"
                    style={{
                      boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.25)",
                    }}
                  >
                    Хичээлүүдийг үзэх
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </motion.span>
                </Link>
                {!loading && !user && (
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-semibold text-foreground bg-surface-alt border w-full sm:w-auto"
                    style={{ borderColor: "rgba(43, 95, 111, 0.12)" }}
                  >
                    Үнэгүй бүртгүүлэх
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="py-20 sm:py-24 bg-surface-alt/60 scroll-mt-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45 }}
              className="text-center max-w-2xl mx-auto mb-14"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Яагаад Tse Academy вэ?
              </h2>
              <p className="mt-4 text-muted text-lg">
                Сургалтыг танд ойлгомжтой, хүртээмжтэй байлгахад бид
                анхаардаг.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((f, i) => (
                <motion.article
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="rounded-2xl p-8 bg-background border"
                  style={{
                    borderColor: "rgba(43, 95, 111, 0.1)",
                    boxShadow: "0 4px 24px rgba(43, 95, 111, 0.06)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary mb-5"
                    aria-hidden
                  >
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-muted leading-relaxed">{f.desc}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-20 sm:py-24 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45 }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  Гурван алхамд эхлээрэй
                </h2>
                <p className="mt-4 text-muted text-lg leading-relaxed">
                  Бүртгэлээс сургалт эхлэх хүртэлхийг энгийн болгосон.
                </p>
                <ul className="mt-10 space-y-5">
                  {steps.map((text, i) => (
                    <li key={text} className="flex gap-4">
                      <span
                        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-primary"
                        style={{
                          boxShadow: "2px 2px 8px rgba(12, 117, 111, 0.35)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="pt-2 text-foreground font-medium leading-snug">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45 }}
                className="rounded-3xl p-8 sm:p-10 border bg-surface-alt/50"
                style={{ borderColor: "rgba(43, 95, 111, 0.1)" }}
              >
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                  Эхлэхэд бэлэн үү?
                </p>
                <p className="text-foreground text-lg font-medium leading-relaxed mb-6">
                  Өнөөдөр хичээл сонгоод, өөрийн хөгжлийн замд нэг алхам
                  урагшилъя.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Хичээлийн жагсаалттай танилцах",
                    "Төлбөрөө төлж нэвтрэх эрх авах",
                    "Бүх агуулгыг платформоос үзэх",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3 text-muted">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {line}
                    </li>
                  ))}
                </ul>
                <Link href="/courses">
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-primary cursor-pointer"
                    style={{
                      boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.25)",
                    }}
                  >
                    Одоо эхлэх
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 sm:py-20 border-t" style={{ borderColor: "rgba(43, 95, 111, 0.08)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl px-8 py-12 sm:px-12 sm:py-14 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(12, 117, 111, 0.12) 0%, rgba(212, 165, 116, 0.12) 100%)",
                border: "1px solid rgba(43, 95, 111, 0.12)",
              }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight max-w-2xl mx-auto">
                Сургалтаа эхлүүлэхэд бэлэн үү?
              </h2>
              <p className="mt-4 text-muted max-w-xl mx-auto">
                Хичээлүүдийн хуудсаас өөрт тохирох сургалтыг сонгоно уу.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/courses">
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-primary cursor-pointer"
                    style={{
                      boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.25)",
                    }}
                  >
                    Хичээлүүд рүү орох
                  </motion.span>
                </Link>
                {!loading && !user && (
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity py-2"
                  >
                    Аль хэдийн бүртгэлтэй? Нэвтрэх
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer
        className="shrink-0 border-t py-10 mt-auto"
        style={{ borderColor: "rgba(43, 95, 111, 0.08)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              style={{ width: "40px", height: "40px" }}
              src="/tse2.webp"
              alt=""
              width={80}
              height={40}
            />
            <div>
              <p className="font-semibold text-foreground text-sm">Tse Academy</p>
              <p className="text-xs text-muted">© {new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
            <Link href="/courses" className="hover:text-primary transition-colors">
              Хичээлүүд
            </Link>
            {!user && (
              <>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Нэвтрэх
                </Link>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Бүртгүүлэх
                </Link>
              </>
            )}
            {user && (
              <Link href="/account" className="hover:text-primary transition-colors">
                Профайл
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
