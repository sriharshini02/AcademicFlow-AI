import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('hod_availability', {
    hod_id: { type: Sequelize.INTEGER, primaryKey: true },
    is_available: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    status_message: { type: Sequelize.STRING(255) },
    estimated_return_time: { type: Sequelize.DATE },
    last_updated: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
  }, { tableName: 'hod_availability' });
};

