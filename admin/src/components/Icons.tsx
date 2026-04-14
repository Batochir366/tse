"use client";

import Image from "next/image";

/** `public/edit.png` at 20×20px */
export function EditIcon({ className = "" }: { className?: string }) {
  return (
    <img
      src="/edit.png"
      alt=""
      width={20}
      height={20}
      className={`size-4 shrink-0 object-contain ${className}`.trim()}
      aria-hidden
    />
  );
}

/** `public/delete.webp` at 20×20px */
export function DeleteIcon({ className = "" }: { className?: string }) {
  return (
    <img
      src="/delete.webp"
      alt=""
      width={20}
      height={20}
      className={`size-5 shrink-0 object-contain ${className}`.trim()}
      aria-hidden
    />
  );
}

/** `public/plus.webp` at 14×14px (styled) */
export function PlusIcon() {
  return (
    <Image
      style={{ width: "14px", height: "14px", filter: "invert(1) brightness(10)" }}
      src="/plus.webp"
      alt="Logo"
      width={100}
      height={50}
      className="shrink-0"
    />
  );
}
