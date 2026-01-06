import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('todo_task', {
    task_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: Sequelize.INTEGER, allowNull: false },
    title: { type: Sequelize.STRING(255), allowNull: false },
    priority: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'medium' },
    is_completed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    due_date: { type: Sequelize.DATEONLY }
  }, { tableName: 'todo_tasks' });
};

