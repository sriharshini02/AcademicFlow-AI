import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('student_core', {
    student_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    roll_number: { type: Sequelize.STRING(20), allowNull: false, unique: true },
    full_name: { type: Sequelize.STRING(150), allowNull: false },
    year_group: { type: Sequelize.STRING(10) },
    department: { type: Sequelize.STRING(50) },
    assigned_proctor_id: { type: Sequelize.INTEGER },
    admission_type: { type: Sequelize.ENUM('NORMAL', 'LATERAL') },
    section: { type: Sequelize.STRING(5) },
    joining_year: { type: Sequelize.STRING(10) },
    completion_year: { type: Sequelize.STRING(10) }
  }, { tableName: 'students_core' });
};

