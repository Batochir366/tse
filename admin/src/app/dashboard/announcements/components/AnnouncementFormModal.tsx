"use client";

import type { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import Modal from "../../../../components/Modal";
import { ANN_TYPES, AnnouncementFormState } from "../constants";

const INPUT_BASE = {
  background: "rgba(255,255,255,0.7)",
  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06)",
  color: "#000201",
} as const;

const FORM_FIELDS: { key: keyof AnnouncementFormState; label: string; placeholder: string }[] = [
  { key: "title", label: "Гарчиг *", placeholder: "Мэдэгдлийн гарчиг" },
  { key: "description", label: "Тайлбар *", placeholder: "Дэлгэрэнгүй тайлбар" },
  { key: "imageUrl", label: "Зурагны URL", placeholder: "https://..." },
  { key: "link", label: "Холбоос", placeholder: "https://..." },
];

interface Props {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: AnnouncementFormState;
  setForm: Dispatch<SetStateAction<AnnouncementFormState>>;
  errors: Record<string, string>;
  setErrors: Dispatch<SetStateAction<Record<string, string>>>;
  saving: boolean;
  onSave: () => void;
}

export default function AnnouncementFormModal({
  open,
  onClose,
  isEditing,
  form,
  setForm,
  errors,
  setErrors,
  saving,
  onSave,
}: Props) {
  const borderFor = (key: string) =>
    errors[key] ? "1px solid #f87171" : "1px solid rgba(12,117,111,0.15)";

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Мэдэгдэл засах" : "Шинэ мэдэгдэл"}>
      <div className="flex flex-col gap-3">
        {FORM_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
              {label}
            </label>
            <input
              value={String(form[key])}
              onChange={(e) => {
                setForm((f) => ({ ...f, [key]: e.target.value }));
                setErrors((e2) => ({ ...e2, [key]: "" }));
              }}
              placeholder={placeholder}
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{ ...INPUT_BASE, border: borderFor(key) }}
            />
            {errors[key] && <p className="text-xs" style={{ color: "#dc2626" }}>{errors[key]}</p>}
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
            Төрөл
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ ...INPUT_BASE, border: "1px solid rgba(12,117,111,0.15)" }}
          >
            {ANN_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: "rgba(0,0,0,0.06)", color: "#000201" }}
        >
          Болих
        </button>
        <motion.button
          type="button"
          onClick={onSave}
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "#0c756f", boxShadow: "3px 3px 10px rgba(12,117,111,0.3)" }}
        >
          {saving ? "Хадгалж байна..." : "Хадгалах"}
        </motion.button>
      </div>
    </Modal>
  );
}
