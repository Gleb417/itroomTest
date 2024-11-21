import Activity from './activityModel.js';
import User from '../users/UserModel.js';

// Создание лайка или комментария
export const createActivity = async (req, res) => {
  const { type, content, postId, parentId } = req.body;
  const userId = req.user.userId;

  // Проверка типа активности
  if (!['like', 'comment', 'reply', 'like_comment'].includes(type)) {
    return res.status(400).json({ message: 'Неверный тип активности' });
  }

  try {
    if (type === 'like') {
      const existingLike = await Activity.findOne({
        where: { type: 'like', userId, postId },
      });

      if (existingLike) {
        // Удалить лайк, если он уже существует
        await existingLike.destroy();
        return res.status(200).json({ message: 'Лайк удален' });
      }

      // Создать новый лайк
      const like = await Activity.create({ type, userId, postId });
      return res.status(201).json(like);
    }

    if (type === 'comment' || type === 'reply') {
      if (!content) {
        return res
          .status(400)
          .json({ message: 'Контент обязателен для комментариев' });
      }

      // Создаём новый комментарий или ответ
      const activity = await Activity.create({
        type,
        content,
        userId,
        postId,
        parentId,
      });

      return res.status(201).json(activity);
    }

    res.status(400).json({ message: 'Неверный тип активности' });
  } catch (error) {
    console.error('Ошибка при создании активности:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
// Получение активностей для поста
export const getActivitiesByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const activities = await Activity.findAll({
      where: { postId },
      include: [
        { model: Activity, as: 'replies' }, // Включаем ответы на комментарии
        { model: User, as: 'user', attributes: ['username'] }, // Информация о пользователе
      ],
    });
    res.json(activities);
  } catch (error) {
    console.error('Ошибка при получении активностей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
