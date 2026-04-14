"use client";

import { Announcement } from "../../../../lib/api/announcements.api";
import AnnouncementCard from "./AnnouncementCard";

interface Props {
  items: Announcement[];
  loading: boolean;
  /** Total before search filter; used to show search-empty vs global empty */
  allItemsCount: number;
  onToggleActive: (a: Announcement) => void;
  onEdit: (a: Announcement) => void;
  onDelete: (id: string) => void;
}

export default function AnnouncementsGrid({
  items,
  loading,
  allItemsCount,
  onToggleActive,
  onEdit,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <p className="text-sm py-12 text-center" style={{ color: "#0c756f99" }}>
        Ачааллаж байна...
      </p>
    );
  }
  if (items.length === 0) {
    const searchMiss = allItemsCount > 0;
    return (
      <p className="text-sm py-12 text-center" style={{ color: "#0c756f99" }}>
        {searchMiss ? "Хайлтын үр дүн олдсонгүй" : "Мэдэгдэл байхгүй байна"}
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((a, index) => (
        <AnnouncementCard
          key={a._id}
          announcement={a}
          index={index}
          onToggleActive={onToggleActive}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
