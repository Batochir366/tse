"use client";

import { motion } from "framer-motion";
import GroupedIntegerInput from "../../../../components/GroupedIntegerInput";
import IsActiveToggle from "../../../../components/IsActiveToggle";

const INPUT_BASE = {
  background: "rgba(255,255,255,0.7)",
  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06)",
  color: "#000201",
} as const;

export interface CourseFormValues {
  name: string;
  description: string;
  coverImage: string;
  price: number;
  durationDays: number;
  order: number;
  isActive: boolean;
  isFree: boolean;
}

export const EMPTY_COURSE_FORM: CourseFormValues = {
  name: "",
  description: "",
  coverImage: "",
  price: 0,
  durationDays: 30,
  order: 0,
  isActive: true,
  isFree: false,
};

interface Props {
  values: CourseFormValues;
  errors: Record<string, string>;
  onChange: (patch: Partial<CourseFormValues>) => void;
  onClearError: (key: string) => void;
  showActive?: boolean;
}

export default function CourseForm({
  values: form,
  errors,
  onChange,
  onClearError,
  showActive = false,
}: Props) {
  const borderFor = (key: string) =>
    errors[key] ? "1px solid #f87171" : "1px solid rgba(12,117,111,0.15)";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
          Нэр *
        </label>
        <input
          value={form.name}
          onChange={(e) => {
            onChange({ name: e.target.value });
            onClearError("name");
          }}
          placeholder="Курсын нэр"
          className="rounded-xl px-3 py-2 text-sm outline-none"
          style={{ ...INPUT_BASE, border: borderFor("name") }}
        />
        {errors.name && <p className="text-xs" style={{ color: "#dc2626" }}>{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
          Тайлбар *
        </label>
        <textarea
          value={form.description}
          onChange={(e) => {
            onChange({ description: e.target.value });
            onClearError("description");
          }}
          placeholder="Тайлбар"
          rows={3}
          className="rounded-xl px-3 py-2 text-sm outline-none resize-none"
          style={{ ...INPUT_BASE, border: borderFor("description") }}
        />
        {errors.description && (
          <p className="text-xs" style={{ color: "#dc2626" }}>{errors.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
          Cover зураг URL
        </label>
        <input
          value={form.coverImage}
          onChange={(e) => onChange({ coverImage: e.target.value })}
          placeholder="https://..."
          className="rounded-xl px-3 py-2 text-sm outline-none"
          style={{ ...INPUT_BASE, border: "1px solid rgba(12,117,111,0.15)" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
            Үнэ (₮) *
          </label>
          <GroupedIntegerInput
            emptyWhenZero
            value={form.price}
            onChange={(n) => {
              onChange({ price: n });
              onClearError("price");
            }}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ ...INPUT_BASE, border: borderFor("price") }}
          />
          {errors.price && <p className="text-xs" style={{ color: "#dc2626" }}>{errors.price}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
            Хугацаа (өдөр) *
          </label>
          <GroupedIntegerInput
            value={form.durationDays}
            onChange={(n) => onChange({ durationDays: n })}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ ...INPUT_BASE, border: "1px solid rgba(12,117,111,0.15)" }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
          Жагсаалтын дараалал
        </label>
        <GroupedIntegerInput
          value={form.order}
          onChange={(n) => onChange({ order: n })}
          className="rounded-xl px-3 py-2 text-sm outline-none"
          style={{ ...INPUT_BASE, border: "1px solid rgba(12,117,111,0.15)" }}
        />
      </div>

      {showActive && (
        <div className="flex justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
              Төлөв
            </span>
            <IsActiveToggle
              isActive={form.isActive}
              onToggle={() => onChange({ isActive: !form.isActive })}

            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>
              Үнэгүй эсэх
            </span>
            <IsActiveToggle
              isActive={form.isFree}
              onToggle={() => onChange({ isFree: !form.isFree })}

            />
          </div>
        </div>
      )}
    </div>
  );
}

export function CourseFormActions({
  onCancel,
  onSave,
  saving,
  saveLabel = "Хадгалах",
}: {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button
        type="button"
        onClick={onCancel}
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
        {saving ? "Хадгалж байна..." : saveLabel}
      </motion.button>
    </div>
  );
}
