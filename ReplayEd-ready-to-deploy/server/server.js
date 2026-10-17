import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDb, getDbMode } from './src/db/db.js';
import { apiRouter } from './src/routes/api.js';
import { errorHandler } from './src/core/errors.js';
import { User, Exam, Concept, Question, Mastery } from './src/db/models.js';
import { runSeed } from './src/seed/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for Vite dev server and browser clients
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '10mb' }));

// Health & Architecture Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'PS2 ReplayEd Adaptive Learning & Proctoring Portal',
    databaseMode: getDbMode(),
    maxWarnings: process.env.MAX_WARNINGS || 3,
    timestamp: new Date().toISOString(),
  });
});

// Mount Central API Router
app.use('/api', apiRouter);

// Legacy compatibility routes for admin & existing frontend modules
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (e) {
    next(e);
  }
});

app.get('/api/admin/metrics', async (req, res, next) => {
  try {
    const [users, questionsRes, conceptsRes] = await Promise.all([
      User.find({}),
      Question.find({}),
      Concept.find({}),
    ]);
    const students = users.filter((u) => u.role === 'student');
    const trainers = users.filter((u) => u.role === 'trainer' || u.role === 'teacher');
    const questionsList = await questionsRes.lean();
    const conceptsList = await conceptsRes.lean();

    res.json({
      totalUsers: users.length,
      totalStudents: students.length,
      totalTrainers: trainers.length,
      totalCourses: conceptsList.length,
      totalAssessments: questionsList.length,
      clusterStatus: '24/24 Online (Zero-latency Active)',
    });
  } catch (e) {
    next(e);
  }
});

// Serve static frontend in production if dist directory exists
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Central Error Handler
app.use(errorHandler);

// Start Server
async function startServer() {
  try {
    await initDb();

    // Auto-seed if database is fresh
    const existingUsers = await User.find({});
    if (!existingUsers || existingUsers.length === 0) {
      console.log('[Server] Database is empty. Running initial seed...');
      await runSeed();
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`[PS2 Backend] Server running on http://localhost:${PORT}`);
      console.log(`[PS2 Backend] Mode: ${getDbMode().toUpperCase()} | Warnings Limit: ${process.env.MAX_WARNINGS || 3}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[Server Startup Error]:', err);
    process.exit(1);
  }
}

if (process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server'))) {
  startServer();
} else {
  initDb().catch((e) => console.error('Test DB Init Error:', e));
}

export { app, startServer };
