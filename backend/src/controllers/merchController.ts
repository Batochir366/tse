import { Request, Response } from 'express';
import Merch from '../models/Merch';

// Public — идэвхтэй мерч
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const merches = await Merch.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(merches);
};

// Public — нэг мерч
export const getOne = async (req: Request, res: Response): Promise<void> => {
  const merch = await Merch.findById(req.params.id);

  if (!merch) {
    res.status(404).json({ message: 'Мерч олдсонгүй' });
    return;
  }
  res.json(merch);
};

// Admin — мерч үүсгэх
export const create = async (req: Request, res: Response): Promise<void> => {
  const { name, description, type, imageUrl, price, stock } = req.body;
  const merch = await Merch.create({ name, description, type, imageUrl, price, stock });
  res.status(201).json(merch);
};

// Admin — мерч засах
export const update = async (req: Request, res: Response): Promise<void> => {
  const merch = await Merch.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { returnDocument: 'after', runValidators: true }
  );

  if (!merch) {
    res.status(404).json({ message: 'Мерч олдсонгүй' });
    return;
  }
  res.json(merch);
};

// Admin — мерч устгах
export const remove = async (req: Request, res: Response): Promise<void> => {
  const merch = await Merch.findByIdAndDelete(req.params.id);

  if (!merch) {
    res.status(404).json({ message: 'Мерч олдсонгүй' });
    return;
  }
  res.json({ message: 'Мерч устгагдлаа' });
};

// Admin — нөөц шинэчлэх
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  const { stock } = req.body;
  const merch = await Merch.findByIdAndUpdate(
    req.params.id,
    { $set: { stock } },
    { returnDocument: 'after' }
  );

  if (!merch) {
    res.status(404).json({ message: 'Мерч олдсонгүй' });
    return;
  }
  res.json({ stock: merch.stock });
};
