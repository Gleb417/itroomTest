import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dbPosts from './src/config/db.js';
import userRoutes from './src/users/UserRoutes.js';
import postRoutes from './src/posts/PostRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Инициализация __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Маршруты
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Синхронизация базы данных и запуск сервера
const PORT = process.env.PORT || 3001;
dbPosts.sync({ alter: true }).then(() => {
  // Используем `alter` для обновления схемы
  app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
});
