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
} from "lucide-react";
import { DeleteIcon, EditIcon, PlusIcon } from "../../../../components/Icons";
import EmptyState from "../../../../components/EmptyState";
import Header from "../../../../components/Header";
import Modal from "../../../../components/Modal";
import { coursesService } from "../../../../lib/services/courses.service";
import { parseDriveFileId } from "../../../../lib/formatters";
import {
  CourseDetail,
  CourseLessonPopulated,
} from "../../../../lib/api/courses.api";
import { useToast, getErrMsg } from "../../../../lib/toast";
import CourseForm, {
  CourseFormActions,
  CourseFormValues,
  EMPTY_COURSE_FORM,
} from "../components/CourseForm";
import LessonPicker from "./components/LessonPicker";
import MerchPicker from "./components/MerchPicker";
import { MerchCourseBundleCard } from "../../../../components/merch/MerchCard";
import { EMPTY_VIDEO_POSTER_SRC, fallbackToEmptyVideoPoster } from "../../../../lib/media";

const ACCENT = "#0c756f";
const ACCENT_SOFT = "rgba(12,117,111,0.1)";
const PAGE_BG = "#efeadb";
/** Header search pill-тай ижил — хоосон төлөвийн хүрээ */
const EMPTY_STATE_SURFACE: CSSProperties = {
  background: "#efeadb",
  boxShadow: `
      3px 3px 6px rgba(0,0,0,0.10),
      -3px -3px 6px rgba(255,255,255,0.6),

      inset 2px 2px 4px rgba(0,0,0,0.12),
      inset -2px -2px 4px rgba(255,255,255,0.8)
    `,
};
/** Курсын багц (plan / package card) */

function lessonIdStr(entry: CourseLessonPopulated): string {
  const x = entry.lessonId;
  return typeof x === "string" ? x : x._id;
}

function merchIdStr(m: { merchId: { _id: string } | string }): string {
  const x = m.merchId;
  return typeof x === "string" ? x : x._id;
}

/** `activeLessonIdx` after moving one lesson from `from` to `to` */
function activeLessonIdxAfterReorder(
  active: number | null,
  from: number,
  to: number,
): number | null {
  if (active === null) return null;
  if (from === to) return active;
  if (active === from) return to;
  if (from < to) {
    if (active > from && active <= to) return active - 1;
  } else if (active >= to && active < from) {
    return active + 1;
  }
  return active;
}

function validateCourseForm(form: CourseFormValues): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!form.name.trim()) errs.name = "Нэр оруулна уу";
  if (!form.description.trim()) errs.description = "Тайлбар оруулна уу";
  if (form.price <= 0) errs.price = "Үнэ 0-с их байх ёстой";
  return errs;
}
export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const toast = useToast();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CourseFormValues>(EMPTY_COURSE_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingInfo, setSavingInfo] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [lessonPickerOpen, setLessonPickerOpen] = useState(false);
  const [merchPickerOpen, setMerchPickerOpen] = useState(false);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number | null>(0);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [heroDriveFileId, setHeroDriveFileId] = useState<string | null>(null);
  const dragLessonFromRef = useRef<number | null>(null);
  const [lessonDragOverIdx, setLessonDragOverIdx] = useState<number | null>(null);
  const [lessonDraggingIdx, setLessonDraggingIdx] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await coursesService.getOne(courseId)) as CourseDetail;
      setCourse(data);
      setForm({
        name: data.name,
        description: data.description,
        coverImage: data.coverImage ?? "",
        price: data.price,
        durationDays: data.durationDays,
        order: data.order,
        isActive: data.isActive,
        isFree: data.isFree,
      });
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

  const patchForm = (patch: Partial<CourseFormValues>) => setForm((f) => ({ ...f, ...patch }));

  const handleSaveInfo = async () => {
    const errs = validateCourseForm(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSavingInfo(true);
    try {
      await coursesService.update(courseId, {
        name: form.name,
        description: form.description,
        coverImage: form.coverImage || undefined,
        price: form.price,
        durationDays: form.durationDays,
        order: form.order,
        isActive: form.isActive,
        isFree: form.isFree,
      });
      toast.success("Мэдээлэл хадгалагдлаа");
      setSettingsModalOpen(false);
    } catch (err) {
      toast.error(getErrMsg(err, "Хадгалахад алдаа гарлаа"));
    } finally {
      setSavingInfo(false);
    }
  };

  const resetFormFromCourse = () => {
    if (!course) return;
    setForm({
      name: course.name,
      description: course.description,
      coverImage: course.coverImage ?? "",
      price: course.price,
      durationDays: course.durationDays,
      order: course.order,
      isActive: course.isActive,
      isFree: course.isFree,
    });
    setErrors({});
  };

  const openSettingsModal = () => {
    resetFormFromCourse();
    setSettingsModalOpen(true);
  };

  const closeSettingsModal = () => {
    resetFormFromCourse();
    setSettingsModalOpen(false);
  };

  const handleDeleteCourse = async () => {
    setDeletingCourse(true);
    try {
      await coursesService.delete(courseId);
      toast.success("Курс устгагдлаа");
      router.push("/dashboard/courses");
      setDeleteConfirmOpen(false);
    } catch (err) {
      toast.error(getErrMsg(err, "Устгахад алдаа гарлаа"));
    } finally {
      setDeletingCourse(false);
    }
  };

  const handleToggleActive = async () => {
    if (!course) return;
    const newActiveState = !course.isActive;
    try {
      await coursesService.update(courseId, { isActive: newActiveState });
      setCourse({ ...course, isActive: newActiveState });
      setForm({ ...form, isActive: newActiveState });
      toast.success(newActiveState ? "Идэвхжүүллээ" : "Идэвхгүй болголоо");
    } catch (err) {
      toast.error(getErrMsg(err, "Төлөв өөрчлөхөд алдаа гарлаа"));
    }
  };

  const handleToggleFree = async () => {
    if (!course) return;
    const newFreeState = !course.isFree;
    try {
      await coursesService.update(courseId, { isFree: newFreeState });
      setCourse({ ...course, isFree: newFreeState });
      setForm({ ...form, isFree: newFreeState });
      toast.success(newFreeState ? "Үнэгүй болгосон" : "Төлбөртэй болгосон");
    } catch (err) {
      toast.error(getErrMsg(err, "Төлөв өөрчлөхөд алдаа гарлаа"));
    }
  };

  const sortedLessons = course
    ? [...course.lessons].sort((a, b) => a.order - b.order)
    : [];


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
    // Google Drive URL бол preview format руу хөрвүүлнэ
    const fileId = parseDriveFileId(activeLessonVideoUrl);
    const previewUrl = activeLessonVideoUrl.includes('drive.google.com')
      ? `https://drive.google.com/file/d/${fileId}/preview`
      : activeLessonVideoUrl;
    setHeroDriveFileId(previewUrl);
    setHeroPlaying(true);
  };

  const handleHeroClose = () => setHeroPlaying(false);

  const reorderLessonsDrag = async (fromIndex: number, toIndex: number) => {
    if (!course || fromIndex === toIndex) return;
    const n = sortedLessons.length;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= n || toIndex >= n) return;
    const arr = [...sortedLessons];
    const [removed] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, removed);
    const reordered = arr.map((l, i) => ({ ...l, order: i }));
    const payload = reordered.map((l, i) => ({
      lessonId: lessonIdStr(l),
      order: i,
    }));
    const nextActive = activeLessonIdxAfterReorder(activeLessonIdx, fromIndex, toIndex);
    const prevCourse = course;
    const prevActive = activeLessonIdx;
    setCourse({ ...course, lessons: reordered });
    setActiveLessonIdx(nextActive);
    try {
      await coursesService.reorderLessons(courseId, payload);
    } catch (err) {
      setCourse(prevCourse);
      setActiveLessonIdx(prevActive);
      toast.error(getErrMsg(err, "Дараалал өөрчлөхөд алдаа гарлаа"));
    }
  };

  const removeLesson = async (lessonId: string) => {
    try {
      await coursesService.removeLesson(courseId, lessonId);
      toast.success("Хичээл хасагдлаа");
      setActiveLessonIdx(null);
    } catch (err) {
      toast.error(getErrMsg(err, "Хасахад алдаа гарлаа"));
    }
  };

  const existingLessonIds = new Set(
    course?.lessons.map((l) => lessonIdStr(l)) ?? [],
  );

  const existingMerchIds = new Set(
    course?.includedMerch.map((m) => merchIdStr(m)) ?? [],
  );

  return (
    <div className="flex flex-col min-h-full" style={{ background: PAGE_BG }}>
      <Header />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">

          {loading && (
            <p className="text-sm" style={{ color: "#71717a" }}>Ачаалж байна...</p>
          )}

          {!loading && !course && (
            <div className="rounded-xl overflow-hidden" style={EMPTY_STATE_SURFACE}>
              <EmptyState tone="error" message="Курс олдсонгүй" />
            </div>
          )}

          {!loading && course && (
            <>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs sm:text-sm mb-3 flex-wrap" style={{ color: "#71717a" }}>
                <Link href="/dashboard/courses" className="hover:underline" style={{ color: ACCENT }}>
                  Курсууд
                </Link>
                <ChevronRight size={14} className="shrink-0 opacity-60" />
                <span className="truncate font-medium" style={{ color: "#3f3f46" }}>
                  {course.name}
                </span>
              </nav>

              {/* Title + meta + actions */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <h1
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight"
                    style={{ color: "#18181b" }}
                  >
                    {course.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm" style={{ color: "#52525b" }}>
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen size={16} style={{ color: ACCENT }} />
                      {sortedLessons.length} хичээл
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={16} style={{ color: ACCENT }} />
                      {course.durationDays} өдөр
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums" style={{ color: "#18181b" }}>
                      <CircleDollarSign size={16} style={{ color: ACCENT }} />
                      ₮{course.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <motion.button
                    type="button"
                    onClick={openSettingsModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: "rgba(12,117,111,0.15)",
                      color: ACCENT,
                      boxShadow: "2px 2px 8px rgba(12,117,111,0.12)",
                    }}
                  >
                    <EditIcon />
                    Засах
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: "rgba(220,38,38,0.1)",
                      color: "#dc2626",
                      boxShadow: "2px 2px 8px rgba(220,38,38,0.08)",
                    }}
                  >
                    <DeleteIcon />
                    Устгах
                  </motion.button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                {/* ── Main column ── */}
                <div className="flex-1 min-w-0 w-full space-y-6">
                  {/* Hero: сонгосон хичээлийн видео (iframe) эсвэл cover / poster */}
                  <motion.div
                    style={{
                      background: "#efeadb",
                      boxShadow: `
                      4px 4px 10px rgba(0,0,0,0.08),
                      -4px -4px 10px rgba(255,255,255,0.7)
                    `,
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full rounded-2xl overflow-hidden aspect-video bg-zinc-900 shadow-sm"
                  >
                    {heroPlaying && heroDriveFileId ? (
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
                          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-opacity hover:opacity-90"
                          style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
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
                              className="flex items-center justify-center rounded-full shadow-2xl"
                              style={{
                                width: 56,
                                height: 56,
                                background: "rgba(255,255,255,0.18)",
                                backdropFilter: "blur(8px)",
                                color: "#fff",
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

                  {/* Нэг картад: тойм, үзүүлэлтүүд, хичээлүүд, бараа */}
                  <div
                    className="rounded-2xl p-4 sm:p-5 lg:p-6"
                    style={{
                      background: "#efeadb",
                      boxShadow: `
                      4px 4px 10px rgba(0,0,0,0.08),
                      -4px -4px 10px rgba(255,255,255,0.7)
                    `,
                    }}
                  >
                    <div className="space-y-8">

                      <section
                        className="space-y-4"
                        style={{ borderColor: "rgba(24, 24, 27, 0.08)" }}
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <h2 className="text-lg font-bold" style={{ color: "#18181b" }}>
                            Мерчүүд
                          </h2>
                          <button
                            type="button"
                            onClick={() => setMerchPickerOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-transform active:scale-[0.98] cursor-pointer"
                            style={{
                              background: ACCENT,
                            }}
                          >
                            <PlusIcon />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                          {course.includedMerch.length === 0 && (
                            <div
                              className="sm:col-span-2 rounded-xl overflow-hidden"
                              style={EMPTY_STATE_SURFACE}
                            >
                              <EmptyState size="compact" message="Бараа нэмэгдээгүй байна" className="py-8" />
                            </div>
                          )}
                          {course.includedMerch.map((row) => {
                            const mid = merchIdStr(row);
                            const pop =
                              typeof row.merchId === "object" && row.merchId != null
                                ? row.merchId
                                : null;
                            const name = pop?.name ?? mid;
                            return (
                              <MerchCourseBundleCard
                                key={mid}
                                name={name}
                                imageUrl={pop?.imageUrl}
                                type={pop?.type}
                                price={pop?.price}
                                quantity={row.quantity}
                                onRemove={async () => {
                                  try {
                                    await coursesService.removeMerch(courseId, mid);
                                    toast.success("Хасагдлаа");
                                  } catch (err) {
                                    toast.error(getErrMsg(err, "Алдаа гарлаа"));
                                  }
                                }}
                              />
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>

                {/* ── Sidebar ── */}
                <aside className="w-full lg:w-[440px] shrink-0 flex flex-col gap-5">
                  <div
                    className="rounded-2xl p-5 flex flex-col"
                    style={{
                      background: "#efeadb", boxShadow: `
                      4px 4px 10px rgba(0,0,0,0.08),
                      -4px -4px 10px rgba(255,255,255,0.7)
                    ` }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <h2 className="text-sm font-bold" style={{ color: "#18181b" }}>
                        Дараалал, видео
                      </h2>
                      <button
                        type="button"
                        onClick={() => setLessonPickerOpen(true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer"
                        style={{ background: ACCENT }}
                      >
                        <PlusIcon />
                      </button>
                    </div>

                    <ul className="flex flex-col gap-2 max-h-[min(520px,55vh)] overflow-y-auto p-2">
                      {sortedLessons.length === 0 && (
                        <li className="block w-full list-none rounded-xl overflow-hidden" style={EMPTY_STATE_SURFACE}>
                          <EmptyState size="compact" message="Хичээл нэмнэ үү" className="py-4" />
                        </li>
                      )}
                      {sortedLessons.map((l, idx) => {
                        const title =
                          typeof l.lessonId === "string"
                            ? l.lessonId
                            : l.lessonId?.title ?? "—";
                        const published =
                          typeof l.lessonId !== "string" && l.lessonId?.isPublished === true;
                        const lid = lessonIdStr(l);
                        const isActive = activeLessonIdx === idx;
                        return (
                          <li
                            key={lid}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                              setLessonDragOverIdx(idx);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              let from = dragLessonFromRef.current;
                              if (from === null) {
                                const raw = e.dataTransfer.getData("text/plain");
                                const parsed = parseInt(raw, 10);
                                if (!Number.isNaN(parsed)) from = parsed;
                              }
                              dragLessonFromRef.current = null;
                              setLessonDragOverIdx(null);
                              setLessonDraggingIdx(null);
                              if (from === null || from === idx) return;
                              void reorderLessonsDrag(from, idx);
                            }}
                          >
                            <div
                              draggable
                              role="button"
                              tabIndex={0}
                              onDragStart={(e) => {
                                const t = e.target as HTMLElement;
                                if (t.closest('button[aria-label="Устгах"]')) {
                                  e.preventDefault();
                                  return;
                                }
                                dragLessonFromRef.current = idx;
                                setLessonDraggingIdx(idx);
                                e.dataTransfer.effectAllowed = "move";
                                e.dataTransfer.setData("text/plain", String(idx));
                              }}
                              onDragEnd={() => {
                                dragLessonFromRef.current = null;
                                setLessonDraggingIdx(null);
                                setLessonDragOverIdx(null);
                              }}
                              onClick={() => setActiveLessonIdx(idx)}
                              onKeyDown={(e) => e.key === "Enter" && setActiveLessonIdx(idx)}
                              className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all text-left w-full cursor-grab active:cursor-grabbing select-none"
                              style={{
                                background: isActive
                                  ? "rgba(12,117,111,0.12)"
                                  : "#efeadb",

                                boxShadow: isActive
                                  ? `
        inset 2px 2px 5px rgba(0,0,0,0.15),
        inset -2px -2px 5px rgba(255,255,255,0.7)
      `
                                  : `
        2px 2px 6px rgba(0,0,0,0.08),
        -2px -2px 6px rgba(255,255,255,0.6)
      `,

                                opacity: lessonDraggingIdx === idx ? 0.5 : 1,
                              }}
                            >
                              <span
                                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                                style={{
                                  background: isActive ? ACCENT : "#e4e4e7",
                                  color: isActive ? "#fff" : "#52525b",
                                }}
                              >
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: "#18181b" }}>
                                  {title}
                                </p>
                                <p className="text-[11px] mt-1 font-medium" style={{ color: published ? "#16a34a" : "#a1a1aa" }}>
                                  {published ? "Нийтлэгдсэн" : "Нууц"}
                                </p>
                              </div>
                              <button
                                type="button"
                                draggable={false}
                                aria-label="Устгах"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLesson(lid);
                                }}
                                className="p-1.5 rounded-lg hover:scale-110 transition-transform shrink-0 cursor-pointer"
                                style={{ color: "#dc2626" }}
                              >
                                <DeleteIcon />
                              </button>
                            </div>
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

      <Modal
        open={settingsModalOpen}
        onClose={() => !savingInfo && closeSettingsModal()}
        title="Курс засварлах"
        maxWidth="max-w-lg"
      >
        <CourseForm
          values={form}
          errors={errors}
          onChange={patchForm}
          onClearError={(key) => setErrors((e) => ({ ...e, [key]: "" }))}
          showActive
        />
        <CourseFormActions
          onCancel={closeSettingsModal}
          onSave={handleSaveInfo}
          saving={savingInfo}
          saveLabel="Хадгалах"
        />
      </Modal>

      <LessonPicker
        open={lessonPickerOpen}
        onClose={() => setLessonPickerOpen(false)}
        existingLessonIds={existingLessonIds}
        onSelectLesson={async (lessonId) => {
          await coursesService.addLesson(courseId, lessonId);
          toast.success("Хичээл нэмэгдлээ");
        }}
      />

      <MerchPicker
        open={merchPickerOpen}
        onClose={() => setMerchPickerOpen(false)}
        existingMerchIds={existingMerchIds}
        onAddMerch={async (merchId, quantity) => {
          await coursesService.addMerch(courseId, merchId, quantity);
          toast.success("Бараа нэмэгдлээ");
        }}
      />

      <Modal
        open={deleteConfirmOpen}
        onClose={() => !deletingCourse && setDeleteConfirmOpen(false)}
        title="Устгах уу?"
        maxWidth="max-w-sm"
      >
        <p className="text-sm" style={{ color: "#18181b" }}>
          Энэ курсыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={deletingCourse}
            onClick={() => setDeleteConfirmOpen(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
            style={{ background: "rgba(0,0,0,0.06)", color: "#18181b" }}
          >
            Болих
          </button>
          <motion.button
            type="button"
            onClick={handleDeleteCourse}
            disabled={deletingCourse}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#dc2626", boxShadow: "3px 3px 10px rgba(220,38,38,0.25)" }}
          >
            {deletingCourse ? "Устгаж байна..." : "Устгах"}
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}
