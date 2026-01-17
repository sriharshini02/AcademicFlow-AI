import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } from './env.config';
// Configuration object using environment variables
const dbConfig = {
  HOST: DB_HOST || "localhost", 
  USER: DB_USER || "harshini", 
  PASSWORD: DB_PASSWORD || "harshini",
  DB: DB_NAME || "academic_db",
  dialect: "mysql",
  pool: {
    max: 5,    
    min: 0,    
    acquire: 30000, 
    idle: 10000     
  }
};

export default dbConfig;