import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('student_extracurriculars', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: Sequelize.INTEGER, allowNull: false },
    activity_name: { type: Sequelize.STRING(100) },
    description: { type: Sequelize.TEXT },
    achievement_level: { type: Sequelize.STRING(50) },
    date: { type: Sequelize.DATE }
  }, { tableName: 'students_extracurriculars' });
};

