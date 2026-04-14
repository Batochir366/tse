import { Request, Response, NextFunction } from 'express';
import { verifyAccess, JwtPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function protect(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token байхгүй' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    req.user = verifyAccess(token);
    next();
  } catch {
    res.status(401).json({ message: 'Token хүчингүй эсвэл дууссан' });
  }
}

/** Bearer token байвал req.user тохируулна; алдаа гарвал ч дараагийн handler руу орно */
export function optionalProtect(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }
  const token = header.split(' ')[1];
  try {
    req.user = verifyAccess(token);
  } catch {
    // public хариу руу үргэлжлүүлнэ
  }
  next();
}
