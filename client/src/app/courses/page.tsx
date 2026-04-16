"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import { coursesService } from "@/lib/services/courses.service";
import { Course } from "@/lib/api/courses.api";
import { userHasActiveCourseAccess } from "@/lib/courseAccess";
import { useToast, getErrMsg } from "@/lib/toast";
import { EMPTY_VIDEO_POSTER_SRC, fallbackToEmptyVideoPoster } from "@/lib/media";
import Image from "next/image";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await coursesService.getAll();
        setCourses(data.filter((c) => c.isActive));
      } catch (err) {
        toast.error(getErrMsg(err, "Курсууд ачаалахад алдаа гарлаа"));
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [toast]);

  const sortedCourses = [...courses].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-surface-alt">
      <header
        className="border-b"
        style={{ borderColor: "rgba(43, 95, 111, 0.1)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image style={{ width: "50px", height: "50px" }} src="/tse2.webp" alt="Logo" width={100} height={50} />
          </Link>

          <div className="flex items-center gap-3">
            {user && (
              <Link
                href="/account"
                className="flex items-center gap-2 text-sm rounded-xl px-2 py-1 hover:opacity-90 transition-opacity"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-background"
                  style={{
                    boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.08), inset -2px -2px 4px rgba(255,255,255,0.9)",
                  }}
                >
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium hidden sm:inline text-foreground max-w-[10rem] truncate">
                  {user.name}
                </span>
                <Settings className="w-4 h-4 text-muted shrink-0" aria-hidden />
              </Link>
            )}
            {user && (
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl transition-all text-error bg-background"
                style={{
                  boxShadow: "3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.9)",
                }}
                title="Гарах"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-foreground">
            Хичээлүүд
          </h1>
          <p className="text-muted">
            Танд зориулсан сургалтын хөтөлбөрүүд
          </p>
        </motion.div>

        {loading && (
          <p className="text-sm text-muted">Ачаалж байна...</p>
        )}

        {!loading && sortedCourses.length === 0 && (
          <div
            className="rounded-2xl overflow-hidden bg-background"
            style={{
              boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7)",
            }}
          >
            <EmptyState message="Идэвхтэй хичээл байхгүй байна" />
          </div>
        )}

        {!loading && sortedCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map((course, idx) => {
              const hasEntitlement =
                course.isFree || userHasActiveCourseAccess(user, course._id);
              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/courses/${course._id}`}>
                    <div
                      className="rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col bg-surface-alt"
                      style={{
                        boxShadow: `
                      4px 4px 10px rgba(0,0,0,0.08),
                      -4px -4px 10px rgba(255,255,255,0.7)
                    `,
                      }}
                    >
                      <div className="relative aspect-video bg-zinc-900">
                        <img
                          src={course.coverImage?.trim() ? course.coverImage : EMPTY_VIDEO_POSTER_SRC}
                          alt={course.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={fallbackToEmptyVideoPoster}
                        />
                        {course.isFree && (
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-bold bg-primary/90 text-white">
                            Үнэгүй
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 text-foreground">
                          {course.name}
                        </h3>
                        <p className="text-sm mb-4 line-clamp-2 flex-1 text-muted">
                          {course.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs mb-4 text-[#52525b]">
                          <span className="inline-flex items-center gap-1.5">
                            <BookOpen size={14} className="text-primary" />
                            {course.lessons.length} хичээл
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} className="text-primary" />
                            {course.durationDays} өдөр
                          </span>
                        </div>
                        {!(hasEntitlement && !course.isFree) && (
                          <div
                            className="flex items-center justify-between pt-3 border-t"
                            style={{ borderColor: "rgba(43, 95, 111, 0.1)" }}
                          >
                            {course.isFree ? (
                              <span className="text-sm font-semibold text-primary">
                                Үнэгүй
                              </span>
                            ) : (
                              <span className="text-lg font-bold text-primary tabular-nums">
                                ₮{course.price.toLocaleString()}
                              </span>
                            )}
                            <span
                              className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                                course.isFree
                                  ? "text-primary bg-primary/10"
                                  : "text-white bg-primary"
                              }`}
                              style={
                                !course.isFree
                                  ? {
                                      boxShadow:
                                        "4px 4px 10px rgba(43, 95, 111, 0.25)",
                                    }
                                  : undefined
                              }
                            >
                              {course.isFree ? "Үзэх" : "Худалдан авах"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
