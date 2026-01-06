/**
 * Define all model relationships
 * This file centralizes all Sequelize associations
 */

export const defineRelationships = (db) => {
  // User ↔ StudentCore (Proctor relationship)
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

  // Student Core ↔ Student Personal Info
  db.StudentCore.hasOne(db.StudentPersonalInfo, { foreignKey: 'student_id' });
  db.StudentPersonalInfo.belongsTo(db.StudentCore, { foreignKey: 'student_id' });

  // Student Core ↔ Student Academic Scores
  db.StudentCore.hasMany(db.StudentAcademicScore, { foreignKey: 'student_id' });
  db.StudentAcademicScore.belongsTo(db.StudentCore, { foreignKey: 'student_id' });

  // Student Core ↔ Student Midterm Scores
  db.StudentCore.hasMany(db.StudentMidtermScore, { foreignKey: 'student_id' });
  db.StudentMidtermScore.belongsTo(db.StudentCore, { foreignKey: 'student_id' });

  // Student Core ↔ Student Lab Exams
  db.StudentCore.hasMany(db.StudentLabExam, { foreignKey: 'student_id' });
  db.StudentLabExam.belongsTo(db.StudentCore, { foreignKey: 'student_id' });

  // Student Core ↔ Student Attendance
  db.StudentCore.hasMany(db.StudentAttendance, { foreignKey: 'student_id' });
  db.StudentAttendance.belongsTo(db.StudentCore, { foreignKey: 'student_id' });

  // Student Core ↔ Student Extracurriculars
  db.StudentCore.hasMany(db.StudentExtracurricular, { foreignKey: 'student_id' });
  db.StudentExtracurricular.belongsTo(db.StudentCore, { foreignKey: 'student_id' });

  // User ↔ HOD Info
  db.User.hasOne(db.HODInfo, { foreignKey: 'hod_id' });
  db.HODInfo.belongsTo(db.User, { foreignKey: 'hod_id', as: 'hod' });
};

