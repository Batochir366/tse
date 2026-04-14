"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  accent = "#0c756f",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      // whileHover={{ scale: 1.03, y: -3 }}
      // whileTap={{
      //   scale: 0.97,
      //   boxShadow: `
      //     inset 4px 4px 8px rgba(0,0,0,0.2),
      //     inset -4px -4px 8px rgba(255,255,255,0.8)
      //   `,
      // }}
      className="rounded-2xl p-5 flex items-center gap-4 select-none"
      style={{
        background: "#efeadb",
        boxShadow: `
          6px 6px 12px rgba(0,0,0,0.08),
          -6px -6px 12px rgba(255,255,255,0.5)
        `,
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: "#efeadb",
          boxShadow: `
            3px 3px 6px rgba(0,0,0,0.1),
            -3px -3px 6px rgba(255,255,255,0.7)
          `,
        }}
      >
        <Icon size={22} style={{ color: accent }} />
      </div>

      <div>
        <p
          className="text-2xl font-bold leading-tight"
          style={{ color: "#000201" }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        <p
          className="text-xs font-medium mt-0.5"
          style={{ color: "#0c756f99" }}
        >
          {title}
        </p>
      </div>
    </motion.div>
  );
}