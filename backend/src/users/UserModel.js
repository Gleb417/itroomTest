import { DataTypes, Model } from 'sequelize';
import dbPosts from '../config/db.js';

class User extends Model {}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true, // Валидация для проверки формата email
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'inactive',
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true, // Может быть пустым, если пользователь не вошел в систему
    },
    verificationCode: {
      type: DataTypes.TEXT,
      allowNull: true, // Храним токен подтверждения
    },
  },
  {
    sequelize: dbPosts,
    modelName: 'User',
    tableName: 'Users',
    timestamps: false,
    indexes: [
      { fields: ['username'], unique: true },
      { fields: ['email'], unique: true }, // Индекс для email
    ],
  }
);

export default User;
