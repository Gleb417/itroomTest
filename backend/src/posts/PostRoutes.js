import express from 'express';
import multer from 'multer';
import { createPost } from './PostController.js';
import Post from './PostModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../users/UserModel.js';
import { updatePost } from './PostController.js';

const router = express.Router();

// Настройка multer для загрузки файлов с уникальными именами
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`); // Сохраняем файлы с уникальными именами
  },
});

// Функция для фильтрации файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Файл допустим
  } else {
    cb(
      new Error('Неверный формат файла. Допустимы только .jpg, .png, .jpeg'),
      false
    );
  }
};

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
      return res
        .status(400)
        .json({
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

export default router;
