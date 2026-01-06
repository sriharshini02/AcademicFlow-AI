import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('student_midterm_scores', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: Sequelize.INTEGER, allowNull: false },
    semester: { type: Sequelize.INTEGER },
    subject_name: { type: Sequelize.STRING(100) },
    midterm_number: { type: Sequelize.INTEGER, validate: { min: 1, max: 2 } },
    marks: { type: Sequelize.FLOAT }
  }, { tableName: 'students_midterm_scores' });
};

