import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('student_personal_info', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: Sequelize.INTEGER, allowNull: false },
    phone_number: { type: Sequelize.STRING(50) },
    college_email: { type: Sequelize.STRING(100) },
    personal_email: { type: Sequelize.STRING(100) },
    father_name: { type: Sequelize.STRING(100) },
    father_phone: { type: Sequelize.STRING(50) },
    mother_name: { type: Sequelize.STRING(100) },
    mother_phone: { type: Sequelize.STRING(50) },
    address: { type: Sequelize.TEXT },
    gender: { type: Sequelize.STRING(10) },
    date_of_birth: { type: Sequelize.DATEONLY } 
  }, { tableName: 'students_personal_info' });
};

