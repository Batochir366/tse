/**
 * Google Drive share URL эсвэл file ID-г цэвэр file ID болгоно.
 * https://drive.google.com/file/d/{ID}/view  →  {ID}
 * Аль хэдийн цэвэр ID бол өөрчлөхгүй буцаана.
 */
export function parseDriveFileId(input: string): string {
  const match = input.trim().match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : input.trim();
}
