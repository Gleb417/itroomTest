import { Sequelize } from 'sequelize';

const dbPosts = new Sequelize('posts', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
});

export default dbPosts;
