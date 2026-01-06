import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('student_attendance', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: Sequelize.INTEGER, allowNull: false },
    semester: { type: Sequelize.INTEGER },
    month: { type: Sequelize.STRING(20) },
    attendance_percentage: { type: Sequelize.FLOAT }
  }, { tableName: 'students_attendance' });
};

