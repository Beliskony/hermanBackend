import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 5,        // ⬇ réduit pour LWS (ressources limitées)
  queueLimit: 0,
  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: undefined,
});

// ✅ Test non-bloquant — ne crashe jamais le process
export async function testDbConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connecté avec succès');
    connection.release();
    return true;
  } catch (error: any) {
    // ⚠️ Log détaillé pour debug LWS
    console.error('❌ Erreur MySQL:', {
      message: error.message,
      code: error.code,        // ex: ECONNREFUSED, ER_ACCESS_DENIED
      errno: error.errno,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });
    return false;
  }
}