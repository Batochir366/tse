import { Router } from "express";
import {
  getAll,
  getOne,
  create,
  update,
  remove,
  addLesson,
  removeLesson,
  reorderLessons,
  addMerch,
  removeMerch,
} from "../controllers/courseController";
import { protect, optionalProtect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/adminMiddleware";

const router = Router();

router.get("/", getAll);
router.get("/:id", optionalProtect, getOne);

router.post("/", protect, isAdmin, create);
router.put("/:id", protect, isAdmin, update);
router.delete("/:id", protect, isAdmin, remove);
router.post("/:id/lessons", protect, isAdmin, addLesson);
router.delete("/:id/lessons/:lessonId", protect, isAdmin, removeLesson);
router.put("/:id/lessons/reorder", protect, isAdmin, reorderLessons);
router.post("/:id/merch", protect, isAdmin, addMerch);
router.delete("/:id/merch/:merchId", protect, isAdmin, removeMerch);

export default router;
