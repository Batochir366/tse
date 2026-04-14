import mongoose from "mongoose";
import Course from "../models/Course";
import User from "../models/User";

export async function checkLessonAccess(
  userId: string,
  lessonId: string,
): Promise<boolean> {
  const lessonObjId = new mongoose.Types.ObjectId(lessonId);

  const courses = await Course.find({
    "lessons.lessonId": lessonObjId,
    isActive: true,
  }).select("_id");

  if (courses.length === 0) return false;

  const user = await User.findById(userId).select("courseAccess");
  if (!user) return false;

  const now = new Date();
  const courseIds = courses.map((c) => c._id as mongoose.Types.ObjectId);

  return user.courseAccess.some(
    (a) =>
      courseIds.some((id) => id.equals(a.courseId)) && a.expiresAt > now,
  );
}
