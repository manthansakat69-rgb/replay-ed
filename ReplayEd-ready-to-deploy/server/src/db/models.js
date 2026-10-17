import mongoose from 'mongoose';
import { getDbMode, getSqliteDb } from './db.js';

// =========================================================================
// MONGOOSE SCHEMAS (Used when MongoDB is active)
// =========================================================================
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, default: 'demo_hash' },
  role: { type: String, enum: ['student', 'trainer', 'admin'], default: 'student' },
  studentId: { type: String },
  cohort: { type: String, default: 'Batch 2026-A' },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

const ExamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  durationMinutes: { type: Number, default: 45 },
  maxWarnings: { type: Number, default: 3 },
  rules: [{ type: String }],
  totalQuestions: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now },
});

const SessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  examId: { type: String, required: true },
  studentId: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  endsAt: { type: Date, required: true },
  maxWarnings: { type: Number, default: 3 },
  warningCount: { type: Number, default: 0 },
  status: { type: String, enum: ['in_progress', 'submitted', 'locked_for_review'], default: 'in_progress' },
  lastWarningTimeByType: { type: Map, of: Number, default: {} },
  answers: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

const ConceptSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  prerequisites: [{ type: String }],
});

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  conceptId: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'code'], required: true },
  difficulty: { type: Number, default: 1 },
  prompt: { type: String, required: true },
  options: [{ type: String }],
  answerIndex: { type: Number },
  starterCode: { type: String },
  referenceSolution: { type: String },
  naiveSolution: { type: String },
  hiddenTests: [{ stdin: String, expectedStdout: String }],
  lang: { type: String, default: 'javascript' },
  verified: { type: Boolean, default: true },
  verificationReport: { type: Object },
});

const MasterySchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  conceptId: { type: String, required: true },
  pKnown: { type: Number, default: 0.3 },
  updatedAt: { type: Date, default: Date.now },
});
MasterySchema.index({ studentId: 1, conceptId: 1 }, { unique: true });

const AttemptSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  questionId: { type: String, required: true },
  correct: { type: Boolean, required: true },
  code: { type: String },
  submittedAt: { type: Date, default: Date.now },
  runResult: { type: Object },
});

const SessionEventsSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  attemptId: { type: String },
  events: [{ type: Object }],
});

const SignalSchema = new mongoose.Schema({
  sessionId: { type: String },
  attemptId: { type: String },
  type: { type: String, required: true },
  at: { type: Number, required: true },
  severity: { type: String, enum: ['low', 'med', 'high'], default: 'med' },
  note: { type: String, required: true },
});

const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
const MongoExam = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
const MongoSession = mongoose.models.Session || mongoose.model('Session', SessionSchema);
const MongoConcept = mongoose.models.Concept || mongoose.model('Concept', ConceptSchema);
const MongoQuestion = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
const MongoMastery = mongoose.models.Mastery || mongoose.model('Mastery', MasterySchema);
const MongoAttempt = mongoose.models.Attempt || mongoose.model('Attempt', AttemptSchema);
const MongoSessionEvents = mongoose.models.SessionEvents || mongoose.model('SessionEvents', SessionEventsSchema);
const MongoSignal = mongoose.models.Signal || mongoose.model('Signal', SignalSchema);

// =========================================================================
// SQLITE HELPERS & QUERY PROMISE BUILDER
// =========================================================================
function allSql(sql, params = []) {
  const db = getSqliteDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function getSql(sql, params = []) {
  const db = getSqliteDb();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

function runSql(sql, params = []) {
  const db = getSqliteDb();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function buildQuery(fetchFn) {
  const promise = Promise.resolve().then(fetchFn);
  promise.lean = () => promise;
  promise.sort = (spec) =>
    buildQuery(async () => {
      const rows = await fetchFn();
      if (spec && spec.at) {
        rows.sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
      }
      return rows;
    });
  return promise;
}

// ---------------- USER MODEL ----------------
export const User = {
  async findOne(query) {
    if (getDbMode() === 'mongo') return MongoUser.findOne(query).lean();
    if (query.id) return getSql('SELECT * FROM users WHERE id = ?', [query.id]);
    if (query.email) return getSql('SELECT * FROM users WHERE email = ?', [query.email]);
    if (query.$or) {
      for (const cond of query.$or) {
        const key = Object.keys(cond)[0];
        const val = cond[key];
        const row = await getSql(`SELECT * FROM users WHERE ${key} = ?`, [val]);
        if (row) return row;
      }
      return null;
    }
    return null;
  },
  find(query = {}) {
    if (getDbMode() === 'mongo') return MongoUser.find(query).lean();
    return buildQuery(async () => {
      if (query.role) return allSql('SELECT * FROM users WHERE role = ?', [query.role]);
      return allSql('SELECT * FROM users');
    });
  },
  async create(doc) {
    if (getDbMode() === 'mongo') return MongoUser.create(doc);
    await runSql(
      'INSERT OR REPLACE INTO users (id, name, email, passwordHash, role, studentId, cohort, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [doc.id, doc.name, doc.email, doc.passwordHash || 'demo_hash', doc.role || 'student', doc.studentId || null, doc.cohort || 'Batch 2026-A', doc.status || 'Active', new Date().toISOString()]
    );
    return doc;
  },
  async insertMany(docs) {
    if (getDbMode() === 'mongo') return MongoUser.insertMany(docs);
    for (const d of docs) await this.create(d);
    return docs;
  },
  async deleteMany(query = {}) {
    if (getDbMode() === 'mongo') return MongoUser.deleteMany(query);
    return runSql('DELETE FROM users');
  }
};

// ---------------- EXAM MODEL ----------------
export const Exam = {
  async findOne(query) {
    if (getDbMode() === 'mongo') return MongoExam.findOne(query).lean();
    const row = await getSql('SELECT * FROM exams WHERE id = ?', [query.id]);
    if (!row) return null;
    return {
      ...row,
      rules: row.rules ? JSON.parse(row.rules) : [],
    };
  },
  find(query = {}) {
    if (getDbMode() === 'mongo') return MongoExam.find(query).lean();
    return buildQuery(async () => {
      const rows = await allSql('SELECT * FROM exams');
      return rows.map((r) => ({
        ...r,
        rules: r.rules ? JSON.parse(r.rules) : [],
      }));
    });
  },
  async create(doc) {
    if (getDbMode() === 'mongo') return MongoExam.create(doc);
    await runSql(
      'INSERT OR REPLACE INTO exams (id, title, durationMinutes, maxWarnings, rules, totalQuestions, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [doc.id, doc.title, doc.durationMinutes || 45, doc.maxWarnings || 3, JSON.stringify(doc.rules || []), doc.totalQuestions || 10, new Date().toISOString()]
    );
    return doc;
  },
  async insertMany(docs) {
    if (getDbMode() === 'mongo') return MongoExam.insertMany(docs);
    for (const d of docs) await this.create(d);
    return docs;
  },
  async deleteMany(query = {}) {
    if (getDbMode() === 'mongo') return MongoExam.deleteMany(query);
    return runSql('DELETE FROM exams');
  }
};

// ---------------- SESSION MODEL ----------------
export const Session = {
  async findOne(query) {
    if (getDbMode() === 'mongo') {
      const s = await MongoSession.findOne(query);
      return s;
    }
    const id = query.id || query.sessionId;
    const row = await getSql('SELECT * FROM sessions WHERE id = ?', [id]);
    if (!row) return null;
    return {
      ...row,
      lastWarningTimeByType: row.lastWarningTimeByType ? JSON.parse(row.lastWarningTimeByType) : {},
      answers: row.answers ? JSON.parse(row.answers) : [],
      async save() {
        await runSql(
          'UPDATE sessions SET warningCount = ?, status = ?, lastWarningTimeByType = ?, answers = ? WHERE id = ?',
          [this.warningCount, this.status, JSON.stringify(this.lastWarningTimeByType || {}), JSON.stringify(this.answers || []), this.id]
        );
        return this;
      }
    };
  },
  async create(doc) {
    if (getDbMode() === 'mongo') return MongoSession.create(doc);
    const sessionObj = {
      id: doc.id,
      examId: doc.examId,
      studentId: doc.studentId,
      startedAt: doc.startedAt ? new Date(doc.startedAt).toISOString() : new Date().toISOString(),
      endsAt: new Date(doc.endsAt).toISOString(),
      maxWarnings: doc.maxWarnings || 3,
      warningCount: doc.warningCount || 0,
      status: doc.status || 'in_progress',
      lastWarningTimeByType: doc.lastWarningTimeByType || {},
      answers: doc.answers || [],
      createdAt: new Date().toISOString(),
      async save() {
        await runSql(
          'UPDATE sessions SET warningCount = ?, status = ?, lastWarningTimeByType = ?, answers = ? WHERE id = ?',
          [this.warningCount, this.status, JSON.stringify(this.lastWarningTimeByType || {}), JSON.stringify(this.answers || []), this.id]
        );
        return this;
      }
    };
    await runSql(
      'INSERT OR REPLACE INTO sessions (id, examId, studentId, startedAt, endsAt, maxWarnings, warningCount, status, lastWarningTimeByType, answers, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [sessionObj.id, sessionObj.examId, sessionObj.studentId, sessionObj.startedAt, sessionObj.endsAt, sessionObj.maxWarnings, sessionObj.warningCount, sessionObj.status, JSON.stringify(sessionObj.lastWarningTimeByType), JSON.stringify(sessionObj.answers), sessionObj.createdAt]
    );
    return sessionObj;
  },
  find(query = {}) {
    if (getDbMode() === 'mongo') return MongoSession.find(query).lean();
    return buildQuery(async () => {
      let rows;
      if (query.studentId) {
        rows = await allSql('SELECT * FROM sessions WHERE studentId = ?', [query.studentId]);
      } else {
        rows = await allSql('SELECT * FROM sessions');
      }
      return rows.map((r) => ({
        ...r,
        lastWarningTimeByType: r.lastWarningTimeByType ? JSON.parse(r.lastWarningTimeByType) : {},
        answers: r.answers ? JSON.parse(r.answers) : [],
      }));
    });
  },
  async insertMany(docs) {
    if (getDbMode() === 'mongo') return MongoSession.insertMany(docs);
    for (const d of docs) await this.create(d);
    return docs;
  },
  async deleteMany(query = {}) {
    if (getDbMode() === 'mongo') return MongoSession.deleteMany(query);
    return runSql('DELETE FROM sessions');
  }
};

// ---------------- CONCEPT MODEL ----------------
export const Concept = {
  find(query = {}) {
    if (getDbMode() === 'mongo') return MongoConcept.find(query).lean();
    return buildQuery(async () => {
      const rows = await allSql('SELECT * FROM concepts');
      return rows.map((r) => ({
        ...r,
        prerequisites: r.prerequisites ? JSON.parse(r.prerequisites) : [],
      }));
    });
  },
  async findOne(query) {
    if (getDbMode() === 'mongo') return MongoConcept.findOne(query).lean();
    const row = await getSql('SELECT * FROM concepts WHERE id = ?', [query.id]);
    if (!row) return null;
    return {
      ...row,
      prerequisites: row.prerequisites ? JSON.parse(row.prerequisites) : [],
    };
  },
  async create(doc) {
    if (getDbMode() === 'mongo') return MongoConcept.create(doc);
    await runSql(
      'INSERT OR REPLACE INTO concepts (id, name, prerequisites) VALUES (?, ?, ?)',
      [doc.id, doc.name, JSON.stringify(doc.prerequisites || [])]
    );
    return doc;
  },
  async insertMany(docs) {
    if (getDbMode() === 'mongo') return MongoConcept.insertMany(docs);
    for (const d of docs) await this.create(d);
    return docs;
  },
  async deleteMany(query = {}) {
    if (getDbMode() === 'mongo') return MongoConcept.deleteMany(query);
    return runSql('DELETE FROM concepts');
  }
};

// ---------------- QUESTION MODEL ----------------
export const Question = {
  find(query = {}) {
    if (getDbMode() === 'mongo') return MongoQuestion.find(query).lean();
    return buildQuery(async () => {
      let rows;
      if (query.conceptId && query.verified !== undefined) {
        rows = await allSql('SELECT * FROM questions WHERE conceptId = ? AND verified = ?', [query.conceptId, query.verified ? 1 : 0]);
      } else if (query.conceptId) {
        rows = await allSql('SELECT * FROM questions WHERE conceptId = ?', [query.conceptId]);
      } else if (query.verified !== undefined) {
        rows = await allSql('SELECT * FROM questions WHERE verified = ?', [query.verified ? 1 : 0]);
      } else {
        rows = await allSql('SELECT * FROM questions');
      }
      return rows.map((r) => ({
        ...r,
        verified: Boolean(r.verified),
        options: r.options ? JSON.parse(r.options) : [],
        hiddenTests: r.hiddenTests ? JSON.parse(r.hiddenTests) : [],
        verificationReport: r.verificationReport ? JSON.parse(r.verificationReport) : null,
      }));
    });
  },
  async findOne(query) {
    if (getDbMode() === 'mongo') return MongoQuestion.findOne(query).lean();
    const row = await getSql('SELECT * FROM questions WHERE id = ?', [query.id]);
    if (!row) return null;
    return {
      ...row,
      verified: Boolean(row.verified),
      options: row.options ? JSON.parse(row.options) : [],
      hiddenTests: row.hiddenTests ? JSON.parse(row.hiddenTests) : [],
      verificationReport: row.verificationReport ? JSON.parse(row.verificationReport) : null,
    };
  },
  async create(doc) {
    if (getDbMode() === 'mongo') return MongoQuestion.create(doc);
    await runSql(
      'INSERT OR REPLACE INTO questions (id, conceptId, type, difficulty, prompt, options, answerIndex, starterCode, referenceSolution, naiveSolution, hiddenTests, lang, verified, verificationReport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        doc.id,
        doc.conceptId,
        doc.type,
        doc.difficulty || 1,
        doc.prompt,
        JSON.stringify(doc.options || []),
        doc.answerIndex ?? null,
        doc.starterCode || null,
        doc.referenceSolution || null,
        doc.naiveSolution || null,
        JSON.stringify(doc.hiddenTests || []),
        doc.lang || 'javascript',
        doc.verified ? 1 : 0,
        JSON.stringify(doc.verificationReport || null),
      ]
    );
    return doc;
  },
  async insertMany(docs) {
    if (getDbMode() === 'mongo') return MongoQuestion.insertMany(docs);
    for (const d of docs) await this.create(d);
    return docs;
  },
  async deleteMany(query = {}) {
    if (getDbMode() === 'mongo') return MongoQuestion.deleteMany(query);
    return runSql('DELETE FROM questions');
  }
};

// ---------------- MASTERY MODEL ----------------
export const Mastery = {
  find(query = {}) {
    if (getDbMode() === 'mongo') return MongoMastery.find(query).lean();
    return buildQuery(async () => {
      if (query.studentId) {
        return allSql('SELECT * FROM mastery WHERE studentId = ?', [query.studentId]);
      }
      return allSql('SELECT * FROM mastery');
    });
  },
  async findOne(query) {
    if (getDbMode() === 'mongo') return MongoMastery.findOne(query).lean();
    return getSql('SELECT * FROM mastery WHERE studentId = ? AND conceptId = ?', [query.studentId, query.conceptId]);
  },
  async findOneAndUpdate(filter, updateDoc, options = {}) {
    if (getDbMode() === 'mongo') return MongoMastery.findOneAndUpdate(filter, updateDoc, options);
    const pKnown = updateDoc.pKnown ?? updateDoc.$set?.pKnown;
    const updatedAt = new Date().toISOString();
    await runSql(
      'INSERT INTO mastery (studentId, conceptId, pKnown, updatedAt) VALUES (?, ?, ?, ?) ON CONFLICT(studentId, conceptId) DO UPDATE SET pKnown = excluded.pKnown, updatedAt = excluded.updatedAt',
      [filter.studentId, filter.conceptId, pKnown, updatedAt]
    );
    return { studentId: filter.studentId, conceptId: filter.conceptId, pKnown, updatedAt };
  },
  async deleteMany(query = {}) {
    if (getDbMode() === 'mongo') return MongoMastery.deleteMany(query);
    if (query.studentId) return runSql('DELETE FROM mastery WHERE studentId = ?', [query.studentId]);
    return runSql('DELETE FROM mastery');
  }
};

// ---------------- ATTEMPT MODEL ----------------
export const Attempt = {
  find(query = {}) {
    if (getDbMode() === 'mongo') return MongoAttempt.find(query).lean();
    return buildQuery(async () => {
      let rows;
      if (query.studentId) {
        rows = await allSql('SELECT * FROM attempts WHERE studentId = ?', [query.studentId]);
      } else {
        rows = await allSql('SELECT * FROM attempts');
      }
      return rows.map((r) => ({
        ...r,
        correct: Boolean(r.correct),
        runResult: r.runResult ? JSON.parse(r.runResult) : null,
      }));
    });
  },
  async findOne(query) {
    if (getDbMode() === 'mongo') return MongoAttempt.findOne(query).lean();
    const row = await getSql('SELECT * FROM attempts WHERE id = ?', [query.id]);
    if (!row) return null;
    return {
      ...row,
      correct: Boolean(row.correct),
      runResult: row.runResult ? JSON.parse(row.runResult) : null,
    };
  },
  async create(doc) {
    if (getDbMode() === 'mongo') return MongoAttempt.create(doc);
    await runSql(
      'INSERT OR REPLACE INTO attempts (id, studentId, questionId, correct, code, submittedAt, runResult) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [doc.id, doc.studentId, doc.questionId, doc.correct ? 1 : 0, doc.code || null, new Date(doc.submittedAt || Date.now()).toISOString(), JSON.stringify(doc.runResult || null)]
    );
    return doc;
  },
  async insertMany(docs) {
    if (getDbMode() === 'mongo') return MongoAttempt.insertMany(docs);
    for (const d of docs) await this.create(d);
    return docs;
  },
  async deleteMany(query = {}) {
    if (getDbMode() === 'mongo') return MongoAttempt.deleteMany(query);
    return runSql('DELETE FROM attempts');
  }
};

// ---------------- SESSION EVENTS MODEL ----------------
export const SessionEvents = {
  async findOne(query) {
    const sessionId = query.sessionId || query.attemptId;
    if (getDbMode() === 'mongo') {
      const s = await MongoSessionEvents.findOne({ $or: [{ sessionId }, { attemptId: sessionId }] });
      return s;
    }
    const row = await getSql('SELECT * FROM session_events WHERE sessionId = ? OR attemptId = ?', [sessionId, sessionId]);
    if (!row) return null;
    const events = row.events ? JSON.parse(row.events) : [];
    return {
      sessionId: row.sessionId,
      attemptId: row.attemptId,
      events,
      async save() {
        await runSql(
          'UPDATE session_events SET events = ? WHERE sessionId = ?',
          [JSON.stringify(this.events || []), this.sessionId]
        );
        return this;
      }
    };
  },
  async create(doc) {
    if (getDbMode() === 'mongo') return MongoSessionEvents.create(doc);
    const sessionObj = {
      sessionId: doc.sessionId,
      attemptId: doc.attemptId || doc.sessionId,
      events: doc.events || [],
      async save() {
        await runSql(
          'UPDATE session_events SET events = ? WHERE sessionId = ?',
          [JSON.stringify(this.events || []), this.sessionId]
        );
        return this;
      }
    };
    await runSql(
      'INSERT OR REPLACE INTO session_events (sessionId, attemptId, events) VALUES (?, ?, ?)',
      [sessionObj.sessionId, sessionObj.attemptId, JSON.stringify(sessionObj.events)]
    );
    return sessionObj;
  },
  async insertMany(docs) {
    if (getDbMode() === 'mongo') return MongoSessionEvents.insertMany(docs);
    for (const d of docs) await this.create(d);
    return docs;
  },
  async deleteMany(query = {}) {
    if (getDbMode() === 'mongo') return MongoSessionEvents.deleteMany(query);
    return runSql('DELETE FROM session_events');
  }
};

// ---------------- SIGNAL MODEL ----------------
export const Signal = {
  find(query = {}) {
    const key = query.sessionId ? 'sessionId' : 'attemptId';
    const val = query.sessionId || query.attemptId;
    if (getDbMode() === 'mongo') return MongoSignal.find(query).lean();
    return buildQuery(async () => {
      let rows;
      if (val) {
        rows = await allSql(`SELECT * FROM signals WHERE ${key} = ? ORDER BY at ASC`, [val]);
      } else {
        rows = await allSql('SELECT * FROM signals ORDER BY at ASC');
      }
      return rows;
    });
  },
  async deleteMany(query = {}) {
    if (getDbMode() === 'mongo') return MongoSignal.deleteMany(query);
    const key = query.sessionId ? 'sessionId' : 'attemptId';
    const val = query.sessionId || query.attemptId;
    if (val) {
      return runSql(`DELETE FROM signals WHERE ${key} = ?`, [val]);
    }
    return runSql('DELETE FROM signals');
  },
  async insertMany(docs) {
    if (getDbMode() === 'mongo') return MongoSignal.insertMany(docs);
    for (const d of docs) {
      await runSql(
        'INSERT INTO signals (sessionId, attemptId, type, at, severity, note) VALUES (?, ?, ?, ?, ?, ?)',
        [d.sessionId || null, d.attemptId || null, d.type, d.at, d.severity || 'med', d.note]
      );
    }
    return docs;
  }
};
