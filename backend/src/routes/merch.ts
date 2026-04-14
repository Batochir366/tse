import { Router } from 'express';
import { getAll, getOne, create, update, remove, updateStock } from '../controllers/merchController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/adminMiddleware';

const router = Router();

router.get('/',    getAll);
router.get('/:id', getOne);

router.post('/',              protect, isAdmin, create);
router.put('/:id',            protect, isAdmin, update);
router.patch('/:id/stock',    protect, isAdmin, updateStock);
router.delete('/:id',         protect, isAdmin, remove);

export default router;
