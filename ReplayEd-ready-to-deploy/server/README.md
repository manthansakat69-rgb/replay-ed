# PS2: Adaptive Learning & Proctoring Assessment Portal ("ReplayEd") Backend

This repository contains the backend and proctoring client for an adaptive learning and assessment portal ("PS2"). It features a dual-database engine (MongoDB with automatic SQLite fallback), Bayesian Knowledge Tracing (BKT) adaptive question sequencing, a 3-warning server-side proctoring engine with fine-grained debouncing, forensic keystroke replay analysis, and an isolated code execution sandbox with Claude AI question verification.

---

## 1. Quick Setup & Run

### Prerequisites
- **Node.js**: v18+ (tested on Node.js v24.18.1)
- **MongoDB** (optional): If MongoDB is not reachable, the server automatically initializes SQLite at `./data/ps2_mastery.sqlite` with zero configuration required.

### Setup Instructions
```bash
# 1. Navigate to the server folder
cd server

# 2. Copy the environment configuration
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Seed the database (12 concepts, 36 questions, demo users, demo sessions)
npm run seed

# 5. Run automated test suites (35 tests across 6 suites)
npm test

# 6. Start the development server
npm start
# Server listens on http://localhost:5000 (CORS enabled for Vite on http://localhost:5173)
```

---

## 2. API Contract (Step 0 & Step 3)

| HTTP Method | Endpoint | Description | Expected Payload / Params | Response Shape |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | `{ email, password, role }` | `{ success, token, user: { id, name, email, role, studentId, cohort } }` |
| `POST` | `/api/auth/register` | Register new user | `{ name, email, role, studentId, batch }` | `{ success, token, user }` |
| `GET` | `/api/exams/:id` | Get exam configuration & rules | URL param `:id` | `{ id, title, durationMinutes, maxWarnings, rules, totalQuestions }` |
| `POST` | `/api/exams/:id/start` | Create assessment session | `{ studentId }` | `{ sessionId, startedAt, endsAt, maxWarnings }` |
| `GET` | `/api/next-question` | Retrieve next adaptive question | Query: `?studentId&target` | `{ questionId, conceptId, type, difficulty, prompt, options?, starterCode?, reason }` |
| `POST` | `/api/answer` | Submit answer & update BKT mastery | `{ studentId, questionId, correct, selectedIndex?, code?, sessionId? }` | `{ mastery: { [conceptId]: pKnown }, next: { questionId, ... } }` |
| `POST` | `/api/code/run` | Execute code in sandbox | `{ questionId, code, lang, studentId }` | `{ passed, results: [{ test, ok }], error? }` |
| `POST` | `/api/events` | Stream proctoring telemetry batch | `{ sessionId, events: [{ t, type, data }] }` | `{ warningCount, maxWarnings, message, isLocked }` |
| `POST` | `/api/exams/:id/submit` | Final assessment submission | `{ sessionId, studentId, finalCode?, answers? }` | `{ success, status, submittedAt, results }` |
| `GET` | `/api/attempt/:id/replay` | Keystroke replay & signals | URL param `:id` (or sessionId) | `{ events: [...], signals: [...], attempt }` |
| `GET` | `/api/student/:id/mastery`| Get student mastery vector | URL param `:id` | `{ studentId, mastery: [{ conceptId, pKnown, updatedAt }] }` |
| `GET` | `/api/trainer/batch` | Cohort-wide batch summary | None | `{ students: [{ studentId, name, masteries, flaggedSessions, integrityStatus }] }` |
| `POST` | `/api/explain/generate` | Generate Claude AI viva questions | `{ attemptId, code, questionPrompt }` | `{ questions: [ { id, question, criteria } ] }` |
| `POST` | `/api/explain/judge` | Grade student oral explanation | `{ attemptId, question, answer }` | `{ score, feedback, masteryConfirmed }` |
| `POST` | `/api/admin/generate-question`| Verified LLM question generator | `{ conceptId, difficulty }` | `{ question, verificationReport }` |

---

## 3. Architecture & Core Modules

### A. Bayesian Knowledge Tracing (BKT) & Prerequisite DAG (`bkt.js` & `adaptive.js`)
- Standard BKT parameters per concept:
  - \(P(L_0) = 0.30\) (Prior mastery)
  - \(P(T) = 0.15\) (Transition probability)
  - \(P(G) = 0.20\) (Guess probability)
  - \(P(S) = 0.10\) (Slip probability)
- Directed Acyclic Graph (DAG) traversal identifies prerequisite dependencies.
- If any prerequisite has mastery \(pKnown < 0.60\), `chooseNext` automatically routes the student to remedial prerequisite questions with an explicit explanatory `"reason"`.

### B. 3-Warning Proctoring Engine & Debounce Logic (`src/integrity/signals.js`)
- **Violations counted toward warnings**:
  1. `tab_hidden` (switching tabs / minimizing)
  2. `fullscreen_exit` (exiting locked fullscreen)
  3. `multiple_faces` (sustained >2 seconds)
  4. `face_missing` (sustained >5 seconds)
  5. `loud_audio` (sustained >3 seconds)
  6. `paste_attempt_blocked` (external clipboard insertion)
- **Non-violations**: Ordinary head/eye movement, single brief window blur.
- **10-Second Debounce**: Identical violation types trigger at most one warning per 10,000ms window.
- **Human Review Safeguard**: When `warningCount >= 3`, the session is locked (`status = "locked_for_review"`), answers auto-submitted, and further writes rejected.
- **Neutral Language**: Never uses the term "cheating"; uses **"flagged for human review"** throughout.

### C. Server-Side Forensic Integrity Signals
The server scans raw session telemetry and emits 6 integrity signals storing the exact timestamp `at` for instant jump-to-timestamp replay:
1. `large_paste_attempt`: External insertion exceeding 150 characters.
2. `typing_faster_than_rhythm`: Keystroke cadence exceeding 2.2x student baseline WPM.
3. `zero_runs_large_code`: Large code submitted (>120 chars) with 0 intermediate test executions.
4. `even_typing_no_deletions`: Monotonic code growth with 0 backspace/delete events (>100 chars).
5. `paste_after_tab_switch`: Paste attempted within 2 seconds of returning from a hidden tab.
6. `mostly_pasted_ratio`: Total pasted character volume exceeding 40% of the final codebase.

### D. Code Execution Sandbox & Hostile Test Containment (`src/sandbox/`)
- Executes student code against hidden test cases.
- Primary execution targets **Judge0** (`JUDGE0_URL`).
- **Subprocess Fallback**: If Judge0 is offline, executes in a secure temporary directory with a strict 5,000ms timeout, logging:
  `[SANDBOX WARNING] Judge0 unreachable. Falling back to local subprocess sandbox. NOTE: This fallback is not isolated.`
- **Hostile Attack Containment**:
  1. **Infinite Loop**: Terminated by a 1,000ms execution timeout (`SIGTERM`).
  2. **File Access (`/etc/passwd`)**: Enclosed in an ephemeral directory with read restrictions; rejected/failed.
  3. **Outbound Network Call**: Blocked or reported as unauthorized socket connection.

### E. AI Question Verification Pipeline (`src/sandbox/questionGenerator.js`)
- Solicits coding questions from Claude with:
  1. Reference solution (optimal)
  2. Deliberately naive solution (suboptimal/buggy)
  3. Hidden test cases
- Runs both solutions in the sandbox. The question is **accepted only if the reference passes and the naive fails**.
- If verification fails, the sandbox error is returned to Claude for iterative correction (up to 3 retries).
- The question stores its full verification history in `verificationReport`.

---

## 4. Frontend Proctoring Client (`src/components/proctoring/`)
- **Consent Modal**: Explains camera, mic, tab, and paste monitoring, explicitly confirming that no audio or video is recorded or uploaded.
- **Fullscreen API**: Forces fullscreen on exam start and logs `fullscreen_exit`.
- **Page Visibility API**: Tracks tab switching and blur/focus events (`tab_hidden`, `tab_visible`).
- **Paste Interception**: Intercepts `Ctrl+V`, `Cmd+V`, `Shift+Insert`, right-click paste, and drag-and-drop in Monaco Editor. Captures character count only (`{ charCount }`) without logging clipboard text.
- **Face Presence (MediaPipe)**: Tracks camera at 2-3 fps; triggers `face_missing` (>5s) and `multiple_faces` (>2s).
- **Web Audio API**: Tracks volume levels; triggers `loud_audio` (>3s).
- **Batching**: Telemetry flushes every 2,000ms with offline queueing.
- **Dark / Light Theme**: Header sun/moon toggle with CSS variables on `:root` and `[data-theme="dark"]`, Monaco editor theme sync (`vs` / `vs-dark`), and high-contrast indicators.

---

## 5. Third-Party Libraries & Licenses

### Backend Dependencies (`server/package.json`)
| Library | Version | License | Purpose |
|---|---|---|---|
| `express` | ^4.21.1 | MIT | Web server and API routing |
| `cors` | ^2.8.5 | MIT | Cross-Origin Resource Sharing for Vite client |
| `dotenv` | ^16.4.5 | BSD-2-Clause | Environment variable management |
| `jsonwebtoken` | ^9.0.2 | MIT | JWT session token issuance and verification |
| `mongoose` | ^9.11.2 | MIT | MongoDB ODM database driver |
| `sqlite3` | ^6.0.1 | BSD-3-Clause | Embedded SQLite fallback database driver |
| `zod` | ^4.6.7 | MIT | Schema definition and input validation |
| `@anthropic-ai/sdk` | ^0.135.0 | MIT | Claude API client for viva questions and evaluation |

### Frontend Dependencies (`package.json`)
| Library | Version | License | Purpose |
|---|---|---|---|
| `react` | ^18.3.1 | MIT | UI component library |
| `react-dom` | ^18.3.1 | MIT | React DOM renderer |
| `react-router-dom` | ^6.28.0 | MIT | Client-side routing |
| `@monaco-editor/react` | ^4.7.0 | MIT | VS Code Monaco code editor with telemetry capture |
| `lucide-react` | ^0.468.0 | ISC | High-contrast UI iconography |
| `framer-motion` | ^11.15.0 | MIT | Smooth UI animations and transitions |
| `three` | ^0.170.0 | MIT | 3D visual graphics engine |
| `@react-three/fiber` | ^8.17.10 | MIT | React renderer for Three.js |
| `@react-three/drei` | ^9.121.4 | MIT | Three.js shader and geometry helpers |
| `tailwindcss` | ^3.4.16 | MIT | Utility-first CSS styling framework |
| `vite` | ^5.4.11 | MIT | Next-generation frontend bundler and dev server |

---

## 6. Assumptions & Design Decisions
1. **Database Fallback**: MongoDB is targeted as the primary datastore, but SQLite (`sqlite3`) is bundled and active by default when MongoDB is unavailable, enabling immediate zero-configuration local evaluation.
2. **Privacy First**: No raw audio, video frames, or clipboard content are ever recorded, stored, or transmitted to any server or external API. Telemetry is restricted to timestamped events and character counts.
3. **Neutral Language Enforcement**: Violations are flagged as **"flagged for human review"** rather than "cheating" to ensure fair, unbiased human oversight.
4. **Offline Resilience**: The proctoring client queues telemetry in memory when disconnected and retries submission every 2 seconds.
5. **Claude API Fallback**: If `ANTHROPIC_API_KEY` is not provided or quota is exceeded, viva question generation and evaluation fall back to deterministic expert heuristics so the exam experience remains fully functional.
