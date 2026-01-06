import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('user', {
    user_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
    password_hash: { type: Sequelize.STRING(255), allowNull: false },
    role: { type: Sequelize.STRING(10), allowNull: false, validate: { isIn: [['HOD', 'Proctor']] } },
    name: { type: Sequelize.STRING(100), allowNull: false },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
  }, { tableName: 'users' });
};

