import { Request, Response } from "express";
import User from "../models/User";
import {
  signAccess,
  signRefresh,
  verifyAccess,
  verifyRefresh,
} from "../utils/jwt";
import { generateOtp } from "../utils/otp";
import { sendOtpEmail } from "../utils/mailer";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ message: "И-мэйл бүртгэлтэй байна" });
    return;
  }

  const user = await User.create({ name, email, password, phone });

  const accessToken = signAccess({ id: String(user._id), role: "user" });
  const refreshToken = signRefresh({ id: String(user._id), role: "user" });

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email },
    accessToken,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ message: "И-мэйл эсвэл нууц үг буруу" });
    return;
  }
  if (!user.isActive) {
    res.status(403).json({ message: "Хаагдсан бүртгэл" });
    return;
  }

  const accessToken = signAccess({ id: String(user._id), role: "user" });
  const refreshToken = signRefresh({ id: String(user._id), role: "user" });

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  res.json({
    user: { id: user._id, name: user.name, email: user.email },
    accessToken,
  });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) {
    res.status(401).json({ message: "Token байхгүй" });
    return;
  }

  let payload: { id: string };
  try {
    payload = verifyRefresh(token) as { id: string };
  } catch {
    res.status(401).json({ message: "Token хүчингүй эсвэл дууссан" });
    return;
  }

  const user = await User.findById(payload.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) {
    res.status(401).json({ message: "Хүчингүй token" });
    return;
  }

  const accessToken = signAccess({ id: String(user._id), role: "user" });
  res.json({ accessToken });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (token) {
    await User.findOneAndUpdate(
      { refreshToken: token },
      { $unset: { refreshToken: "" } },
    );
  }
  res.clearCookie("refreshToken");
  res.json({ message: "Гарлаа" });
};

export const getMe = async (
  req: Request & { user?: { id: string } },
  res: Response,
): Promise<void> => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    return;
  }
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    courseAccess: user.courseAccess,
  });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.json({ message: "Хэрэв и-мэйл бүртгэлтэй бол код илгээгдлээ" });
    return;
  }

  const otp = generateOtp();
  user.resetOtp = otp;
  user.resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  await sendOtpEmail(email, otp);

  res.json({ message: "Код илгээгдлээ" });
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select(
    "+resetOtp +resetOtpExpires",
  );

  if (
    !user ||
    !user.resetOtp ||
    !user.resetOtpExpires ||
    user.resetOtp !== otp ||
    user.resetOtpExpires < new Date()
  ) {
    res.status(400).json({ message: "Код буруу эсвэл хугацаа дууссан" });
    return;
  }

  const resetToken = signAccess({ id: String(user._id), role: "reset" });

  user.resetOtp = undefined;
  user.resetOtpExpires = undefined;
  await user.save();

  res.json({ message: "Код баталгаажлаа", resetToken });
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { resetToken, newPassword } = req.body;

  let payload: { id: string; role: string };
  try {
    payload = verifyAccess(resetToken) as { id: string; role: string };
    if (payload.role !== "reset") throw new Error();
  } catch {
    res.status(400).json({ message: "Хүчингүй эсвэл дууссан token" });
    return;
  }

  const user = await User.findById(payload.id);
  if (!user) {
    res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    return;
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Нууц үг амжилттай солигдлоо" });
};
