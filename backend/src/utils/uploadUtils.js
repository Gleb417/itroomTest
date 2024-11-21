import multer from 'multer';

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
      new Error('Неверный формат файла. Допустимы только .jpg, .png или .jpeg'),
      false
    );
  }
};

export { storage, fileFilter };
