"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  PlayCircle,
  X,
  GraduationCap,
  ArrowLeft,
  LogOut,
  User,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import EmptyState from "@/components/EmptyState";
import { coursesService } from "@/lib/services/courses.service";
import { lessonsService } from "@/lib/services/lessons.service";
import {
  CourseDetail,
  CourseLessonPopulated,
} from "@/lib/api/courses.api";
import { useToast, getErrMsg } from "@/lib/toast";
import { EMPTY_VIDEO_POSTER_SRC, fallbackToEmptyVideoPoster } from "@/lib/media";
import { parseDriveFileId } from "@/lib/formatters";
import Image from "next/image";

const EMPTY_STATE_SURFACE: CSSProperties = {
  background: "var(--surface-alt)",
  boxShadow: `
      3px 3px 6px rgba(0,0,0,0.10),
      -3px -3px 6px rgba(255,255,255,0.6),
      inset 2px 2px 4px rgba(0,0,0,0.12),
      inset -2px -2px 4px rgba(255,255,255,0.8)
    `,
};

function lessonIdStr(entry: CourseLessonPopulated): string {
  const x = entry.lessonId;
  return typeof x === "string" ? x : x._id;
}

function merchIdStr(m: { merchId: { _id: string } | string }): string {
  const x = m.merchId;
  return typeof x === "string" ? x : x._id;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const toast = useToast();
  const { user, logout } = useAuth();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number | null>(0);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [heroDriveFileId, setHeroDriveFileId] = useState<string | null>(null);

  const hasAccess = useCallback(() => {
    if (!user || !course) return false;
    if (course.isFree) return true;

    const now = new Date();
    return user.courseAccess.some(
      (access) =>
        access.courseId === courseId &&
        new Date(access.expiresAt) > now
    );
  }, [user, course, courseId]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await coursesService.getOne(courseId)) as CourseDetail;
      setCourse(data);
      // Auto-select first accessible lesson
      const sorted = [...data.lessons].sort((a, b) => a.order - b.order);
      const firstAccessibleIdx = sorted.findIndex((l) => {
        if (data.isFree) return true;
        const lessonObj = typeof l.lessonId === "object" ? l.lessonId : null;
        return lessonObj?.isPublished === true;
      });
      setActiveLessonIdx(firstAccessibleIdx >= 0 ? firstAccessibleIdx : null);
    } catch (err) {
      toast.error(getErrMsg(err, "Курс ачаалахад алдаа гарлаа"));
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setHeroPlaying(false);
    setHeroDriveFileId(null);
  }, [activeLessonIdx]);

  const sortedLessons = course
    ? [...course.lessons].sort((a, b) => a.order - b.order)
    : [];

  const isLessonAccessible = (lesson: CourseLessonPopulated): boolean => {
    if (!course) return false;
    if (course.isFree) return true;
    const lessonObj = typeof lesson.lessonId === "object" ? lesson.lessonId : null;
    return lessonObj?.isPublished === true;
  };

  const activeLessonEntry =
    activeLessonIdx !== null &&
      activeLessonIdx >= 0 &&
      activeLessonIdx < sortedLessons.length
      ? sortedLessons[activeLessonIdx]
      : null;

  const activeLessonMongoId = activeLessonEntry ? lessonIdStr(activeLessonEntry) : null;

  const activeLessonTitle =
    activeLessonEntry && typeof activeLessonEntry.lessonId !== "string"
      ? activeLessonEntry.lessonId.title ?? "Хичээл"
      : activeLessonEntry
        ? "Хичээл"
        : null;

  const activeLessonThumb =
    activeLessonEntry && typeof activeLessonEntry.lessonId !== "string"
      ? activeLessonEntry.lessonId.thumbnail
      : undefined;

  const activeLessonVideoUrl =
    activeLessonEntry && typeof activeLessonEntry.lessonId !== "string"
      ? activeLessonEntry.lessonId.videoUrl
      : undefined;

  const handleHeroPlay = () => {
    if (!activeLessonVideoUrl) return;
    const fileId = parseDriveFileId(activeLessonVideoUrl);
    const previewUrl = activeLessonVideoUrl.includes('drive.google.com')
      ? `https://drive.google.com/file/d/${fileId}/preview`
      : activeLessonVideoUrl;
    setHeroDriveFileId(previewUrl);
    setHeroPlaying(true);
  };

  const handleHeroClose = () => setHeroPlaying(false);

  return (
    <div className="flex flex-col min-h-screen bg-surface-alt">
      {/* Header */}
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
              <div className="flex items-center gap-2 text-sm">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-alt"
                  style={{
                    boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.08), inset -2px -2px 4px rgba(255,255,255,0.9)",
                  }}
                >
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium hidden sm:inline text-foreground">
                  {user.name}
                </span>
              </div>
            )}
            {user && (
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl transition-all text-error bg-surface-alt"
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

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
          {loading && (
            <p className="text-sm text-muted">Ачаалж байна...</p>
          )}

          {!loading && !course && (
            <div className="rounded-xl overflow-hidden" style={EMPTY_STATE_SURFACE}>
              <EmptyState tone="error" message="Курс олдсонгүй" />
            </div>
          )}

          {!loading && course && (
            <>
              <nav className="flex items-center gap-1.5 text-xs sm:text-sm mb-3 flex-wrap text-muted">
                <Link href="/courses" className="hover:underline text-primary">
                  Хичээлүүд
                </Link>
                <ChevronRight size={14} className="shrink-0 opacity-60" />
                <span className="truncate font-medium text-[#3f3f46]">
                  {course.name}
                </span>
              </nav>

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div className="min-w-0 flex-1">
                  <h1
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-[#18181b]"
                  >
                    {course.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-[#52525b]">
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen size={16} className="text-primary" />
                      {sortedLessons.length} хичээл
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={16} className="text-primary" />
                      {course.durationDays} өдөр
                    </span>
                    {!course.isFree && (
                      <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-[#18181b]">
                        <CircleDollarSign size={16} className="text-primary" />
                        ₮{course.price.toLocaleString()}
                      </span>
                    )}
                    {course.isFree && (
                      <span className="inline-flex items-center gap-1.5 font-semibold px-2 py-1 rounded-lg text-primary bg-primary/10">
                        Үнэгүй
                      </span>
                    )}
                  </div>
                </div>
                {!course.isFree && !hasAccess() && user && (
                  <motion.button
                    onClick={() => router.push(`/payment/${courseId}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl text-base font-semibold text-white flex items-center gap-2 bg-primary"
                    style={{
                      boxShadow: "4px 4px 10px rgba(43, 95, 111, 0.25)",
                    }}
                  >
                    <CircleDollarSign className="w-5 h-5" />
                    Худалдан авах
                  </motion.button>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                <div className="flex-1 min-w-0 w-full space-y-6">
                  <motion.div
                    className="relative w-full rounded-2xl overflow-hidden aspect-video bg-zinc-900 shadow-sm"
                    style={{
                      boxShadow: `
                      4px 4px 10px rgba(0,0,0,0.08),
                      -4px -4px 10px rgba(255,255,255,0.7)
                    `,
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {activeLessonEntry && !isLessonAccessible(activeLessonEntry) ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                        <img
                          src={
                            activeLessonThumb?.trim()
                              ? activeLessonThumb
                              : course.coverImage?.trim()
                                ? course.coverImage
                                : EMPTY_VIDEO_POSTER_SRC
                          }
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={fallbackToEmptyVideoPoster}
                        />
                        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)" }} />
                        <div className="relative flex flex-col items-center gap-3">
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                          >
                            <Lock size={26} />
                          </div>
                          <p className="text-sm font-semibold opacity-90">Энэ хичээл хаалттай байна</p>
                          <p className="text-xs opacity-60 text-center max-w-[220px]">
                            Курс худалдан авснаар бүх хичээлд нэвтрэх боломжтой
                          </p>
                          {user && !course.isFree && (
                            <motion.button
                              onClick={() => router.push(`/payment/${courseId}`)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="mt-1 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white"
                              style={{ boxShadow: "4px 4px 10px rgba(43,95,111,0.35)" }}
                            >
                              Худалдан авах
                            </motion.button>
                          )}
                        </div>
                      </div>
                    ) : heroPlaying && heroDriveFileId ? (
                      <>
                        <iframe
                          key={heroDriveFileId}
                          src={heroDriveFileId}
                          className="absolute inset-0 w-full h-full"
                          allow="autoplay; fullscreen"
                          allowFullScreen
                          style={{ border: "none" }}
                        />
                        <button
                          type="button"
                          onClick={handleHeroClose}
                          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-opacity hover:opacity-90 text-white"
                          style={{ background: "rgba(0,0,0,0.55)" }}
                          title="Хаах"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : activeLessonEntry ? (
                      <>
                        <img
                          src={
                            activeLessonThumb?.trim()
                              ? activeLessonThumb
                              : course.coverImage?.trim()
                                ? course.coverImage
                                : EMPTY_VIDEO_POSTER_SRC
                          }
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={fallbackToEmptyVideoPoster}
                        />
                        <div
                          className="absolute inset-0"
                          style={{ background: "rgba(0,0,0,0.28)" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          {!activeLessonVideoUrl ? (
                            <div
                              className="rounded-xl overflow-hidden max-w-[90%] pointer-events-none"
                              style={EMPTY_STATE_SURFACE}
                            >
                              <EmptyState
                                size="inline"
                                message="Видео URL олдсонгүй"
                                className="py-3 px-1"
                              />
                            </div>
                          ) : (
                            <motion.button
                              type="button"
                              onClick={handleHeroPlay}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center justify-center rounded-full shadow-2xl text-white"
                              style={{
                                width: 56,
                                height: 56,
                                background: "rgba(255,255,255,0.18)",
                                backdropFilter: "blur(8px)",
                              }}
                              title="Тоглуулах"
                            >
                              <PlayCircle size={56} strokeWidth={1} />
                            </motion.button>
                          )}
                        </div>
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
                          }}
                        />
                        <p className="absolute bottom-4 left-4 right-4 text-white text-sm font-semibold drop-shadow-sm line-clamp-2 pointer-events-none">
                          {activeLessonTitle}
                        </p>
                      </>
                    ) : (
                      <>
                        <img
                          src={course.coverImage?.trim() ? course.coverImage : EMPTY_VIDEO_POSTER_SRC}
                          alt=""
                          className="absolute inset-0 w-full h-full object-contain"
                          onError={fallbackToEmptyVideoPoster}
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)" }}
                        />
                        <p className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium drop-shadow-sm line-clamp-2">
                          {course.description}
                        </p>
                      </>
                    )}
                  </motion.div>

                  <div
                    className="rounded-2xl p-4 sm:p-5 lg:p-6 bg-surface-alt"
                    style={{
                      boxShadow: `
                      4px 4px 10px rgba(0,0,0,0.08),
                      -4px -4px 10px rgba(255,255,255,0.7)
                    `,
                    }}
                  >
                    <div className="space-y-6">
                      <section>
                        <h2 className="text-lg font-bold mb-3 text-[#18181b]">
                          Тайлбар
                        </h2>
                        <p className="text-sm leading-relaxed text-[#52525b]">
                          {course.description}
                        </p>
                      </section>

                      {course.includedMerch.length > 0 && (
                        <section>
                          <h2 className="text-lg font-bold mb-4 text-[#18181b]">
                            Багтсан бараа
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {course.includedMerch.map((row) => {
                              const mid = merchIdStr(row);
                              const pop =
                                typeof row.merchId === "object" && row.merchId != null
                                  ? row.merchId
                                  : null;
                              const name = pop?.name ?? mid;
                              return (
                                <div
                                  key={mid}
                                  className="rounded-xl p-4 bg-surface-alt"
                                  style={{
                                    boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.08), inset -2px -2px 4px rgba(255,255,255,0.9)",
                                  }}
                                >
                                  {pop?.imageUrl && (
                                    <img
                                      src={pop.imageUrl}
                                      alt={name}
                                      className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                  )}
                                  <h3 className="font-semibold text-sm mb-1 text-[#18181b]">
                                    {name}
                                  </h3>
                                  <p className="text-xs text-muted">
                                    Тоо ширхэг: {row.quantity}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="w-full lg:w-[440px] shrink-0 flex flex-col gap-5">
                  <div
                    className="rounded-2xl p-5 flex flex-col bg-surface-alt"
                    style={{
                      boxShadow: `
                      4px 4px 10px rgba(0,0,0,0.08),
                      -4px -4px 10px rgba(255,255,255,0.7)
                    `,
                    }}
                  >
                    <h2 className="text-sm font-bold mb-4 text-[#18181b]">
                      Хичээлүүд
                    </h2>

                    <ul className="flex flex-col gap-2 max-h-[min(520px,55vh)] overflow-y-auto p-2">
                      {sortedLessons.length === 0 && (
                        <li className="block w-full list-none rounded-xl overflow-hidden" style={EMPTY_STATE_SURFACE}>
                          <EmptyState size="compact" message="Хичээл байхгүй байна" className="py-4" />
                        </li>
                      )}
                      {sortedLessons.map((l, idx) => {
                        const title =
                          typeof l.lessonId === "string"
                            ? l.lessonId
                            : l.lessonId?.title ?? "—";
                        const lid = lessonIdStr(l);
                        const isActive = activeLessonIdx === idx;
                        const lessonThumb = typeof l.lessonId === "string" ? l.lessonId : l.lessonId?.thumbnail;
                        const accessible = isLessonAccessible(l);
                        return (
                          <li key={lid}>
                            <button
                              type="button"
                              onClick={() => accessible && setActiveLessonIdx(idx)}
                              disabled={!accessible}
                              title={!accessible ? "Энэ хичээл нэвтрэх боломжгүй байна" : undefined}
                              className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all text-left w-full"
                              style={{
                                background: isActive
                                  ? "rgba(43,95,111,0.12)"
                                  : "var(--surface-alt)",
                                boxShadow: isActive
                                  ? `
                                    inset 2px 2px 5px rgba(0,0,0,0.15),
                                    inset -2px -2px 5px rgba(255,255,255,0.7)
                                  `
                                  : `
                                    2px 2px 6px rgba(0,0,0,0.08),
                                    -2px -2px 6px rgba(255,255,255,0.6)
                                  `,
                                opacity: accessible ? 1 : 0.45,
                                cursor: accessible ? "pointer" : "not-allowed",
                              }}
                            >
                              <span
                                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                                style={{
                                  background: isActive ? "var(--primary)" : "#e4e4e7",
                                  color: isActive ? "#fff" : "#52525b",
                                }}
                              >
                                {accessible ? (
                                  <p className="text-xs font-semibold mt-1 text-white">
                                    {idx + 1}
                                  </p>
                                ) : (
                                  <Lock size={13} />
                                )}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold leading-snug line-clamp-2 text-[#18181b]">
                                  {title}
                                </p>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
