import { Router } from 'express';
import { getActive, getAll, create, update, remove } from '../controllers/announcementController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/adminMiddleware';

const router = Router();

router.get('/',     getActive);
router.get('/all',  protect, isAdmin, getAll);

router.post('/',      protect, isAdmin, create);
router.put('/:id',    protect, isAdmin, update);
router.delete('/:id', protect, isAdmin, remove);

export default router;
