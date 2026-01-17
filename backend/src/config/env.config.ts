import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET as string; 
export const PORT = process.env.PORT as string;
export const DB_HOST = process.env.DB_HOST as string;
export const DB_USER = process.env.DB_USER as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const DB_NAME = process.env.DB_NAME as string;
export const DB_PORT = process.env.DB_PORT as string;
export const DB_DIALECT = process.env.DB_DIALECT as string;
export const DB_POOL_MAX = process.env.DB_POOL_MAX as string;
export const DB_POOL_MIN = process.env.DB_POOL_MIN as string;
export const DB_POOL_ACQUIRE = process.env.DB_POOL_ACQUIRE as string;
export const DB_POOL_IDLE = process.env.DB_POOL_IDLE as string;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN as string;