"use client";

import { useEffect, useState } from "react";
import Modal from "../../../../../components/Modal";
import GroupedIntegerInput from "../../../../../components/GroupedIntegerInput";
import { merchService } from "../../../../../lib/services/merch.service";
import { MerchItem } from "../../../../../lib/api/merch.api";
import { useToast, getErrMsg } from "../../../../../lib/toast";
import EmptyState from "../../../../../components/EmptyState";

interface Props {
  open: boolean;
  onClose: () => void;
  existingMerchIds: Set<string>;
  onAddMerch: (merchId: string, quantity: number) => Promise<void>;
}

export default function MerchPicker({
  open,
  onClose,
  existingMerchIds,
  onAddMerch,
}: Props) {
  const toast = useToast();
  const [items, setItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [qtyById, setQtyById] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    merchService
      .getAll()
      .then((data) => setItems(data as MerchItem[]))
      .catch(() => toast.error("Бараа ачаалахад алдаа гарлаа"))
      .finally(() => setLoading(false));
  }, [open, toast]);

  const available = items.filter((m) => !existingMerchIds.has(m._id));

  const getQty = (id: string) => qtyById[id] ?? 1;

  const handleAdd = async (merchId: string) => {
    const quantity = Math.max(1, getQty(merchId));
    setAdding(merchId);
    try {
      await onAddMerch(merchId, quantity);
      onClose();
    } catch (err) {
      toast.error(getErrMsg(err, "Нэмэхэд алдаа гарлаа"));
    } finally {
      setAdding(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Бараа нэмэх" maxWidth="max-w-md">
      {loading ? (
        <p className="text-sm" style={{ color: "#0c756f99" }}>Ачаалж байна...</p>
      ) : available.length === 0 ? (
        <EmptyState size="compact" message="Нэмэх боломжтой бараа байхгүй" className="py-2" />
      ) : (
        <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {available.map((m) => (
            <li
              key={m._id}
              className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(12,117,111,0.08)" }}
            >
              <span className="text-sm font-medium flex-1 min-w-0 truncate" style={{ color: "#000201" }}>
                {m.name}
              </span>
              <GroupedIntegerInput
                min={1}
                value={getQty(m._id)}
                onChange={(n) => setQtyById((q) => ({ ...q, [m._id]: n }))}
                className="w-20 text-center rounded-lg px-2 py-1 text-sm outline-none text-black"
                style={{
                  border: "1px solid rgba(12,117,111,0.2)",
                  background: "rgba(255,255,255,0.9)",
                }}
              />
              <button
                type="button"
                disabled={adding === m._id}
                onClick={() => handleAdd(m._id)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                style={{ background: "#0c756f" }}
              >
                {adding === m._id ? "..." : "Нэмэх"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
