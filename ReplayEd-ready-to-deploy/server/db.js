import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;
let isConnected = false;

export async function getDbPool() {
  if (pool) return pool;

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'replayed_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    const connection = await pool.getConnection();
    isConnected = true;
    connection.release();
    console.log(`[MySQL] Successfully connected to database '${process.env.DB_NAME || 'replayed_db'}' on ${process.env.DB_HOST || 'localhost'}:3306`);
    return pool;
  } catch (error) {
    isConnected = false;
    console.warn(`[MySQL Notice] Could not connect with provided password: ${error.message}`);
    console.warn(`[MySQL Tip] Update your credentials in server/.env (DB_PASSWORD=...)`);
    return null;
  }
}

export function isDbConnected() {
  return isConnected;
}
