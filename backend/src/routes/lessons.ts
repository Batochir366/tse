import { Router } from 'express';
import { getAll, getOne, create, update, togglePublish, remove } from '../controllers/lessonController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/adminMiddleware';

const router = Router();

// Бүх route admin-д л нэвтрэх боломжтой
router.use(protect, isAdmin);

router.get('/',               getAll);
router.get('/:id',            getOne);
router.post('/',              create);
router.put('/:id',            update);
router.patch('/:id/publish',  togglePublish);
router.delete('/:id',         remove);

export default router;
