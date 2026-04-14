/**
 * Google Drive share URL эсвэл file ID-г цэвэр file ID болгоно.
 * https://drive.google.com/file/d/{ID}/view  →  {ID}
 * Аль хэдийн цэвэр ID бол өөрчлөхгүй буцаана.
 */
export function parseDriveFileId(input: string): string {
  const match = input.trim().match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : input.trim();
}

const groupedIntegerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

/** Бүхэл тоог мянганы таслалтай (жишээ нь 1,234,567) харуулах. */
export function formatGroupedInteger(n: number): string {
  return groupedIntegerFormatter.format(n);
}

/** Текстээс зөвхөн орон задлаж бүхэл тоо болгоно. Хоосон бол 0. */
export function parseDigitsToInt(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return 0;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}
