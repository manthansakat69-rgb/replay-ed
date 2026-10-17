import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSetup() {
  console.log('--- ReplayEd MySQL Database Auto-Setup ---');
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  try {
    console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });

    console.log('Connected! Creating database "replayed_db"...');
    await connection.query('CREATE DATABASE IF NOT EXISTS replayed_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await connection.query('USE replayed_db;');

    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log(`Applying schema from ${schemaPath}...`);
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('Schema, tables, and initial seed data created successfully!');
    } else {
      console.warn('schema.sql not found at expected path.');
    }

    await connection.end();
    console.log('Setup finished. You can now start the backend with: npm start');
  } catch (err) {
    console.error('Database setup failed:', err.message);
    console.error('Tip: Check your MySQL password in server/.env and re-run "node setupDb.js"');
  }
}

runSetup();
