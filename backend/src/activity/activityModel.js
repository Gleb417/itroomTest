import { DataTypes, Model } from 'sequelize';
import dbPosts from '../config/db.js';
import User from '../users/UserModel.js';
import Post from '../posts/PostModel.js';

class Activity extends Model {}

Activity.init(
  {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['like', 'comment', 'reply', 'like_comment']],
      },
    },
    content: {
      type: DataTypes.TEXT, // Текст комментария или ответа, если требуется
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: 'id',
      },
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true, // ID родительской активности для ответов или лайков на комментарии
    },
  },
  {
    sequelize: dbPosts,
    modelName: 'Activity',
    tableName: 'Activities',
    timestamps: true, // Добавим timestamps для отслеживания времени
    indexes: [
      {
        fields: ['type', 'userId', 'postId'],
      },
    ],
  }
);

// Связи
User.hasMany(Activity, { foreignKey: 'userId' });
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Post.hasMany(Activity, { foreignKey: 'postId' });
Activity.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

Activity.hasMany(Activity, { foreignKey: 'parentId', as: 'replies' });
Activity.belongsTo(Activity, { foreignKey: 'parentId', as: 'parent' });

export default Activity;
