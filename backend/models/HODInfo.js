import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('hod_info', {
    hod_id: { type: Sequelize.INTEGER, primaryKey: true },
    department: { type: Sequelize.STRING(50), allowNull: false },
    designation: { type: Sequelize.STRING(50), defaultValue: 'Head of Department' },
    office_room: { type: Sequelize.STRING(30) },
    contact_number: { type: Sequelize.STRING(15) }
  }, { tableName: 'hod_info' });
};

