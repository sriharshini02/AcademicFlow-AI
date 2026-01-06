import { Sequelize } from 'sequelize';
import dbConfig from '../config/db.config.js';

// Import all models
import UserModel from './User.js';
import StudentCoreModel from './StudentCore.js';
import HODAvailabilityModel from './HODAvailability.js';
import VisitLogModel from './VisitLog.js';
import ToDoTaskModel from './ToDoTask.js';
import StudentPersonalInfoModel from './StudentPersonalInfo.js';
import StudentAcademicScoreModel from './StudentAcademicScore.js';
import StudentMidtermScoreModel from './StudentMidtermScore.js';
import StudentLabExamModel from './StudentLabExam.js';
import StudentAttendanceModel from './StudentAttendance.js';
import StudentExtracurricularModel from './StudentExtracurricular.js';
import HODInfoModel from './HODInfo.js';
import { defineRelationships } from './relationships.js';

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Initialize models
db.User = UserModel(sequelize);
db.StudentCore = StudentCoreModel(sequelize);
db.HODAvailability = HODAvailabilityModel(sequelize);
db.VisitLog = VisitLogModel(sequelize);
db.ToDoTask = ToDoTaskModel(sequelize);
db.StudentPersonalInfo = StudentPersonalInfoModel(sequelize);
db.StudentAcademicScore = StudentAcademicScoreModel(sequelize);
db.StudentMidtermScore = StudentMidtermScoreModel(sequelize);
db.StudentLabExam = StudentLabExamModel(sequelize);
db.StudentAttendance = StudentAttendanceModel(sequelize);
db.StudentExtracurricular = StudentExtracurricularModel(sequelize);
db.HODInfo = HODInfoModel(sequelize);

// Define relationships
defineRelationships(db);

export default db;
