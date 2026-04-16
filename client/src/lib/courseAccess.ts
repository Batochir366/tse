import type { MeResponse } from "@/lib/api/auth.api";

const MS_PER_DAY = 86400000;

/** Курсын идэвхтэй эрх (хугацаа дуусаагүй) байгаа эсэх */
export function userHasActiveCourseAccess(
  user: MeResponse | null | undefined,
  courseId: string,
): boolean {
  if (!user) return false;
  const now = new Date();
  return user.courseAccess.some(
    (a) =>
      String(a.courseId) === String(courseId) &&
      new Date(a.expiresAt) > now,
  );
}

/** Идэвхтэй эрхийн дуусах огноо (байхгүй бол null) */
function getActiveCourseAccessExpiresAt(
  user: MeResponse | null | undefined,
  courseId: string,
): Date | null {
  if (!user) return null;
  const now = new Date();
  const hit = user.courseAccess.find(
    (a) =>
      String(a.courseId) === String(courseId) &&
      new Date(a.expiresAt) > now,
  );
  return hit ? new Date(hit.expiresAt) : null;
}

/** Эрхийн үлдсэн хоног (бүтэн өдрөөр дээш талрууд) */
export function getCourseAccessDaysRemaining(
  user: MeResponse | null | undefined,
  courseId: string,
): number | null {
  const exp = getActiveCourseAccessExpiresAt(user, courseId);
  if (!exp) return null;
  const ms = exp.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / MS_PER_DAY));
}
