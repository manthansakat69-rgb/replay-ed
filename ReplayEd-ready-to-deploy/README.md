# ReplayEd (PS2) — Adaptive Learning & Forensic Assessment Portal

ReplayEd is an adaptive learning and coding assessment platform featuring Bayesian Knowledge Tracing (BKT), a server-side 3-warning proctoring engine with fine-grained debouncing, forensic keystroke replay analysis, in-browser code execution sandbox with hostile attack containment, and automated AI viva voce verification.

---

## 🚀 How to Run

### 1. Backend Server (Port 5000)
```bash
cd server
npm install
npm run seed     # Seeds 12 concepts, 36 questions, demo users & replay sessions
npm test         # Runs 35 tests across 6 test suites
npm start        # Launches REST API server on http://localhost:5000
```
> **Database**: The backend uses MongoDB via Mongoose with an automatic SQLite fallback (`./data/ps2_mastery.sqlite`). If MongoDB is not running locally, SQLite initializes automatically with zero setup required.

### 2. Frontend Application (Port 5173)
```bash
# In the repository root
npm install
npm run dev      # Launches Vite development server on http://localhost:5173
```
Open `http://localhost:5173/` in your browser.

### 3. Production Build
```bash
npm run build    # Bundles client into dist/ with Vite
```

---

## 📋 Step 0 & Step 3: Complete API Contract

| HTTP Method | Endpoint | Description | Status |
|---|---|---|---|
| `POST` | `/api/auth/login` | Simple JWT login with two roles (student, trainer) | ✅ Implemented |
| `POST` | `/api/auth/register` | Register new student or trainer | ✅ Implemented |
| `GET` | `/api/exams/:id` | Exam configuration, duration, rules | ✅ Implemented |
| `POST` | `/api/exams/:id/start` | Creates session `{ sessionId, startedAt, endsAt, maxWarnings }` | ✅ Implemented |
| `GET` | `/api/next-question` | Adaptive question selector via BKT + prerequisite DAG | ✅ Implemented |
| `POST` | `/api/answer` | Updates mastery via `updateMastery()`, returns next question + reason | ✅ Implemented |
| `POST` | `/api/code/run` | Code sandbox execution (Judge0 + local subprocess fallback) | ✅ Implemented |
| `POST` | `/api/events` | Telemetry batch ingestion with 10s debounced 3-warning engine | ✅ Implemented |
| `POST` | `/api/exams/:id/submit` | Final submission (rejects past endsAt) | ✅ Implemented |
| `GET` | `/api/attempt/:id/replay` | Keystroke events + forensic integrity signals with timestamps | ✅ Implemented |
| `GET` | `/api/student/:id/mastery`| Per-concept Bayesian Knowledge Tracing mastery vector | ✅ Implemented |
| `GET` | `/api/trainer/batch` | Cohort-wide mastery summary + flagged sessions for human review | ✅ Implemented |
| `POST` | `/api/explain/generate` | Generate viva voce conceptual questions via Claude API | ✅ Implemented |
| `POST` | `/api/explain/judge` | Grade student viva voce explanation via Claude API | ✅ Implemented |
| `POST` | `/api/admin/generate-question` | LLM question generator with reference/naive verification loop | ✅ Implemented |

---

## 🛡️ Step 4: Event Logging & 3-Warning Proctoring Engine

- **Violation types that count toward warnings**: `tab_hidden`, `fullscreen_exit`, `multiple_faces` (>2s), `face_missing` (>5s), `loud_audio` (>3s), `paste_attempt_blocked`.
- **Non-violations**: Ordinary head/eye movement, single brief blur.
- **Debounce Rule**: Identical violation types trigger at most one warning per 10-second (10,000ms) window.
- **3-Warning Lock**: At 3 warnings, the server marks `session.status = "locked_for_review"`, auto-submits answers, and rejects subsequent event/answer writes.
- **Neutral Language**: The word "cheating" is never used; all infractions are labeled **"flagged for human review"**.
- **Forensic Signals (storing timestamp `at` for instant jump-to-time replay)**:
  1. `large_paste_attempt`: External paste exceeding 150 characters.
  2. `typing_faster_than_rhythm`: Cadence >2.2x student baseline.
  3. `zero_runs_large_code`: Large code submitted with 0 intermediate runs.
  4. `even_typing_no_deletions`: Monotonic typing with 0 backspaces (>100 chars).
  5. `paste_after_tab_switch`: Paste attempted within 2 seconds of returning from tab switch.
  6. `mostly_pasted_ratio`: Total pasted character count exceeding 40% of codebase.

---

## 💻 Step 5: Code Sandbox & Hostile Attack Containment

- Primary runner connects to **Judge0** (`JUDGE0_URL`).
- **Subprocess Fallback**: If Judge0 is offline, executes in a temporary directory with a 5,000ms timeout and logs: `[SANDBOX WARNING] Judge0 unreachable. Falling back to local subprocess sandbox. NOTE: This fallback is not isolated.`
- **Hostile Containment Tests**:
  - `infiniteLoop.js`: Terminated within 1,000ms timeout.
  - `readFile.js`: Blocked/contained within ephemeral sandbox directory.
  - `networkCall.js`: Outbound network access restricted and reported.
- **Verified Question Generator (`POST /api/admin/generate-question`)**: Asks Claude for reference solution, naive solution, and hidden tests. Runs both in sandbox; accepts only if reference passes and naive fails (max 3 retries).

---

## 🎯 Step 6 & Step 7: Frontend Proctoring Client & Theme Switcher

- **Consent Screen**: Full consent modal informing candidate of camera, mic, tab, and paste monitoring, confirming no video/audio is uploaded.
- **Fullscreen Enforcement**: Enters Fullscreen on start; logs `fullscreen_exit`.
- **Paste Interception**: Intercepts `Ctrl+V`, `Cmd+V`, `Shift+Insert`, right-click paste, drag-and-drop in Monaco Editor. Captures character count only (`{ charCount }`) without clipboard content.
- **Face Detection**: MediaPipe Tasks Vision running locally at 2-3 fps. Emits `face_missing` (>5s) and `multiple_faces` (>2s).
- **Audio Monitoring**: Web Audio API AnalyserNode emits `loud_audio` (>3s).
- **Telemetry Batching**: POSTs batch to `/api/events` every 2 seconds with offline queueing.
- **Theme Toggle**: Header sun/moon button with CSS variables on `:root` and `[data-theme="dark"]`, `prefers-color-scheme` support, `localStorage` persistence, and Monaco theme switching (`vs` / `vs-dark`).

---

## 📜 Third-Party Libraries & Licenses

### Backend Dependencies (`server/package.json`)
| Package | Version | License | Purpose |
|---|---|---|---|
| `express` | `^4.21.1` | MIT | Web server and API routing |
| `cors` | `^2.8.5` | MIT | Cross-Origin Resource Sharing for Vite dev server |
| `dotenv` | `^16.4.5` | BSD-2-Clause | Environment configuration |
| `jsonwebtoken` | `^9.0.2` | MIT | JWT session token issuance and verification |
| `mongoose` | `^9.11.2` | MIT | MongoDB ODM database driver |
| `sqlite3` | `^6.0.1` | BSD-3-Clause | Zero-dependency SQLite fallback database driver |
| `zod` | `^4.6.7` | MIT | Schema definition and input validation |
| `@anthropic-ai/sdk` | `^0.135.0` | MIT | Claude API client for viva questions and evaluation |

### Frontend Dependencies (`package.json`)
| Package | Version | License | Purpose |
|---|---|---|---|
| `react` | `^18.3.1` | MIT | UI component library |
| `react-dom` | `^18.3.1` | MIT | React DOM renderer |
| `react-router-dom` | `^6.28.0` | MIT | Client-side routing |
| `@monaco-editor/react` | `^4.7.0` | MIT | In-browser VS Code Monaco editor with telemetry logging |
| `lucide-react` | `^0.468.0` | ISC | UI iconography |
| `framer-motion` | `^11.15.0` | MIT | UI animations and layout transitions |
| `three` | `^0.170.0` | MIT | 3D graphics rendering engine |
| `@react-three/fiber` | `^8.17.10` | MIT | React Three.js canvas abstraction |
| `@react-three/drei` | `^9.121.4` | MIT | Three.js shader and geometry helpers |
| `tailwindcss` | `^3.4.16` | MIT | Utility-first CSS framework |
| `vite` | `^5.4.11` | MIT | Vite bundler and development server |

---

## 💡 Assumptions
1. **Dual-Database Portability**: SQLite (`sqlite3`) is bundled as the primary local zero-configuration database fallback whenever MongoDB is not reachable on `mongodb://localhost:27017`.
2. **Zero Media Storage**: No raw video frames or audio recordings are uploaded or stored anywhere on server or client.
3. **Neutral Language Compliance**: All violation events and warnings avoid the term "cheating", using **"flagged for human review"** throughout.
4. **Adaptive Prerequisite Remediation Threshold**: Students are routed to prerequisite remediation when their estimated prerequisite mastery \(pKnown < 0.60\).
5. **AI Viva Fallback**: Deterministic heuristic grading activates if the Claude API key is absent or quota is exceeded, ensuring uninterrupted evaluation.
