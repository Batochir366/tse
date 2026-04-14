"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Header from "../../../components/Header";
import { PlusIcon } from "../../../components/Icons";
import Modal from "../../../components/Modal";
import { lessonsService } from "../../../lib/services/lessons.service";
import { Lesson } from "../../../lib/api/lessons.api";
import { useToast, getErrMsg } from "../../../lib/toast";
import LessonCard from "./components/LessonCard";
import LessonForm from "./components/LessonForm";
import LessonSkeleton from "./components/LessonSkeleton";
import EmptyState from "../../../components/EmptyState";
import { useDashboardSearch } from "../../../context/DashboardSearchContext";
import { matchesSearch } from "../../../lib/searchFilter";

export default function LessonsPage() {
  const toast = useToast();
  const { searchQuery } = useDashboardSearch();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await lessonsService.getAll();
      setLessons(data as Lesson[]);
    } catch (err) {
      toast.error(getErrMsg(err, "Хичээл ачаалахад алдаа гарлаа"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredLessons = useMemo(
    () =>
      lessons.filter((l) =>
        matchesSearch(searchQuery, l.title, l.description)
      ),
    [lessons, searchQuery]
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (l: Lesson) => {
    setEditing(l);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await lessonsService.delete(confirmId);
      toast.success("Хичээл устгагдлаа");
      setConfirmId(null);
      await load();
    } catch (err) {
      toast.error(getErrMsg(err, "Устгахад алдаа гарлаа"));
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await lessonsService.togglePublish(id);
      toast.success(current ? "Хичээл нуугдлаа" : "Хичээл нийтлэгдлээ");
      await load();
    } catch (err) {
      toast.error(getErrMsg(err, "Төлөв өөрчлөхөд алдаа гарлаа"));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "#0c756f99" }}>{filteredLessons.length} хичээл</p>
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
            {Array.from({ length: 6 }).map((_, i) => <LessonSkeleton key={i} />)}
          </div>
        ) : lessons.length === 0 ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#efeadb",
              boxShadow:
                "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.5)",
            }}
          >
            <EmptyState message="Хичээл байхгүй байна" />
          </div>
        ) : filteredLessons.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredLessons.map((r, idx) => (
              <LessonCard
                key={r._id}
                lesson={r}
                index={idx}
                onEdit={openEdit}
                onDelete={(id) => setConfirmId(id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>

      <LessonForm
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />

      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Устгах уу?" maxWidth="max-w-sm">
        <p className="text-sm" style={{ color: "#000201" }}>
          Энэ хичээлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setConfirmId(null)}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "rgba(0,0,0,0.06)", color: "#000201" }}
          >
            Болих
          </button>
          <motion.button
            onClick={handleDelete}
            disabled={deleting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#dc2626", boxShadow: "3px 3px 10px rgba(220,38,38,0.25)" }}
          >
            {deleting ? "Устгаж байна..." : "Устгах"}
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}
