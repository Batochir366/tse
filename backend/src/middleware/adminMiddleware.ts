import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

const ADMIN_ROLES = ['superadmin', 'editor', 'support'];

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
    res.status(403).json({ message: 'Admin эрх байхгүй' });
    return;
  }
  next();
}

export function isSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'superadmin') {
    res.status(403).json({ message: 'Superadmin эрх шаардлагатай' });
    return;
  }
  next();
}
