import Post from './PostModel.js';

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
