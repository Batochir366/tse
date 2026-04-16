"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { BookOpen } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header
        className="shrink-0 backdrop-blur-md bg-background/95 border-b"
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
          </Link>

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

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10 text-primary mb-8"
          aria-hidden
        >
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground text-center tracking-tight">
          TSE Academy
        </h1>
        <p className="mt-4 text-muted text-center max-w-md text-base sm:text-lg">
          Онлайн сургалтын платформ
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <Link href="/courses">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl text-sm font-semibold text-white bg-primary cursor-pointer"
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
              className="text-sm font-medium text-primary hover:opacity-80 transition-opacity"
            >
              Нэвтрэх
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
