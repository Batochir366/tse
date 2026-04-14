"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PlusIcon } from "../../../components/Icons";
import Header from "../../../components/Header";
import { announcementsService } from "../../../lib/services/announcements.service";
import { Announcement } from "../../../lib/api/announcements.api";
import { useToast, getErrMsg } from "../../../lib/toast";
import { EMPTY_FORM, AnnouncementFormState } from "./constants";
import AnnouncementsGrid from "./components/AnnouncementsGrid";
import AnnouncementFormModal from "./components/AnnouncementFormModal";
import DeleteAnnouncementModal from "./components/DeleteAnnouncementModal";
import { useDashboardSearch } from "../../../context/DashboardSearchContext";
import { matchesSearch } from "../../../lib/searchFilter";

export default function AnnouncementsPage() {
  const toast = useToast();
  const { searchQuery } = useDashboardSearch();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems((await announcementsService.getAll()) as Announcement[]);
    } catch (err) {
      toast.error(getErrMsg(err, "Мэдэгдэл ачаалахад алдаа гарлаа"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((a) =>
        matchesSearch(searchQuery, a.title, a.description, a.type)
      ),
    [items, searchQuery]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({
      title: a.title,
      type: a.type,
      description: a.description,
      imageUrl: a.imageUrl,
      link: a.link,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Гарчиг оруулна уу";
    if (!form.description.trim()) errs.description = "Тайлбар оруулна уу";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await announcementsService.update(editing._id, form);
        toast.success("Мэдэгдэл амжилттай шинэчлэгдлээ");
      } else {
        await announcementsService.create(form);
        toast.success("Мэдэгдэл амжилттай нэмэгдлээ");
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error(getErrMsg(err, "Хадгалахад алдаа гарлаа"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await announcementsService.delete(confirmId);
      toast.success("Мэдэгдэл устгагдлаа");
      setConfirmId(null);
      await load();
    } catch (err) {
      toast.error(getErrMsg(err, "Устгахад алдаа гарлаа"));
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (a: Announcement) => {
    try {
      await announcementsService.update(a._id, { isActive: !a.isActive });
      toast.success(a.isActive ? "Мэдэгдэл идэвхгүй боллоо" : "Мэдэгдэл идэвхжлээ");
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
          <p className="text-sm" style={{ color: "#0c756f99" }}>{filteredItems.length} мэдээлэл</p>
          <motion.button
            type="button"
            onClick={openCreate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#0c756f", boxShadow: "3px 3px 10px rgba(12,117,111,0.3)" }}
          >
            <PlusIcon /> Нэмэх
          </motion.button>
        </div>
        <AnnouncementsGrid
          items={filteredItems}
          loading={loading}
          allItemsCount={items.length}
          onToggleActive={handleToggleActive}
          onEdit={openEdit}
          onDelete={setConfirmId}
        />
      </div>

      <AnnouncementFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        isEditing={!!editing}
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        saving={saving}
        onSave={handleSave}
      />

      <DeleteAnnouncementModal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        deleting={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
