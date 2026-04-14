"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  GraduationCap,

  Users,
  Star,
  Video,
  Clock,
  Award,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  const { user, loading } = useAuth();

  const courseCategories = [
    {
      title: "ТЭН ЦАГИЙН АНГИ",
      description: "Өөртөө зориулах жинхэнэ цаг",
      image: "/images/full-class.jpg",
    },
    {
      title: "ШИНЖЛЭХ УХААН",
      description: "Шинжлэх ухааны үндэс суурь",
      image: "/images/science.jpg",
    },
    {
      title: "МАТЕМАТИК",
      description: "Логик сэтгэлгээг хөгжүүлэх",
      image: "/images/math.jpg",
    },
    {
      title: "ХЭЛНИЙ ХИЧЭЭЛ",
      description: "Олон улсын хэлээр чөлөөтэй",
      image: "/images/language.jpg",
    },
    {
      title: "ТЕХНОЛОГИ",
      description: "Ирээдүйн мэргэжил эзэмшье",
      image: "/images/tech.jpg",
    },
    {
      title: "БИЕ БЯЛДАР",
      description: "Эрүүл бие сэтгэл",
      image: "/images/health.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/95"
        style={{ borderBottom: "1px solid rgba(43, 95, 111, 0.08)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image style={{ width: "50px", height: "50px" }} src="/tse2.webp" alt="Logo" width={100} height={50} />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#courses" className="text-sm font-medium hover:opacity-70 transition-opacity text-primary">
              ХИЧЭЭЛҮҮД
            </Link>
            <Link href="#instructor" className="text-sm font-medium hover:opacity-70 transition-opacity text-primary">
              БАГШ
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:opacity-70 transition-opacity text-primary">
              ҮНЭ
            </Link>
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
                  Хичээлүүд үзэх
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
    </div>
  );
}
