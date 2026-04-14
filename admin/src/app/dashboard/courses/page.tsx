"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Header from "../../../components/Header";
import { PlusIcon } from "../../../components/Icons";
import Modal from "../../../components/Modal";
import { coursesService } from "../../../lib/services/courses.service";
import { Course } from "../../../lib/api/courses.api";
import { useToast, getErrMsg } from "../../../lib/toast";
import CourseCard from "./components/CourseCard";
import CourseForm, {
  CourseFormActions,
  CourseFormValues,
  EMPTY_COURSE_FORM,
} from "./components/CourseForm";
import CourseSkeleton from "./components/CourseSkeleton";
import EmptyState from "../../../components/EmptyState";
import { useDashboardSearch } from "../../../context/DashboardSearchContext";
import { matchesSearch } from "../../../lib/searchFilter";

function validateCourseForm(form: CourseFormValues): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!form.name.trim()) errs.name = "Нэр оруулна уу";
  if (!form.description.trim()) errs.description = "Тайлбар оруулна уу";
  if (form.price <= 0) errs.price = "Үнэ 0-с их байх ёстой";
  return errs;
}

export default function CoursesPage() {
  const toast = useToast();
  const { searchQuery } = useDashboardSearch();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CourseFormValues>(EMPTY_COURSE_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await coursesService.getAll();
      setCourses(data as Course[]);
    } catch (err) {
      toast.error(getErrMsg(err, "Курс ачаалахад алдаа гарлаа"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredCourses = useMemo(
    () =>
      courses.filter((c) =>
        matchesSearch(searchQuery, c.name, c.description)
      ),
    [courses, searchQuery]
  );

  const openCreate = () => {
    setForm(EMPTY_COURSE_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const patchForm = (patch: Partial<CourseFormValues>) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = async () => {
    const errs = validateCourseForm(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await coursesService.create({
        name: form.name,
        description: form.description,
        coverImage: form.coverImage || undefined,
        price: form.price,
        durationDays: form.durationDays,
        order: form.order,
        lessons: [],
        includedMerch: [],
      });
      toast.success("Курс амжилттай нэмэгдлээ");
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error(getErrMsg(err, "Хадгалахад алдаа гарлаа"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "#0c756f99" }}>{filteredCourses.length} курс</p>
          <motion.button
            onClick={openCreate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#0c756f", boxShadow: "3px 3px 10px rgba(12,117,111,0.3)" }}
          >
            <PlusIcon /> Нэмэх
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#efeadb",
              boxShadow:
                "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.5)",
            }}
          >
            <EmptyState message="Курс байхгүй байна" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#efeadb",
              boxShadow:
                "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.5)",
            }}
          >
            <EmptyState message="Хайлтын үр дүн олдсонгүй" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map((c, idx) => (
              <CourseCard key={c._id} course={c} index={idx} />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Шинэ курс"
        maxWidth="max-w-lg"
      >
        <CourseForm
          values={form}
          errors={errors}
          onChange={patchForm}
          onClearError={(key) => setErrors((e) => ({ ...e, [key]: "" }))}
          showActive={false}
        />
        <CourseFormActions
          onCancel={() => setModalOpen(false)}
          onSave={handleSave}
          saving={saving}
        />
      </Modal>
    </div>
  );
}
