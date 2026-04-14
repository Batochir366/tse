"use client";

import { Check } from "lucide-react";
import type { MerchItem } from "../../lib/api/merch.api";
import { DeleteIcon, EditIcon } from "../Icons";
import { EMPTY_VIDEO_POSTER_SRC, fallbackToEmptyVideoPoster } from "../../lib/media";

const ACCENT = "#0c756f";

function MerchThumb({
  imageUrl,
  name,
  className = "w-16 h-16 rounded-xl",
}: {
  imageUrl: string;
  name: string;
  className?: string;
}) {
  const src = imageUrl?.trim() ? imageUrl : EMPTY_VIDEO_POSTER_SRC;
  return (
    <img
      src={src}
      alt={imageUrl?.trim() ? name : ""}
      className={`object-cover shrink-0 bg-zinc-100 ${className}`}
      onError={fallbackToEmptyVideoPoster}
    />
  );
}


export function MerchCatalogCard({
  item,
  onEdit,
  onDelete,
  onStockClick,
}: {
  item: MerchItem;
  onEdit: () => void;
  onDelete: () => void;
  onStockClick: () => void;
}) {
  return (
    <article
      className="flex flex-col gap-3 p-4 rounded-2xl h-full"
      style={{
        border: "1px solid #e4e4e7",
        background: "#efeadb",
        boxShadow: `
          6px 6px 12px rgba(0,0,0,0.08),
          -6px -6px 12px rgba(255,255,255,0.5)
        `,
      }}
    >
      <div className="flex gap-3 min-w-0">
        <MerchThumb imageUrl={item.imageUrl} name={item.name} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold truncate" style={{ color: "#18181b" }}>
            {item.name}
          </h3>
          <p className="text-xs capitalize mt-0.5" style={{ color: "#71717a" }}>
            {item.type}
          </p>
          <p className="text-sm font-semibold mt-1.5" style={{ color: ACCENT }}>
            ₮{item.price.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 pt-1 border-t" style={{ borderColor: "#e4e4e7" }}>
        <button
          type="button"
          onClick={onStockClick}
          className="px-2.5 py-1 rounded-full text-xs font-semibold hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: item.stock > 5 ? "#dcfce7" : "#fee2e2",
            color: item.stock > 5 ? "#16a34a" : "#dc2626",
          }}
        >
          {item.stock.toLocaleString()} ширхэг
        </button>
        <div className="flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ background: "rgba(12,117,111,0.1)", color: ACCENT }}
            aria-label="Засах"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}
            aria-label="Устгах"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

export function MerchCourseBundleCard({
  name,
  imageUrl,
  type,
  price,
  quantity,
  onRemove,
}: {
  name: string;
  imageUrl?: string;
  type?: string;
  price?: number;
  quantity: number;
  onRemove: () => void;
}) {
  const hasUnitPrice = price != null && price > 0;
  const unitPriceLabel = hasUnitPrice ? `₮${price!.toLocaleString()}` : "—";
  const lineTotal =
    hasUnitPrice && quantity > 0 ? quantity * price! : null;
  const lineTotalLabel =
    lineTotal != null ? `₮${lineTotal.toLocaleString()}` : "—";

  return (
    <article
      className="flex flex-col rounded-[1.75rem] overflow-hidden h-full min-h-0"
      style={{
        background: "#efeadb",
        boxShadow: `
        6px 6px 12px rgba(0,0,0,0.08),
        -6px -6px 12px rgba(255,255,255,0.5)
      `,
      }}
    >
      {/* Дээд хэсэг — plan header */}
      <div
        className="relative px-5 pt-5 pb-4 flex justify-between items-start"
      >
        <div className="flex gap-3.5 min-w-0 pr-16">
          <MerchThumb
            imageUrl={imageUrl ?? ""}
            name={name}
            className="w-17 h-17 rounded-2xl ring-2 ring-white/80 shadow-sm"
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <h3
              className="text-base sm:text-lg font-bold leading-snug line-clamp-2"
              style={{ color: "#1c1917" }}
            >
              {name}
            </h3>
            {type ? (
              <p className="text-xs capitalize mt-1 font-medium" style={{ color: "#78716c" }}>
                {type}
              </p>
            ) : null}
            <p className="text-sm font-semibold mt-1.5" style={{ color: ACCENT }}>
              {lineTotalLabel} ₮
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-2 p-1 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{
            background: "rgba(220, 38, 38, 0.1)",
            color: "#dc2626",
            boxShadow: "2px 2px 8px rgba(220, 38, 38, 0.08)",
          }}
        >
          <DeleteIcon />
        </button>

      </div>






    </article>
  );
}

export function MerchCardSkeleton() {
  return (
    <div
      className="animate-pulse flex flex-col gap-3 p-4 rounded-2xl h-full"
      style={{ border: "1px solid #e4e4e7", background: "#fafafa" }}
    >
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-xl bg-zinc-200 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-zinc-200 rounded w-4/5" />
          <div className="h-3 bg-zinc-200 rounded w-1/3" />
          <div className="h-4 bg-zinc-200 rounded w-1/4" />
        </div>
      </div>
      <div className="h-8 bg-zinc-200 rounded-lg w-full" />
    </div>
  );
}
