import dotenv from 'dotenv';
dotenv.config();

// Configuration object using environment variables
const dbConfig = {
  HOST: process.env.DB_HOST || "localhost", 
  USER: process.env.DB_USER || "harshini", 
  PASSWORD: process.env.DB_PASSWORD || "harshini",
  DB: process.env.DB_NAME || "academic_db",
  dialect: "mysql",
  pool: {
    max: 5,    
    min: 0,    
    acquire: 30000, 
    idle: 10000     
  }
};

export default dbConfig;