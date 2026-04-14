import { Request, Response, NextFunction } from 'express';
import { encrypt } from '../utils/crypto';

export function encryptResponse(_req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);

  res.json = function (body: unknown) {
    if (process.env.NODE_ENV === 'development' && process.env.ENCRYPT_DISABLE === 'true') {
      return originalJson(body);
    }
    const encrypted = encrypt(body as object);
    return originalJson({ data: encrypted });
  };

  next();
}
