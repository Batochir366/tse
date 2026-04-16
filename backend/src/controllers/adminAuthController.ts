import { Request, Response } from 'express';
import Admin from '../models/Admin';
import User from '../models/User';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin || !(await admin.comparePassword(password))) {
    res.status(401).json({ message: 'И-мэйл эсвэл нууц үг буруу' });
    return;
  }

  if (!admin.isActive) {
    res.status(403).json({ message: 'Хаагдсан бүртгэл' });
    return;
  }

  const accessToken  = signAccess({ id: String(admin._id), role: admin.role });
  const refreshToken = signRefresh({ id: String(admin._id), role: admin.role });

  admin.refreshToken = refreshToken;
  await admin.save();

  res.cookie('adminRefreshToken', refreshToken, COOKIE_OPTIONS);

  res.json({
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    accessToken,
  });
};

export const adminRefresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.adminRefreshToken as string | undefined;
  if (!token) {
    res.status(401).json({ message: 'Token байхгүй' });
    return;
  }

  let payload: { id: string };
  try {
    payload = verifyRefresh(token) as { id: string };
  } catch {
    res.status(401).json({ message: 'Token хүчингүй эсвэл дууссан' });
    return;
  }

  const admin = await Admin.findById(payload.id).select('+refreshToken +role');
  if (!admin || admin.refreshToken !== token) {
    res.status(401).json({ message: 'Хүчингүй token' });
    return;
  }

  const accessToken = signAccess({ id: String(admin._id), role: admin.role });
  res.json({ accessToken });
};

export const adminLogout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.adminRefreshToken as string | undefined;
  if (token) {
    await Admin.findOneAndUpdate(
      { refreshToken: token },
      { $unset: { refreshToken: '' } }
    );
  }
  res.clearCookie('adminRefreshToken');
  res.json({ message: 'Гарлаа' });
};

export const getAdminMe = async (
  req: Request & { user?: { id: string } },
  res: Response
): Promise<void> => {
  const admin = await Admin.findById(req.user?.id);
  if (!admin) {
    res.status(404).json({ message: 'Admin олдсонгүй' });
    return;
  }
  res.json({ id: admin._id, name: admin.name, email: admin.email, role: admin.role });
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  const users = await User.find()
    .select('name email phone isActive createdAt')
    .sort({ createdAt: -1 })
    .lean();
  res.json(users);
};
