/** Trimmed lowercase substring match across optional text parts. */
export function matchesSearch(
  query: string,
  ...textParts: (string | number | undefined | null)[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const blob = textParts
    .filter((p) => p !== undefined && p !== null && p !== "")
    .map((p) => String(p).toLowerCase())
    .join(" ");
  return blob.includes(q);
}
