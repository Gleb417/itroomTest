import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// Middleware для проверки access токена
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Получаем токен из заголовка

  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Сохраняем информацию о пользователе в объекте запроса
    next(); // Переходим к следующему middleware
  } catch (error) {
    res.status(403).json({ message: 'Неверный или истекший токен' });
  }
};
