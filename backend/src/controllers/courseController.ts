import { Request, Response } from "express";
import mongoose from "mongoose";
import Course from "../models/Course";
import { AuthRequest } from "../middleware/authMiddleware";

const ADMIN_ROLES = ["superadmin", "editor", "support"];

function isAdminUser(req: AuthRequest): boolean {
  return !!(req.user && ADMIN_ROLES.includes(req.user.role));
}

// Public — идэвхтэй курсууд
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const courses = await Course.find({ isActive: true }).sort({ order: 1 });
  res.json(courses);
};

// Public — нэг курс (admin token бол бүх хичээл; эсвэл зөвхөн нийтлэгдсэн)
export const getOne = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404).json({ message: "Курс олдсонгүй" });
    return;
  }

  await course.populate({
    path: "lessons.lessonId",
  });

  await course.populate("includedMerch.merchId", "name imageUrl type price");

  const sorted = {
    ...course.toObject(),
    lessons: course.lessons
      .filter((l) => l.lessonId !== null)
      .sort((a, b) => a.order - b.order),
  };

  res.json(sorted);
};

// Admin — курс үүсгэх
export const create = async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    description,
    coverImage,
    lessons,
    price,
    durationDays,
    includedMerch,
    order,
  } = req.body;

  const course = await Course.create({
    name,
    description,
    coverImage,
    lessons: lessons ?? [],
    price,
    durationDays,
    includedMerch: includedMerch ?? [],
    order,
  });
  res.status(201).json(course);
};

// Admin — курс засах
export const update = async (req: Request, res: Response): Promise<void> => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );

  if (!course) {
    res.status(404).json({ message: "Курс олдсонгүй" });
    return;
  }
  res.json(course);
};

// Admin — курс устгах
export const remove = async (req: Request, res: Response): Promise<void> => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    res.status(404).json({ message: "Курс олдсонгүй" });
    return;
  }
  res.json({ message: "Курс устгагдлаа" });
};

// Admin — хичээл нэмэх
export const addLesson = async (req: Request, res: Response): Promise<void> => {
  const { lessonId, order } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404).json({ message: "Курс олдсонгүй" });
    return;
  }

  const exists = course.lessons.some((l) =>
    l.lessonId.equals(new mongoose.Types.ObjectId(String(lessonId))),
  );

  if (exists) {
    res.status(409).json({ message: "Хичээл аль хэдийн нэмэгдсэн байна" });
    return;
  }

  const maxOrder = course.lessons.reduce((m, l) => Math.max(m, l.order), 0);
  course.lessons.push({ lessonId, order: order ?? maxOrder + 1 });
  await course.save();

  res.json(course);
};

// Admin — хичээл хасах
export const removeLesson = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    {
      $pull: {
        lessons: {
          lessonId: new mongoose.Types.ObjectId(String(req.params.lessonId)),
        },
      },
    },
    { new: true },
  );

  if (!course) {
    res.status(404).json({ message: "Курс олдсонгүй" });
    return;
  }
  res.json(course);
};

// Admin — хичээлийн дараалал
export const reorderLessons = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404).json({ message: "Курс олдсонгүй" });
    return;
  }

  const updates: { lessonId: string; order: number }[] = req.body;

  course.lessons = course.lessons.map((l) => {
    const match = updates.find((u) =>
      l.lessonId.equals(new mongoose.Types.ObjectId(u.lessonId)),
    );
    return match ? { ...l, order: match.order } : l;
  });

  await course.save();
  res.json(course);
};

// Admin — merch нэмэх / тоо шинэчлэх
export const addMerch = async (req: Request, res: Response): Promise<void> => {
  const { merchId, quantity } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404).json({ message: "Курс олдсонгүй" });
    return;
  }

  const mid = new mongoose.Types.ObjectId(String(merchId));
  const idx = course.includedMerch.findIndex((m) => m.merchId.equals(mid));
  const qty = quantity ?? 1;

  if (idx >= 0) {
    course.includedMerch[idx].quantity = qty;
  } else {
    course.includedMerch.push({ merchId: mid, quantity: qty });
  }

  await course.save();
  res.json(course);
};

// Admin — merch хасах
export const removeMerch = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    {
      $pull: {
        includedMerch: {
          merchId: new mongoose.Types.ObjectId(String(req.params.merchId)),
        },
      },
    },
    { new: true },
  );

  if (!course) {
    res.status(404).json({ message: "Курс олдсонгүй" });
    return;
  }
  res.json(course);
};
