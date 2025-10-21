import { Sequelize } from 'sequelize';
import dbConfig from '../config/db.config.js';

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: false
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ------------------------------------------------------
// 1️⃣ EXISTING MODELS
// ------------------------------------------------------

// User Model
db.User = sequelize.define('user', {
  user_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
  password_hash: { type: Sequelize.STRING(255), allowNull: false },
  role: { type: Sequelize.STRING(10), allowNull: false, validate: { isIn: [['HOD', 'Proctor']] } },
  name: { type: Sequelize.STRING(100), allowNull: false },
  created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
}, { tableName: 'users' });

// Students Core Model
db.StudentCore = sequelize.define('student_core', {
  student_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  roll_number: { type: Sequelize.STRING(20), allowNull: false, unique: true },
  full_name: { type: Sequelize.STRING(150), allowNull: false },
  year_group: { type: Sequelize.STRING(10) },
  department: { type: Sequelize.STRING(50) },
  assigned_proctor_id: { type: Sequelize.INTEGER },
  admission_type: { type: Sequelize.ENUM('NORMAL', 'LATERAL') }
}, { tableName: 'students_core' });

// HOD Availability Model
db.HODAvailability = sequelize.define('hod_availability', {
  hod_id: { type: Sequelize.INTEGER, primaryKey: true },
  is_available: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  status_message: { type: Sequelize.STRING(255) },
  estimated_return_time: { type: Sequelize.DATE },
  last_updated: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
}, { tableName: 'hod_availability' });

// Visit Logs History Model
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
  scheduled_time: { type: Sequelize.DATE },
  action_taken: {
    type: Sequelize.ENUM('Pending','Scheduled','Cancelled','Completed'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  alert_sent: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'visit_logs_history' });

// To-Do Tasks Model
db.ToDoTask = sequelize.define('todo_task', {
  task_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: Sequelize.INTEGER, allowNull: false },
  title: { type: Sequelize.STRING(255), allowNull: false },
  priority: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'medium' },
  is_completed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  due_date: { type: Sequelize.DATEONLY }
}, { tableName: 'todo_tasks' });

// ------------------------------------------------------
// 2️⃣ NEW MODELS FOR STUDENTS PAGE
// ------------------------------------------------------

// Personal Info
db.StudentPersonalInfo = sequelize.define('student_personal_info', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: Sequelize.INTEGER, allowNull: false },
  phone_number: { type: Sequelize.STRING(15) },
  college_email: { type: Sequelize.STRING(100) },
  personal_email: { type: Sequelize.STRING(100) },
  father_name: { type: Sequelize.STRING(100) },
  father_phone: { type: Sequelize.STRING(15) },
  mother_name: { type: Sequelize.STRING(100) },
  mother_phone: { type: Sequelize.STRING(15) }
}, { tableName: 'students_personal_info' });

// Academic Scores
db.StudentAcademicScore = sequelize.define('student_academic_scores', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: Sequelize.INTEGER, allowNull: false },
  academic_year: { type: Sequelize.STRING(10) },
  semester: { type: Sequelize.INTEGER },
  subject_name: { type: Sequelize.STRING(100) },
  internal_marks: { type: Sequelize.FLOAT },
  external_marks: { type: Sequelize.FLOAT },
  total_marks: { type: Sequelize.FLOAT }
}, { tableName: 'students_academic_scores' });

// Midterm Scores
db.StudentMidtermScore = sequelize.define('student_midterm_scores', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: Sequelize.INTEGER, allowNull: false },
  semester: { type: Sequelize.INTEGER },
  subject_name: { type: Sequelize.STRING(100) },
  midterm_number: { type: Sequelize.INTEGER, validate: { min: 1, max: 2 } },
  marks: { type: Sequelize.FLOAT }
}, { tableName: 'students_midterm_scores' });

// Lab Exams
db.StudentLabExam = sequelize.define('student_lab_exams', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: Sequelize.INTEGER, allowNull: false },
  semester: { type: Sequelize.INTEGER },
  lab_name: { type: Sequelize.STRING(100) },
  internal_marks: { type: Sequelize.FLOAT },
  external_marks: { type: Sequelize.FLOAT }
}, { tableName: 'students_lab_exams' });

// Attendance
db.StudentAttendance = sequelize.define('student_attendance', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: Sequelize.INTEGER, allowNull: false },
  semester: { type: Sequelize.INTEGER },
  month: { type: Sequelize.STRING(20) },
  attendance_percentage: { type: Sequelize.FLOAT }
}, { tableName: 'students_attendance' });

// Extracurriculars
db.StudentExtracurricular = sequelize.define('student_extracurriculars', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: Sequelize.INTEGER, allowNull: false },
  activity_name: { type: Sequelize.STRING(100) },
  description: { type: Sequelize.TEXT },
  achievement_level: { type: Sequelize.STRING(50) },
  date: { type: Sequelize.DATE }
}, { tableName: 'students_extracurriculars' });

// HOD Info Model (Department Mapping)
db.HODInfo = sequelize.define('hod_info', {
  hod_id: { type: Sequelize.INTEGER, primaryKey: true },
  department: { type: Sequelize.STRING(50), allowNull: false },
  designation: { type: Sequelize.STRING(50), defaultValue: 'Head of Department' },
  office_room: { type: Sequelize.STRING(30) },
  contact_number: { type: Sequelize.STRING(15) }
}, { tableName: 'hod_info' });


// ------------------------------------------------------
// 3️⃣ RELATIONSHIPS
// ------------------------------------------------------

// User ↔ StudentCore
db.User.hasMany(db.StudentCore, { foreignKey: 'assigned_proctor_id' });
db.StudentCore.belongsTo(db.User, { foreignKey: 'assigned_proctor_id', as: 'proctor' });

// HOD Availability
db.User.hasOne(db.HODAvailability, { foreignKey: 'hod_id' });
db.HODAvailability.belongsTo(db.User, { foreignKey: 'hod_id', as: 'hod' });

// Student ↔ Visit Logs
db.StudentCore.hasMany(db.VisitLog, { foreignKey: 'related_student_id' });
db.VisitLog.belongsTo(db.StudentCore, { foreignKey: 'related_student_id', as: 'student' });

// Tasks ↔ User
db.User.hasMany(db.ToDoTask, { foreignKey: 'user_id' });
db.ToDoTask.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// New relationships for extended student data
db.StudentCore.hasOne(db.StudentPersonalInfo, { foreignKey: 'student_id' });
db.StudentPersonalInfo.belongsTo(db.StudentCore, { foreignKey: 'student_id' });

db.StudentCore.hasMany(db.StudentAcademicScore, { foreignKey: 'student_id' });
db.StudentAcademicScore.belongsTo(db.StudentCore, { foreignKey: 'student_id' });

db.StudentCore.hasMany(db.StudentMidtermScore, { foreignKey: 'student_id' });
db.StudentMidtermScore.belongsTo(db.StudentCore, { foreignKey: 'student_id' });

db.StudentCore.hasMany(db.StudentLabExam, { foreignKey: 'student_id' });
db.StudentLabExam.belongsTo(db.StudentCore, { foreignKey: 'student_id' });

db.StudentCore.hasMany(db.StudentAttendance, { foreignKey: 'student_id' });
db.StudentAttendance.belongsTo(db.StudentCore, { foreignKey: 'student_id' });

db.StudentCore.hasMany(db.StudentExtracurricular, { foreignKey: 'student_id' });
db.StudentExtracurricular.belongsTo(db.StudentCore, { foreignKey: 'student_id' });


// Relationship: One HOD (User) has one HODInfo
db.User.hasOne(db.HODInfo, { foreignKey: 'hod_id' });
db.HODInfo.belongsTo(db.User, { foreignKey: 'hod_id', as: 'hod' });


export default db;
