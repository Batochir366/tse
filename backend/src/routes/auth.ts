import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
  patchMe,
  requestChangePasswordOtp,
  confirmChangePassword,
  uploadAvatar,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { withAvatarUpload } from "../middleware/uploadAvatar";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.patch("/me", protect, patchMe);
router.post("/change-password/request-otp", protect, requestChangePasswordOtp);
router.post("/change-password/confirm", protect, confirmChangePassword);
router.post("/avatar", protect, withAvatarUpload, uploadAvatar);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
