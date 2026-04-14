import { Request, Response } from 'express';
import Announcement from '../models/Announcement';

// Public — идэвхтэй, хугацаа дуусаагүй зарлалууд
export const getActive = async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const announcements = await Announcement.find({
    isActive: true,
    $or: [
      { expiresAt: { $gt: now } },
      { expiresAt: { $exists: false } },
    ],
  }).sort({ createdAt: -1 });

  res.json(announcements);
};

// Admin — бүх зарлал
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  res.json(announcements);
};

// Admin — зарлал үүсгэх
export const create = async (req: Request, res: Response): Promise<void> => {
  const { title, description, imageUrl, type, link, expiresAt } = req.body;
  const announcement = await Announcement.create({
    title,
    description,
    imageUrl,
    type,
    link,
    expiresAt,
  });
  res.status(201).json(announcement);
};

// Admin — зарлал засах
export const update = async (req: Request, res: Response): Promise<void> => {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!announcement) {
    res.status(404).json({ message: 'Зарлал олдсонгүй' });
    return;
  }
  res.json(announcement);
};

// Admin — зарлал устгах
export const remove = async (req: Request, res: Response): Promise<void> => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);

  if (!announcement) {
    res.status(404).json({ message: 'Зарлал олдсонгүй' });
    return;
  }
  res.json({ message: 'Зарлал устгагдлаа' });
};
