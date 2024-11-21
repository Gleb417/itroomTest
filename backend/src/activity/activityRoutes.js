import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createActivity, getActivitiesByPost } from './activityController.js';

const router = express.Router();

// Создание активности (лайк, комментарий, ответ)
router.post('/', authMiddleware, createActivity);

// Получение всех активностей для поста
router.get('/:postId', getActivitiesByPost);

export default router;
