import dotenv from 'dotenv';

dotenv.config();

export const TYPE = process.env.TYPE as 'postgres';
export const HOST = process.env.HOST as string;
export const USERNAME = process.env.USERNAME as string;
export const PASSWORD = process.env.PASSWORD as string;
export const PORT = parseInt(process.env.PORT || '5432', 10);
export const DATABASE = process.env.NAME as string;