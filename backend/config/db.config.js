import dotenv from 'dotenv';

// Load environment variables from .env file (if it exists)
// This won't throw an error if .env doesn't exist
try {
  dotenv.config();
} catch (error) {
  console.warn('⚠️  Warning: Could not load .env file. Using defaults or system environment variables.');
}

/**
 * Database Configuration
 * Uses environment variables with sensible fallback defaults
 * Provides helpful warnings if critical values are missing
 */
const dbConfig = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "harshini",
  PASSWORD: process.env.DB_PASSWORD || "harshini",
  DB: process.env.DB_NAME || "academic_db",
  dialect: process.env.DB_DIALECT || "mysql",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  pool: {
    max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 5,
    min: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN) : 0,
    acquire: process.env.DB_POOL_ACQUIRE ? parseInt(process.env.DB_POOL_ACQUIRE) : 30000,
    idle: process.env.DB_POOL_IDLE ? parseInt(process.env.DB_POOL_IDLE) : 10000
  }
};

// Log configuration in development mode (without sensitive data)
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Database Configuration:');
  console.log(`   Host: ${dbConfig.HOST}`);
  console.log(`   Database: ${dbConfig.DB}`);
  console.log(`   User: ${dbConfig.USER}`);
  console.log(`   Dialect: ${dbConfig.dialect}`);
  console.log(`   Port: ${dbConfig.port}`);
}

export default dbConfig;
