import { Request, Response } from "express";
import Lesson from "../models/Lesson";

// Admin — бүх хичээл
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const lessons = await Lesson.find().sort({ createdAt: -1 });
  res.json(lessons);
};

// Admin — нэг хичээл
export const getOne = async (req: Request, res: Response): Promise<void> => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    res.status(404).json({ message: "Хичээл олдсонгүй" });
    return;
  }
  res.json(lesson);
};

// Admin — хичээл үүсгэх
export const create = async (req: Request, res: Response): Promise<void> => {
  const { title, description, videoUrl, thumbnail } = req.body;
  const lesson = await Lesson.create({
    title,
    description,
    videoUrl,
    thumbnail,
  });
  res.status(201).json(lesson);
};

// Admin — хичээл засах
export const update = async (req: Request, res: Response): Promise<void> => {
  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { returnDocument: 'after', runValidators: true },
  );

  if (!lesson) {
    res.status(404).json({ message: "Хичээл олдсонгүй" });
    return;
  }
  res.json(lesson);
};

// Admin — нийтлэх / нуух
export const togglePublish = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    res.status(404).json({ message: "Хичээл олдсонгүй" });
    return;
  }

  lesson.isPublished = !lesson.isPublished;
  await lesson.save();
  res.json({ isPublished: lesson.isPublished });
};

// Admin — хичээл устгах
export const remove = async (req: Request, res: Response): Promise<void> => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);

  if (!lesson) {
    res.status(404).json({ message: "Хичээл олдсонгүй" });
    return;
  }
  res.json({ message: "Хичээл устгагдлаа" });
};
