"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Header from "../../../components/Header";
import { PlusIcon } from "../../../components/Icons";
import Modal from "../../../components/Modal";
import { MerchCardSkeleton, MerchCatalogCard } from "../../../components/merch/MerchCard";
import GroupedIntegerInput from "../../../components/GroupedIntegerInput";
import { merchService } from "../../../lib/services/merch.service";
import { MerchItem } from "../../../lib/api/merch.api";
import { useToast, getErrMsg } from "../../../lib/toast";
import EmptyState from "../../../components/EmptyState";
import { useDashboardSearch } from "../../../context/DashboardSearchContext";
import { matchesSearch } from "../../../lib/searchFilter";

const MERCH_TYPES = ["pin", "sticker", "tshirt", "hoodie", "mug", "other"];
const EMPTY_FORM = { name: "", type: "pin", imageUrl: "", price: 0, stock: 10 };

const INPUT_BASE = {
  background: "rgba(255,255,255,0.7)",
  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.06)",
  color: "#000201",
} as const;

export default function MerchPage() {
  const toast = useToast();
  const { searchQuery } = useDashboardSearch();
  const [items, setItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModalId, setStockModalId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState(0);
  const [editing, setEditing] = useState<MerchItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems((await merchService.getAll()) as MerchItem[]);
    } catch (err) {
      toast.error(getErrMsg(err, "Бараа ачаалахад алдаа гарлаа"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((m) =>
        matchesSearch(searchQuery, m.name, m.type)
      ),
    [items, searchQuery]
  );

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true); };
  const openEdit = (m: MerchItem) => {
    setEditing(m);
    setForm({ name: m.name, type: m.type, imageUrl: m.imageUrl, price: m.price, stock: m.stock });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Нэр оруулна уу";
    if (form.price <= 0) errs.price = "Үнэ 0-с их байх ёстой";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editing) {
        await merchService.updateStock(editing._id, form.stock);
        toast.success("Бараа амжилттай шинэчлэгдлээ");
      } else {
        await merchService.create(form);
        toast.success("Бараа амжилттай нэмэгдлээ");
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
      await merchService.delete(confirmId);
      toast.success("Бараа устгагдлаа");
      setConfirmId(null);
      await load();
    } catch (err) {
      toast.error(getErrMsg(err, "Устгахад алдаа гарлаа"));
    } finally {
      setDeleting(false);
    }
  };

  const handleStockUpdate = async () => {
    if (!stockModalId) return;
    setSaving(true);
    try {
      await merchService.updateStock(stockModalId, newStock);
      toast.success("Нөөц шинэчлэгдлээ");
      setStockModalId(null);
      await load();
    } catch (err) {
      toast.error(getErrMsg(err, "Нөөц шинэчлэхэд алдаа гарлаа"));
    } finally {
      setSaving(false);
    }
  };

  const borderFor = (key: string) =>
    errors[key] ? "1px solid #f87171" : "1px solid rgba(12,117,111,0.15)";

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "#0c756f99" }}>{filteredItems.length} бараа</p>
          <motion.button onClick={openCreate} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#0c756f", boxShadow: "3px 3px 10px rgba(12,117,111,0.3)" }}>
            <PlusIcon /> Нэмэх
          </motion.button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <MerchCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#efeadb",
              boxShadow:
                "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.5)",
              border: "1px solid #e4e4e7",
            }}
          >
            <EmptyState message="Бараа байхгүй байна" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#efeadb",
              boxShadow:
                "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.5)",
              border: "1px solid #e4e4e7",
            }}
          >
            <EmptyState message="Хайлтын үр дүн олдсонгүй" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((m) => (
              <MerchCatalogCard
                key={m._id}
                item={m}
                onEdit={() => openEdit(m)}
                onDelete={() => setConfirmId(m._id)}
                onStockClick={() => {
                  setStockModalId(m._id);
                  setNewStock(m.stock);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Бараа засах" : "Шинэ бараа"}>
        <div className="flex flex-col gap-3">
          {([
            { key: "name", label: "Нэр *", placeholder: "Барааны нэр" },
            { key: "imageUrl", label: "Зурагны URL", placeholder: "https://..." },
          ] as { key: keyof typeof EMPTY_FORM; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>{label}</label>
              <input
                value={String(form[key])}
                onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((e2) => ({ ...e2, [key]: "" })); }}
                placeholder={placeholder}
                className="rounded-xl px-3 py-2 text-sm outline-none"
                style={{ ...INPUT_BASE, border: borderFor(key) }}
              />
              {errors[key] && <p className="text-xs" style={{ color: "#dc2626" }}>{errors[key]}</p>}
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>Төрөл</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{ ...INPUT_BASE, border: "1px solid rgba(12,117,111,0.15)" }}>
              {MERCH_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>Үнэ (₮) *</label>
              <GroupedIntegerInput
                emptyWhenZero
                value={form.price}
                onChange={(n) => { setForm((f) => ({ ...f, price: n })); setErrors((e2) => ({ ...e2, price: "" })); }}
                className="rounded-xl px-3 py-2 text-sm outline-none"
                style={{ ...INPUT_BASE, border: borderFor("price") }}
              />
              {errors.price && <p className="text-xs" style={{ color: "#dc2626" }}>{errors.price}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>Нөөц</label>
              <GroupedIntegerInput
                value={form.stock}
                onChange={(n) => setForm((f) => ({ ...f, stock: n }))}
                className="rounded-xl px-3 py-2 text-sm outline-none"
                style={{ ...INPUT_BASE, border: "1px solid rgba(12,117,111,0.15)" }}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#000201" }}>Болих</button>
          <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#0c756f", boxShadow: "3px 3px 10px rgba(12,117,111,0.3)" }}>
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </motion.button>
        </div>
      </Modal>

      {/* Stock update modal */}
      <Modal open={!!stockModalId} onClose={() => setStockModalId(null)} title="Нөөц шинэчлэх" maxWidth="max-w-xs">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#000201" }}>Шинэ нөөцийн тоо</label>
          <GroupedIntegerInput
            value={newStock}
            onChange={setNewStock}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ ...INPUT_BASE, border: "1px solid rgba(12,117,111,0.15)" }}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setStockModalId(null)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#000201" }}>Болих</button>
          <motion.button onClick={handleStockUpdate} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#0c756f", boxShadow: "3px 3px 10px rgba(12,117,111,0.3)" }}>
            {saving ? "..." : "Хадгалах"}
          </motion.button>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Устгах уу?" maxWidth="max-w-sm">
        <p className="text-sm" style={{ color: "#000201" }}>Энэ барааг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirmId(null)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#000201" }}>Болих</button>
          <motion.button onClick={handleDelete} disabled={deleting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#dc2626", boxShadow: "3px 3px 10px rgba(220,38,38,0.25)" }}>
            {deleting ? "Устгаж байна..." : "Устгах"}
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}
