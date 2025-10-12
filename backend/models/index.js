import { Sequelize } from 'sequelize';
import dbConfig from '../config/db.config.js';

// Initialize Sequelize connection, now using the 'mysql' dialect from db.config.js
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect, // This must be set to 'mysql'
    pool: dbConfig.pool,
    logging: false // Set to true for debugging SQL queries
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// --- 1. Model Definitions (Core Schema for MySQL) ---

// User Model (Table 1: users)
db.User = sequelize.define('user', {
    user_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
    password_hash: { type: Sequelize.STRING(255), allowNull: false },
    role: { type: Sequelize.STRING(10), allowNull: false, validate: { isIn: [['HOD', 'Proctor']] } },
    name: { type: Sequelize.STRING(100), allowNull: false },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
}, { tableName: 'users' });

// Students Core Model (Table 2: students_core)
db.StudentCore = sequelize.define('student_core', {
    student_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    roll_number: { type: Sequelize.STRING(20), allowNull: false, unique: true },
    full_name: { type: Sequelize.STRING(150), allowNull: false },
    year_group: { type: Sequelize.STRING(10) },
    department: { type: Sequelize.STRING(50) },
    assigned_proctor_id: { type: Sequelize.INTEGER }
}, { tableName: 'students_core' });

// HOD Availability Model (Table 3: hod_availability)
// Note: Since this is a simple, one-row table (one HOD status), we define the primary key here.
db.HODAvailability = sequelize.define('hod_availability', {
    hod_id: { type: Sequelize.INTEGER, primaryKey: true }, 
    is_available: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    status_message: { type: Sequelize.STRING(255) },
    estimated_return_time: { type: Sequelize.DATE },
    last_updated: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
}, { tableName: 'hod_availability' });

// Visit Logs History Model (Table 4: visit_logs_history)
db.VisitLog = sequelize.define('visit_log', {
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
    scheduled_time: { type: Sequelize.DATE }, // HOD scheduled time
    action_taken: { 
        type: Sequelize.ENUM('Pending','Scheduled','Cancelled','Completed'), 
        allowNull: false, 
        defaultValue: 'Pending' 
    },
    alert_sent: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

    }, { tableName: 'visit_logs_history' });

// To Do Tasks Model (Table 5: todo_tasks)
db.ToDoTask = sequelize.define('todo_task', {
    task_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: Sequelize.INTEGER, allowNull: false }, 
    title: { type: Sequelize.STRING(255), allowNull: false },
    priority: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'medium' },
    is_completed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    due_date: { type: Sequelize.DATEONLY } 
}, { tableName: 'todo_tasks' });


// --- 2. Model Relationships (Foreign Keys) ---

// A Proctor (User) has many Students
db.User.hasMany(db.StudentCore, { foreignKey: 'assigned_proctor_id' });
db.StudentCore.belongsTo(db.User, { foreignKey: 'assigned_proctor_id', as: 'proctor' });

// A User is linked to HOD availability (only one HOD expected)
db.User.hasOne(db.HODAvailability, { foreignKey: 'hod_id' });
db.HODAvailability.belongsTo(db.User, { foreignKey: 'hod_id', as: 'hod' });

// A Visit Log belongs to a Student (if visitor is parent/student)
db.StudentCore.hasMany(db.VisitLog, { foreignKey: 'related_student_id' });
db.VisitLog.belongsTo(db.StudentCore, { foreignKey: 'related_student_id', as: 'student' });

// A Task belongs to a User (HOD or Proctor)
db.User.hasMany(db.ToDoTask, { foreignKey: 'user_id' });
db.ToDoTask.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });


export default db;
