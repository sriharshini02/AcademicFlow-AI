import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('student_lab_exams', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: Sequelize.INTEGER, allowNull: false },
    semester: { type: Sequelize.INTEGER },
    lab_name: { type: Sequelize.STRING(100) },
    internal_marks: { type: Sequelize.FLOAT },
    external_marks: { type: Sequelize.FLOAT }
  }, { tableName: 'students_lab_exams' });
};

