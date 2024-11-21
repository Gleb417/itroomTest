import express from 'express';
import multer from 'multer';
import { createPost, deletePost } from './PostController.js';
import Post from './PostModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../users/UserModel.js';
import { updatePost } from './PostController.js';
import { storage, fileFilter } from '../utils/uploadUtils.js'; // Импортируем настройки

const router = express.Router();

// Создаем объект upload, используя настройки из utils
const upload = multer({
  storage,
  fileFilter, // Добавили фильтр файлов
});

// Маршрут для создания поста
router.post(
  '/',
  authMiddleware,
  upload.single('filePath'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        message: 'Файл обязателен и должен быть формата .jpg, .png или .jpeg',
      });
    }
    next();
  },
  createPost
);

// Маршрут для обновления поста
router.put(
  '/:id',
  authMiddleware,
  upload.single('filePath'),
  (req, res, next) => {
    if (
      req.file &&
      !['image/jpeg', 'image/png', 'image/jpg'].includes(req.file.mimetype)
    ) {
      return res
        .status(400)
        .json({ message: 'Файл должен быть формата .jpg, .png или .jpeg' });
    }
    next();
  },
  updatePost
);

// Маршрут для получения всех постов
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
        },
      ],
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении постов.' });
  }
});

// Маршрут для получения одного поста по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
        },
      ],
    });
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Пост не найден' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении поста.' });
  }
});

// Маршрут для получения постов текущего авторизованного пользователя
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // ID текущего пользователя из токена

    // Получение постов пользователя
    const userPosts = await Post.findAll({
      where: { userId }, // Фильтрация по userId
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'], // Включение имени пользователя
        },
      ],
    });

    if (userPosts.length === 0) {
      return res.status(404).json({ message: 'У вас еще нет постов.' });
    }

    res.json(userPosts); // Возврат списка постов
  } catch (error) {
    console.error('Ошибка при получении постов пользователя:', error);
    res
      .status(500)
      .json({ error: 'Ошибка при получении постов пользователя.' });
  }
});
// Маршрут для удаления поста
router.delete('/:id', authMiddleware, deletePost);

export default router;
