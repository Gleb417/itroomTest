import express from 'express';
import multer from 'multer';
import { createPost } from './PostController.js';
import Post from './PostModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../users/UserModel.js';

const router = express.Router();

// Настройка multer для загрузки файлов с уникальными именами
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`); // Сохраняем файлы с уникальными именами
  },
});
const upload = multer({ storage });

// Маршрут для создания поста
router.post('/', authMiddleware, upload.single('filePath'), createPost);

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
