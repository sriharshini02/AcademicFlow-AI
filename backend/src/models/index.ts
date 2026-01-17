import { Sequelize, Dialect } from 'sequelize';
import { INTEGER, STRING, DATE, NOW, FLOAT, TEXT, ENUM, BOOLEAN } from 'sequelize';
import dbConfig from '../config/db.config';

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect as Dialect,
    pool: dbConfig.pool,
    logging: false
  }
);

const db: any = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ------------------------------------------------------
// 1️⃣ EXISTING MODELS
// ------------------------------------------------------

// User Model
db.User = (sequelize as any).define('user', {
  user_id: { type: INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: STRING(100), allowNull: false, unique: true },
  password_hash: { type: STRING(255), allowNull: false },
  role: { type: STRING(10), allowNull: false, validate: { isIn: [['HOD', 'Proctor']] } },
  name: { type: STRING(30), allowNull: false },
  created_at: { type: DATE, allowNull: false, defaultValue: NOW }
}, { tableName: 'users' });

// Students Core Model
db.StudentCore = (sequelize as any).define('student_core', {
  student_id: { type: INTEGER, primaryKey: true, autoIncrement: true },
  roll_number: { type: STRING(20), allowNull: false, unique: true },
  full_name: { type: STRING(150), allowNull: false },
  year_group: { type: STRING(10) },
  department: { type: STRING(50) },
  assigned_proctor_id: { type: INTEGER },
  admission_type: { type: ENUM('NORMAL', 'LATERAL') },
  section: { type: STRING(5) },
  // ✅ NEW FIELDS
  joining_year: { type: STRING(10) },
  completion_year: { type: STRING(10) }
}, { tableName: 'students_core' });

// HOD Availability Model
db.HODAvailability = (sequelize as any).define('hod_availability', {
  hod_id: { type: INTEGER, primaryKey: true },
  is_available: { type: BOOLEAN, allowNull: false, defaultValue: false },
  status_message: { type: STRING(255) },
  estimated_return_time: { type: DATE },
  last_updated: { type: DATE, allowNull: false, defaultValue: NOW }
}, { tableName: 'hod_availability' });

// Visit Logs History Model
db.VisitLog = (sequelize as any).define('visit_log', {
  visit_id: { type: INTEGER, primaryKey: true, autoIncrement: true },
  check_in_time: { type: DATE, allowNull: false, defaultValue: NOW },
  visitor_name: { type: STRING(100), allowNull: false },
  visitor_role: { type: STRING(20), allowNull: false },
  related_student_id: { type: INTEGER },
  purpose: { type: TEXT, allowNull: false },
  status: { type: STRING(30), allowNull: false, defaultValue: 'Queued' },
  end_time: { type: DATE },
  hod_notes: { type: TEXT },
  reason_not_met: { type: TEXT },
  scheduled_time: { type: DATE },
  action_taken: {
    type: ENUM('Pending','Scheduled','Cancelled','Completed'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  alert_sent: { type: BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'visit_logs_history' });

// To-Do Tasks Model
db.ToDoTask = (sequelize as any).define('todo_task', {
  task_id: { type: INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: INTEGER, allowNull: false },
  title: { type: STRING(255), allowNull: false },
  priority: { type: STRING(10), allowNull: false, defaultValue: 'medium' },
  is_completed: { type: BOOLEAN, allowNull: false, defaultValue: false },
  due_date: { type: DATE }
}, { tableName: 'todo_tasks' });

// ------------------------------------------------------
// 2️⃣ NEW MODELS FOR STUDENTS PAGE
// ------------------------------------------------------

// Personal Info Model
db.StudentPersonalInfo = (sequelize as any).define('student_personal_info', {
  id: { type: INTEGER, primaryKey: true, autoIncrement: true }, 
  student_id: { type: INTEGER, allowNull: false },
  phone_number: { type: STRING(50) },
  college_email: { type: STRING(100) },
  personal_email: { type: STRING(100) },
  father_name: { type: STRING(100) },
  father_phone: { type: STRING(50) },
  mother_name: { type: STRING(100) },
  mother_phone: { type: STRING(50) },
  address: { type: TEXT },
  gender: { type: STRING(10) },
  // ✅ NEW FIELD
  date_of_birth: { type: DATE } 
}, { tableName: 'students_personal_info' });

// Academic Scores
db.StudentAcademicScore = (sequelize as any).define('student_academic_scores', {
  id: { type: INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: INTEGER, allowNull: false },
  academic_year: { type: STRING(10) },
  semester: { type: INTEGER },
  subject_name: { type: STRING(100) },
  internal_marks: { type: FLOAT },
  external_marks: { type: FLOAT },
  total_marks: { type: FLOAT }
}, { tableName: 'students_academic_scores' });

// Midterm Scores
db.StudentMidtermScore = (sequelize as any).define('student_midterm_scores', {
  id: { type: INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: INTEGER, allowNull: false },
  semester: { type: INTEGER },
  subject_name: { type: STRING(100) },
  midterm_number: { type: INTEGER, validate: { min: 1, max: 2 } },
  marks: { type: FLOAT }
}, { tableName: 'students_midterm_scores' });

// Lab Exams
db.StudentLabExam = (sequelize as any).define('student_lab_exams', {
  id: { type: INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: INTEGER, allowNull: false },
  semester: { type: INTEGER },
  lab_name: { type: STRING(100) },
  internal_marks: { type: FLOAT },
  external_marks: { type: FLOAT }
}, { tableName: 'students_lab_exams' });

// Attendance
db.StudentAttendance = (sequelize as any).define('student_attendance', {
  id: { type: INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: INTEGER, allowNull: false },
  semester: { type: INTEGER },
  month: { type: STRING(20) },
  attendance_percentage: { type: FLOAT }
}, { tableName: 'students_attendance' });

// Extracurriculars
db.StudentExtracurricular = (sequelize as any).define('student_extracurriculars', {
  id: { type: INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: INTEGER, allowNull: false },
  activity_name: { type: STRING(100) },
  description: { type: TEXT },
  achievement_level: { type: STRING(50) },
  date: { type: DATE }
}, { tableName: 'students_extracurriculars' });

// HOD Info Model (Department Mapping)
db.HODInfo = (sequelize as any).define('hod_info', {
hod_id: { type: INTEGER, primaryKey: true },
  department: { type: STRING(50), allowNull: false },
  designation: { type: STRING(50), defaultValue: 'Head of Department' },
  office_room: { type: STRING(30) },
  contact_number: { type: STRING(15) }
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