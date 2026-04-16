import User from "../models/User";
import Course from "../models/Course";
import type { ICourseAccess } from "../models/User";
import { sendCourseAccessExpiringReminderEmail } from "../utils/mailer";

const MS_PER_DAY = 86400000;

/** `expiresAt` нь одоогоос өмнө болсон эрхүүдийг хэрэглэгчийн массиваас хасна. */
export async function pruneExpiredCourseAccess(): Promise<number> {
  const now = new Date();
  const users = await User.find({
    courseAccess: { $elemMatch: { expiresAt: { $lte: now } } },
  }).select("courseAccess");

  let changed = 0;
  for (const u of users) {
    const next = u.courseAccess.filter((a) => a.expiresAt > now);
    if (next.length !== u.courseAccess.length) {
      u.courseAccess = next;
      await u.save();
      changed++;
    }
  }
  if (changed > 0) {
    console.log(`[pruneExpiredCourseAccess] cleared expired rows for ${changed} user(s)`);
  }
  return changed;
}

/**
 * Эрх дуусахад ~7 хоног үлдсэн үед (6–7 хоногийн цонх) нэг удаагийн сануулах имэйл.
 * `reminder7dSentAt` тэмдэглэгдсэн давтагдахгүй.
 */
export async function sendCourseAccessExpiringReminders(): Promise<number> {
  const now = Date.now();
  const lower = new Date(now + 6 * MS_PER_DAY);
  const upper = new Date(now + 7 * MS_PER_DAY);

  const users = await User.find({
    courseAccess: {
      $elemMatch: {
        expiresAt: { $gte: lower, $lte: upper },
        reminder7dSentAt: { $exists: false },
      },
    },
  }).select("courseAccess email name");

  let sent = 0;
  for (const u of users) {
    const candidates = u.courseAccess.filter(
      (a) =>
        a.expiresAt >= lower &&
        a.expiresAt <= upper &&
        !a.reminder7dSentAt,
    );
    if (candidates.length === 0) continue;

    const courseIds = [
      ...new Set(candidates.map((c) => String(c.courseId))),
    ];
    const courses = await Course.find({ _id: { $in: courseIds } })
      .select("name")
      .lean();
    const nameById = new Map(courses.map((c) => [String(c._id), c.name]));

    const lines = candidates.map((c) => {
      const nm = nameById.get(String(c.courseId)) ?? "Курс";
      const d = c.expiresAt.toLocaleDateString("mn-MN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return `${nm} — дуусах: ${d}`;
    });

    try {
      await sendCourseAccessExpiringReminderEmail(
        u.email,
        u.name,
        lines,
      );
      const mark = new Date();
      for (const c of candidates) {
        const idx = u.courseAccess.findIndex(
          (x) =>
            x.courseId.equals(c.courseId) &&
            x.expiresAt.getTime() === c.expiresAt.getTime(),
        );
        if (idx >= 0) {
          const row = u.courseAccess[idx] as ICourseAccess;
          row.reminder7dSentAt = mark;
        }
      }
      await u.save();
      sent++;
    } catch (err) {
      console.error("[sendCourseAccessExpiringReminders]", u._id, err);
    }
  }
  if (sent > 0) {
    console.log(
      `[sendCourseAccessExpiringReminders] sent ${sent} reminder email(s)`,
    );
  }
  return sent;
}
