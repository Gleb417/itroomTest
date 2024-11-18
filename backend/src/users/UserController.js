import User from './UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';
const REFRESH_SECRET_KEY =
  process.env.REFRESH_SECRET_KEY || 'refresh_secret_key';

const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Включаем отладку
  logger: true, // Логи работы SMTP
});

// Генерация access и refresh токенов
const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, username: user.username, email: user.email },
    SECRET_KEY,
    { expiresIn: '1h' } // Время жизни access-токена
  );

  const refreshToken = jwt.sign(
    { userId: user.id, username: user.username },
    REFRESH_SECRET_KEY,
    { expiresIn: '1d' } // Время жизни refresh-токена
  );

  // Сохранение refresh-токена в базе
  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

// Функция регистрации пользователя с отправкой ссылки подтверждения
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({
      message: 'Пожалуйста, укажите имя пользователя, почту и пароль.',
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Хешируем пароль
    const verificationToken = jwt.sign({ email }, SECRET_KEY, {
      expiresIn: '1h', // Ссылка действует 1 час
    });

    // Создаем нового пользователя
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationCode: verificationToken, // Храним токен подтверждения
    });

    // URL подтверждения
    const confirmUrl = `http://localhost:3001/api/users/confirm-email?token=${verificationToken}`;

    // Отправка письма с ссылкой подтверждения
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Подтверждение регистрации',
      text: `Перейдите по ссылке для подтверждения регистрации: ${confirmUrl}`,
      html: `<p>Перейдите по <a href="${confirmUrl}">ссылке</a> для подтверждения регистрации.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message:
        'Пользователь успешно зарегистрирован. Пожалуйста, подтвердите ваш email, перейдя по ссылке, отправленной на почту.',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка при создании пользователя.',
      error: error.message,
    });
  }
};

// Функция подтверждения email
export const confirmEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      message: 'Отсутствует токен подтверждения.',
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { email } = decoded;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден.' });
    }

    if (user.status === 'active') {
      return res.status(400).json({
        message: 'Этот email уже был подтвержден.',
      });
    }

    // Обновляем статус пользователя на "active"
    user.status = 'active';
    user.verificationCode = null; // Убираем токен подтверждения
    await user.save();

    res.json({
      message: 'Email успешно подтвержден. Ваш аккаунт активирован.',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка при подтверждении email.',
      error: error.message,
    });
  }
};

//отправка повторного письма после 5 минут
export const resendConfirmationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email обязателен.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден.' });
    }

    if (user.status === 'active') {
      return res.status(400).json({ message: 'Email уже подтвержден.' });
    }

    const verificationToken = jwt.sign({ email }, SECRET_KEY, {
      expiresIn: '5m', // Новый срок действия токена
    });

    user.verificationCode = verificationToken;
    await user.save();

    const confirmUrl = `http://localhost:3001/api/users/confirm-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Повторное подтверждение регистрации',
      html: `<p>Перейдите по <a href="${confirmUrl}">ссылке</a> для подтверждения регистрации.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: 'Письмо для подтверждения отправлено повторно.',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка при отправке письма подтверждения.',
      error: error.message,
    });
  }
};

// Функция входа пользователя
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Пожалуйста, укажите имя пользователя и пароль.' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный пароль.' });
    }

    // Генерация access и refresh токенов
    const { accessToken, refreshToken } = await generateTokens(user);

    res.json({
      message: 'Успешный вход.',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера.', error: error.message });
  }
};

// Функция для обновления токенов
export const refreshTokens = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Отсутствует refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const user = await User.findByPk(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Токен недействителен.' });
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user
    );

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка при обновлении токенов.',
      error: error.message,
    });
  }
};
// Функция получения профиля пользователя
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['username', 'email', 'status'],
    });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка при получении данных профиля.',
      error: error.message,
    });
  }
};
