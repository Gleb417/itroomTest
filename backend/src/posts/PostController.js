import Post from './PostModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createPost = async (req, res) => {
  const { label, text } = req.body;
  const userId = req.user.userId; // Получаем ID пользователя из токена
  if (!label || !text) {
    return res.status(400).json({ message: 'Label и text обязательны' });
  }

  try {
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    const newPost = await Post.create({ label, text, filePath, userId });
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error); // Логируем ошибку в консоль для диагностики
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Функция обновления поста

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { label, text } = req.body;
  const userId = req.user.userId;

  try {
    const oldPost = await Post.findByPk(id);
    if (!oldPost) {
      // Удаляем новый файл, если пост не найден
      if (req.file) {
        fs.unlinkSync(
          path.join(__dirname, '..', '..', 'uploads', req.file.filename)
        );
      }
      return res.status(404).json({ message: 'Пост не найден' });
    }

    if (oldPost.userId !== userId) {
      // Удаляем новый файл, если пользователь не имеет доступа
      if (req.file) {
        fs.unlinkSync(
          path.join(__dirname, '..', '..', 'uploads', req.file.filename)
        );
      }
      return res
        .status(403)
        .json({ message: 'Вы не можете редактировать этот пост' });
    }

    // Сохраняем ссылку на старый файл
    const oldFilePath = oldPost.filePath;

    // Обновляем поля
    oldPost.label = label || oldPost.label;
    oldPost.text = text || oldPost.text;
    if (req.file) {
      oldPost.filePath = `/uploads/${req.file.filename}`;
    }

    // Сохраняем изменения
    await oldPost.save();

    // Удаляем старый файл только после успешного сохранения
    if (req.file && oldFilePath) {
      const oldFileFullPath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        path.basename(oldFilePath)
      );
      if (fs.existsSync(oldFileFullPath)) {
        fs.unlinkSync(oldFileFullPath);
      }
    }

    res.json(oldPost);
  } catch (error) {
    // Удаляем новый файл, если произошла ошибка
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, '..', '..', 'uploads', req.file.filename)
      );
    }
    console.error('Ошибка при обновлении поста:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
// Функция удаления поста
export const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    if (post.userId !== userId) {
      return res
        .status(403)
        .json({ message: 'Вы не можете удалить этот пост' });
    }

    // Удаляем файл, если он существует
    if (post.filePath) {
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        path.basename(post.filePath)
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Удаляем пост из базы данных
    await post.destroy();
    res.json({ message: 'Пост успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении поста:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
