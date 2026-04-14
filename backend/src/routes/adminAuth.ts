import { Router } from 'express';
import { adminLogin, adminRefresh, adminLogout, getAdminMe } from '../controllers/adminAuthController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/adminMiddleware';

const router = Router();

router.post('/login',   adminLogin);
router.post('/refresh', adminRefresh);
router.post('/logout',  adminLogout);
router.get('/me',       protect, isAdmin, getAdminMe);

export default router;
