import { Sequelize } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('visit_log', {
    visit_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    check_in_time: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    visitor_name: { type: Sequelize.STRING(100), allowNull: false },
    visitor_role: { type: Sequelize.STRING(20), allowNull: false },
    related_student_id: { type: Sequelize.INTEGER },
    purpose: { type: Sequelize.TEXT, allowNull: false },
    status: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'Queued' },
    end_time: { type: Sequelize.DATE },
    hod_notes: { type: Sequelize.TEXT },
    reason_not_met: { type: Sequelize.TEXT },
    scheduled_time: { type: Sequelize.DATE },
    action_taken: {
      type: Sequelize.ENUM('Pending','Scheduled','Cancelled','Completed'),
      allowNull: false,
      defaultValue: 'Pending'
    },
    alert_sent: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }
  }, { tableName: 'visit_logs_history' });
};

