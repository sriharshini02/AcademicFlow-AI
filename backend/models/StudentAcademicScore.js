import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('student_academic_scores', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: Sequelize.INTEGER, allowNull: false },
    academic_year: { type: Sequelize.STRING(10) },
    semester: { type: Sequelize.INTEGER },
    subject_name: { type: Sequelize.STRING(100) },
    internal_marks: { type: Sequelize.FLOAT },
    external_marks: { type: Sequelize.FLOAT },
    total_marks: { type: Sequelize.FLOAT }
  }, { tableName: 'students_academic_scores' });
};

