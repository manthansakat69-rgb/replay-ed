import mongoose from 'mongoose';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbMode = 'sqlite'; // 'mongo' | 'sqlite'
let sqliteDb = null;

export function getDbMode() {
  return dbMode;
}

export function getSqliteDb() {
  return sqliteDb;
}

/**
 * Connects to MongoDB if available, otherwise initializes SQLite database.
 */
export async function initDb() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      console.log(`[DB] Attempting MongoDB connection: ${mongoUri}...`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
      });
      dbMode = 'mongo';
      console.log('[DB] Connected successfully to MongoDB via Mongoose.');
      return { mode: 'mongo' };
    } catch (err) {
      console.warn(`[DB] MongoDB connection failed (${err.message}). Falling back to SQLite...`);
    }
  }

  // SQLite Fallback
  dbMode = 'sqlite';
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = process.env.SQLITE_PATH || path.join(dataDir, 'ps2_mastery.sqlite');
  console.log(`[DB] Initializing SQLite database at: ${dbPath}`);

  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[DB] SQLite connection error:', err);
        return reject(err);
      }
      createSqliteTables()
        .then(() => {
          console.log('[DB] SQLite tables initialized successfully.');
          resolve({ mode: 'sqlite', path: dbPath });
        })
        .catch(reject);
    });
  });
}

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function createSqliteTables() {
  await runSql(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      passwordHash TEXT,
      role TEXT,
      studentId TEXT,
      cohort TEXT,
      status TEXT,
      createdAt TEXT
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      title TEXT,
      durationMinutes INTEGER,
      maxWarnings INTEGER,
      rules TEXT,
      totalQuestions INTEGER,
      createdAt TEXT
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      examId TEXT,
      studentId TEXT,
      startedAt TEXT,
      endsAt TEXT,
      maxWarnings INTEGER,
      warningCount INTEGER DEFAULT 0,
      status TEXT DEFAULT 'in_progress',
      lastWarningTimeByType TEXT,
      answers TEXT,
      createdAt TEXT
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS concepts (
      id TEXT PRIMARY KEY,
      name TEXT,
      prerequisites TEXT
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      conceptId TEXT,
      type TEXT,
      difficulty INTEGER,
      prompt TEXT,
      options TEXT,
      answerIndex INTEGER,
      starterCode TEXT,
      referenceSolution TEXT,
      naiveSolution TEXT,
      hiddenTests TEXT,
      lang TEXT,
      verified INTEGER DEFAULT 1,
      verificationReport TEXT
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS mastery (
      studentId TEXT,
      conceptId TEXT,
      pKnown REAL,
      updatedAt TEXT,
      PRIMARY KEY (studentId, conceptId)
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      questionId TEXT,
      correct INTEGER,
      code TEXT,
      submittedAt TEXT,
      runResult TEXT
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS session_events (
      sessionId TEXT PRIMARY KEY,
      attemptId TEXT,
      events TEXT
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT,
      attemptId TEXT,
      type TEXT,
      at INTEGER,
      severity TEXT,
      note TEXT
    )
  `);
}
