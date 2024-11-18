import { DataTypes, Model } from 'sequelize';
import dbPosts from '../config/db.js';
import User from '../users/UserModel.js'; // Импортируем модель User

class Post extends Model {}

Post.init(
  {
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize: dbPosts,
    modelName: 'Post',
    tableName: 'Posts',
    timestamps: false,
  }
);

// Определяем связь "Post принадлежит User"
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Post;
