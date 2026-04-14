"use client";

import { motion } from "framer-motion";
import Modal from "../../../../components/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  deleting: boolean;
  onConfirm: () => void;
}

export default function DeleteAnnouncementModal({ open, onClose, deleting, onConfirm }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Устгах уу?" maxWidth="max-w-sm">
      <p className="text-sm" style={{ color: "#000201" }}>
        Энэ мэдэгдлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
      </p>
      <div className="flex justify-end gap-2">
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
          onClick={onConfirm}
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
  );
}
