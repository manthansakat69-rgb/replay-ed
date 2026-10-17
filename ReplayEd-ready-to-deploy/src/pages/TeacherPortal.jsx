import React, { useState, useEffect } from 'react';
import PortalNavbar from '../components/layout/PortalNavbar';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config/mockUsers';
import { getTrainerBatch, getReplay } from '../services/api';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  BrainCircuit,
  Video,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  Eye,
  EyeOff,
  Clipboard,
  Monitor,
  ShieldAlert,
  MessageSquare,
  FileCheck2,
  TrendingDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { mockProctoringEvents } from '../proctoring/mockEvents';

function getSignalIcon(type) {
  const t = (type || '').toUpperCase();
  if (t.includes('LOOK_AWAY') || t.includes('EYE')) return EyeOff;
  if (t.includes('MULTIPLE_FACES') || t.includes('FACES') || t.includes('USERS')) return Users;
  if (t.includes('FACE_ABSENT') || t.includes('CAMERA') || t.includes('SHIELD')) return ShieldAlert;
  if (t.includes('PASTE') || t.includes('COPY') || t.includes('CLIPBOARD')) return Clipboard;
  if (t.includes('TAB') || t.includes('BLUR') || t.includes('FULLSCREEN') || t.includes('MONITOR')) return Monitor;
  return AlertTriangle;
}

function formatMs(ms) {
  const totalSecs = Math.floor((ms || 0) / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function TeacherPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Replay Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const [playbackProgress, setPlaybackProgress] = useState(25); // 0 to 100%
  const [selectedStudentForReplay, setSelectedStudentForReplay] = useState('Alex Chen');
  const [trainerFeedback, setTrainerFeedback] = useState('Excellent algorithmic reasoning. Sentinel nodes cleanly implemented.');
  const [verdict, setVerdict] = useState('approved'); // 'approved' | 'flagged'

  // Dynamic Batch & Replay Data from Backend
  const [replayEvents, setReplayEvents] = useState([]);
  const [replaySignals, setReplaySignals] = useState([
    {
      type: 'even_typing_no_deletions',
      at: 45000,
      severity: 'low',
      note: 'Consistent typing cadence registered (74 WPM, standard character variance).',
    },
    {
      type: 'TAB_SWITCH',
      at: 112000,
      severity: 'medium',
      note: 'Browser Visibility API signal: Tab blur / window switch detected at 01:52 (Candidate out of test tab for 3.8s).',
    },
    {
      type: 'PASTE',
      at: 185000,
      severity: 'high',
      note: 'AI / Rule-Based Signal: 50 lines external code paste block intercepted at timestamp 03:05.',
    },
  ]);
  const [activeSignal, setActiveSignal] = useState(null);

  // Live student submission and AI Viva records from localStorage
  const [liveCandidateSubmission, setLiveCandidateSubmission] = useState(() => {
    try {
      const saved = localStorage.getItem('replayed_student_submission');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  });

  const [liveCandidateViva, setLiveCandidateViva] = useState(() => {
    try {
      const saved = localStorage.getItem('replayed_viva_answers');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  });

  // Student directory search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');

  const trainerTabs = [
    { id: 'overview', label: 'Trainer Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students & Batches', icon: Users },
    { id: 'assessments', label: 'Results & Analytics', icon: BarChart3 },
    { id: 'mastery', label: 'Concept Mastery Reports', icon: BrainCircuit, badge: 'Insights' },
    { id: 'replay', label: 'Code Replay & Integrity', icon: Video, badge: 'Hero Tool' },
  ];

  const [studentList, setStudentList] = useState(() => {
    const defaults = [
      {
        id: 's1',
        name: 'Alex Chen',
        batch: 'Batch 2026-A',
        modulesDone: '18 / 24',
        avgScore: '94%',
        weakTopic: 'Dynamic Programming',
        integrity: '100% Genuine',
        integrityStatus: 'clean',
        latestTask: 'LRU Cache with O(1) Eviction',
        sessionId: 'sess_demo_alex',
      },
      {
        id: 's2',
        name: 'Maya Patel',
        batch: 'Batch 2026-B',
        modulesDone: '15 / 24',
        avgScore: '81%',
        weakTopic: 'Concurrency & Locks',
        integrity: 'Flagged for Human Review',
        integrityStatus: 'flagged',
        latestTask: 'Red-Black Tree Balancing',
        sessionId: 'sess_demo_maya',
      },
      {
        id: 's3',
        name: 'Jordan Lee',
        batch: 'Batch 2026-A',
        modulesDone: '19 / 24',
        avgScore: '91%',
        weakTopic: 'Graph BFS/DFS',
        integrity: '100% Genuine',
        integrityStatus: 'clean',
        latestTask: 'Custom C++ Memory Allocator',
        sessionId: null,
      },
      {
        id: 's4',
        name: 'Sophia Zhang',
        batch: 'Batch 2026-B',
        modulesDone: '21 / 24',
        avgScore: '98%',
        weakTopic: 'None (Advanced)',
        integrity: '100% Genuine',
        integrityStatus: 'clean',
        latestTask: 'Zero-Copy Ring Buffer',
        sessionId: null,
      },
      {
        id: 's5',
        name: 'Rohan Sharma',
        batch: 'Batch 2026-A',
        modulesDone: '12 / 24',
        avgScore: '69%',
        weakTopic: 'Recursion Call Stacks',
        integrity: 'Needs Review',
        integrityStatus: 'review',
        latestTask: 'Topological Sort Scheduler',
        sessionId: null,
      },
    ];

    try {
      const saved = localStorage.getItem('replayed_auth_session');
      if (saved) {
        const u = JSON.parse(saved);
        if (u?.name && u.name !== 'Alex Chen') {
          return [
            {
              id: u.id || 'curr_user',
              name: u.name,
              batch: u.batch || 'Batch 2026-A',
              modulesDone: '20 / 24',
              avgScore: '92%',
              weakTopic: 'Concurrency Primitives',
              integrity: '100% Genuine (Proctored)',
              integrityStatus: 'clean',
              latestTask: 'Assessment Task (Live Session)',
              sessionId: 'sess_live_student',
            },
            ...defaults,
          ];
        }
      }
    } catch (_) {}
    return defaults;
  });

  // Load Cohort Batch Summary from Backend API
  useEffect(() => {
    async function loadBatch() {
      try {
        const data = await getTrainerBatch();
        if (data && data.students && data.students.length > 0) {
          setStudentList((prev) =>
            prev.map((s) => {
              const apiMatch = data.students.find(
                (as) => as.name === s.name || as.studentId === s.id || as.email?.includes(s.name.toLowerCase().split(' ')[0])
              );
              if (!apiMatch) return s;
              return {
                ...s,
                integrityStatus: apiMatch.integrityStatus || s.integrityStatus,
                integrity:
                  apiMatch.integrityStatus === 'flagged'
                    ? 'Flagged for Human Review'
                    : apiMatch.integrityStatus === 'review'
                    ? 'Needs Review'
                    : '100% Genuine',
              };
            })
          );
        }
      } catch (e) {
        console.warn('[TeacherPortal] Using offline batch data:', e.message);
      }
    }
    loadBatch();
  }, []);

  // Fetch Replay Data from Backend API on demand
  useEffect(() => {
    if (activeTab === 'replay') {
      const isMaya = selectedStudentForReplay === 'Maya Patel';
      const targetSession = isMaya ? 'sess_demo_maya' : 'sess_demo_alex';
      
      const fallbackSignals = isMaya
        ? mockProctoringEvents.map((evt) => ({
            type: evt.type,
            at: evt.t,
            severity: evt.type === 'PASTE' || evt.type === 'MULTIPLE_FACES' ? 'high' : 'medium',
            note: evt.text,
            meta: evt.meta,
          }))
        : [
            {
              type: 'even_typing_no_deletions',
              at: 45000,
              severity: 'low',
              note: 'Consistent typing rhythm maintained across problem initialization.',
            },
          ];

      getReplay(targetSession)
        .then((res) => {
          if (res.events && res.events.length > 0) {
            setReplayEvents(res.events);
          }
          if (res.signals && res.signals.length > 0) {
            setReplaySignals(res.signals);
          } else {
            setReplaySignals(fallbackSignals);
          }
        })
        .catch((e) => {
          console.warn('[TeacherPortal] Using offline replay signals:', e.message);
          setReplaySignals(fallbackSignals);
        });
    }
  }, [activeTab, selectedStudentForReplay]);

  const totalDurationMs = 868000; // 14m 28s

  const jumpToSignal = (sig) => {
    const pct = Math.min(100, Math.max(0, (sig.at / totalDurationMs) * 100));
    setPlaybackProgress(pct);
    setActiveSignal(sig);
  };

  const filteredStudents = studentList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = batchFilter === 'all' || s.batch === batchFilter;
    return matchesSearch && matchesBatch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans">
      <PortalNavbar
        currentRole={ROLES.TEACHER}
        tabs={trainerTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* ========================================================
            TAB 1: TRAINER DASHBOARD / OVERVIEW
            ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs font-semibold text-zinc-300 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Trainer Verified • Dr. Elena Vance</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                  Trainer Assessment & Oversight Console
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Monitor cohort-wide mastery, review keystroke replays with forensic integrity
                  signals, and calibrate curriculum pacing based on identified weak concepts.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('replay')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition shadow-sm"
                  >
                    <Video className="w-3.5 h-3.5 fill-current" />
                    <span>Open Code Replay Reviewer</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('mastery')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700/60 transition"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>View Batch Weak Concepts</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-xs text-zinc-400 mb-1 flex items-center justify-between">
                  <span>Enrolled Cohort Students</span>
                  <Users className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="text-2xl font-bold text-white">142</div>
                <span className="text-[11px] text-zinc-400">Across 2 Active Batches</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-xs text-zinc-400 mb-1 flex items-center justify-between">
                  <span>Cohort Average Score</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">86.4%</div>
                <span className="text-[11px] text-emerald-400 font-medium">+3.8% this semester</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-xs text-zinc-400 mb-1 flex items-center justify-between">
                  <span>Replays Pending Review</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400">7 Submissions</div>
                <span className="text-[11px] text-zinc-400">1 with paste flag</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-xs text-zinc-400 mb-1 flex items-center justify-between">
                  <span>Integrity Confidence Index</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">99.2%</div>
                <span className="text-[11px] text-zinc-400">Keystroke timing verified</span>
              </div>
            </div>

            {/* Weak Concepts Alert & Review Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weak Concepts Alert across Cohort */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                      Cohort Weak Concepts Alert
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('mastery')}
                    className="text-xs text-zinc-400 hover:text-white underline underline-offset-4"
                  >
                    Deep Dive
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-white">
                        Dynamic Programming (State Transitions)
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        48% cohort pass rate • 38 students struggling with memo tables
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800">
                      Needs Lecture
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-white">
                        Multi-Threaded Lock Synchronization
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        54% cohort pass rate • Deadlock handling issues detected
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800">
                      Review Needed
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Pending Replays Queue */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                    Session Replay Review Queue
                  </h3>
                  <button
                    onClick={() => setActiveTab('replay')}
                    className="text-xs text-zinc-400 hover:text-white underline underline-offset-4"
                  >
                    Open Player
                  </button>
                </div>

                <div className="space-y-2.5">
                  {studentList.slice(0, 3).map((st, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{st.name}</div>
                        <div className="text-[11px] text-zinc-500">{st.latestTask}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            st.integrityStatus === 'flagged'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {st.integrity}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedStudentForReplay(st.name);
                            setActiveTab('replay');
                          }}
                          className="px-2.5 py-1 rounded bg-white text-zinc-950 font-bold text-[11px] hover:bg-zinc-200"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: STUDENTS AND BATCH OVERVIEW
            ======================================================== */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Students & Batch Directory</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Filter by cohort and inspect individual concept mastery indices.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>

                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="bg-zinc-900 text-xs font-semibold text-zinc-300 px-3 py-1.5 rounded-xl border border-zinc-700 focus:outline-none"
                >
                  <option value="all">All Batches</option>
                  <option value="Batch 2026-A">Batch 2026-A</option>
                  <option value="Batch 2026-B">Batch 2026-B</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Cohort</th>
                    <th className="p-3.5">Modules Done</th>
                    <th className="p-3.5">Average Score</th>
                    <th className="p-3.5">Weak Concept</th>
                    <th className="p-3.5">Integrity Signal</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                  {filteredStudents.map((st, i) => (
                    <tr key={i} className="hover:bg-zinc-900/50 transition">
                      <td className="p-3.5 font-medium text-white">
                        <div>{st.name}</div>
                        <div className="text-[10px] text-zinc-500">{st.id}</div>
                      </td>
                      <td className="p-3.5 text-zinc-400">{st.batch}</td>
                      <td className="p-3.5 font-mono">{st.modulesDone}</td>
                      <td className="p-3.5 font-bold text-white">{st.avgScore}</td>
                      <td className="p-3.5">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {st.weakTopic}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            st.integrityStatus === 'flagged'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {st.integrity}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudentForReplay(st.name);
                            setActiveTab('replay');
                          }}
                          className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-[11px] transition"
                        >
                          View Replay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: ASSESSMENT RESULTS AND ANALYTICS
            ======================================================== */}
        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-2xl font-bold text-white">Cohort Assessment Analytics</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Overall test distributions, runtime metrics, and evaluation summaries.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
                142 Submissions Evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-xs text-zinc-400 mb-1">Pass Rate (&gt;80% Score)</div>
                <div className="text-3xl font-bold text-white">91.2%</div>
                <div className="text-[11px] text-emerald-400 mt-1">Highest on Tree Algorithms</div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-xs text-zinc-400 mb-1">Average Completion Time</div>
                <div className="text-3xl font-bold text-white">32m 14s</div>
                <div className="text-[11px] text-zinc-400 mt-1">Within standard 45m budget</div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-xs text-zinc-400 mb-1">Submissions Requiring Viva</div>
                <div className="text-3xl font-bold text-amber-400">4 Flagged</div>
                <div className="text-[11px] text-zinc-400 mt-1">For block paste verification</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: CONCEPT MASTERY REPORTS
            ======================================================== */}
        {activeTab === 'mastery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-2xl font-bold text-white">Batch Concept Mastery Matrix</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Aggregated mastery across all 142 learners to inform curriculum pacing.
                </p>
              </div>
            </div>

            {/* Java OOP Adaptive Learning Track (Feature 1) */}
            <div className="rounded-2xl border border-indigo-900/60 bg-indigo-950/20 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                    Feature 1: Java OOP Adaptive Knowledge Tracking (Bayesian Model)
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Learner Knowledge State &amp; Remediation History
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300">
                  Live Adaptive Pacing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="text-xs text-zinc-400">Classes &amp; Objects</div>
                  <div className="text-xl font-bold text-white mt-1">95%</div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Mastered</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="text-xs text-zinc-400">Inheritance &amp; Subclassing</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">85%</div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Remediated from 48% (Weak)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="text-xs text-zinc-400">Polymorphism &amp; Dispatch</div>
                  <div className="text-xl font-bold text-white mt-1">72%</div>
                  <span className="text-[10px] text-zinc-400 font-semibold">Next Recommended Topic</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="text-xs text-zinc-400">Dynamic Programming</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">48%</div>
                  <span className="text-[10px] text-amber-400 font-semibold">Weak Topic Flagged</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 sm:p-8 space-y-5">
              {[
                { concept: 'Hash Tables & O(1) Lookups', mastery: 96, studentsStruggling: 3 },
                { concept: 'Doubly-Linked Lists & Sentinels', mastery: 93, studentsStruggling: 5 },
                { concept: 'Binary Heap Min/Max Priority Queues', mastery: 88, studentsStruggling: 9 },
                { concept: 'Graph Traversal (BFS / DFS)', mastery: 74, studentsStruggling: 26 },
                { concept: 'Thread-Safe Lock Concurrency', mastery: 54, studentsStruggling: 58 },
                { concept: 'Dynamic Programming (Memoization)', mastery: 48, studentsStruggling: 64 },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-white text-sm">{c.concept}</span>
                    <span
                      className={`font-mono text-xs px-2.5 py-0.5 rounded font-bold ${
                        c.mastery >= 85
                          ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                          : c.mastery >= 70
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-amber-950/70 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {c.mastery}% Batch Mastery ({c.studentsStruggling} need assistance)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.mastery >= 85 ? 'bg-white' : c.mastery >= 70 ? 'bg-zinc-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${c.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: CODE REPLAY AND INTEGRITY REVIEWER (HERO TOOL)
            ======================================================== */}
        {activeTab === 'replay' && (
          <div className="space-y-4">
            {/* Replay Control Bar */}
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Keystroke Replay Session Inspector
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Candidate:</span>
                  <select
                    value={selectedStudentForReplay}
                    onChange={(e) => setSelectedStudentForReplay(e.target.value)}
                    className="bg-zinc-800 text-xs text-zinc-200 px-3 py-1 rounded-xl border border-zinc-700 focus:outline-none"
                  >
                    {studentList.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name} ({st.integrity || st.integrityStatus})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Media Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Replay</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setPlaybackProgress(0)}
                  className="p-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {['1x', '2x', '4x'].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      playbackSpeed === spd
                        ? 'bg-zinc-700 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrubber Timeline Bar with Jumpable Signal Pins */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>{formatMs((playbackProgress / 100) * totalDurationMs)}</span>
                <span className="text-[11px] text-zinc-500 font-sans">
                  Timeline scrubber with jump-to-signal markers (Step 4 &amp; 7)
                </span>
                <span>14:28</span>
              </div>

              <div className="relative flex items-center py-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={playbackProgress}
                  onChange={(e) => setPlaybackProgress(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer h-2 bg-zinc-800 rounded-lg relative z-10"
                />

                {/* Scrubber Signal Markers */}
                <div className="absolute inset-x-0 h-4 pointer-events-none z-20">
                  {replaySignals.map((sig, idx) => {
                    const leftPct = Math.min(98, Math.max(2, (sig.at / totalDurationMs) * 100));
                    const isHigh = sig.severity === 'high' || sig.type === 'PASTE' || sig.type === 'MULTIPLE_FACES';
                    const SigIcon = getSignalIcon(sig.type);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToSignal(sig);
                        }}
                        style={{ left: `${leftPct}%` }}
                        className={`pointer-events-auto absolute -top-1.5 -translate-x-1/2 w-5 h-5 rounded-full border-2 cursor-pointer transition transform hover:scale-125 flex items-center justify-center ${
                          isHigh
                            ? 'bg-rose-500 border-white shadow-md shadow-rose-900 text-white'
                            : 'bg-zinc-900 border-amber-400 text-amber-400'
                        }`}
                        title={`Signal at ${formatMs(sig.at)}: ${sig.type} - ${sig.note}`}
                      >
                        <SigIcon className="w-2.5 h-2.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Split Screen: Replay Code Window (Left) + Anomaly Telemetry Log (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Code Screen with simulated typing character by character */}
              <div className="lg:col-span-8 rounded-2xl border border-zinc-800 bg-[#0d0d10] p-4 font-mono text-xs flex flex-col justify-between min-h-[420px]">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-zinc-500">
                    <span className="text-zinc-300 font-bold">Active Keystroke Telemetry Viewer</span>
                    <span className="text-emerald-400 font-mono text-[11px]">
                      Cadence: 74 WPM • 0 Backspace bursts
                    </span>
                  </div>

                  <div className="space-y-1 text-zinc-300">
                    <div><span className="text-zinc-600 mr-3">01</span><span className="text-zinc-400">class</span> <span className="text-white font-bold">LRUCache</span>:</div>
                    <div><span className="text-zinc-600 mr-3">02</span>    <span className="text-zinc-400">def</span> <span className="text-white">__init__</span>(self, capacity: int):</div>
                    <div><span className="text-zinc-600 mr-3">03</span>        self.capacity = capacity</div>
                    <div><span className="text-zinc-600 mr-3">04</span>        self.cache = {'{}'}</div>
                    <div><span className="text-zinc-600 mr-3">05</span>        <span className="text-zinc-500"># Dummy head &amp; tail to avoid edge cases</span></div>
                    <div><span className="text-zinc-600 mr-3">06</span>        self.head = {'{"prev": None, "next": None, "key": 0, "val": 0}'}</div>
                    <div><span className="text-zinc-600 mr-3">07</span>        self.tail = {'{"prev": None, "next": None, "key": 0, "val": 0}'}</div>
                    <div><span className="text-zinc-600 mr-3">08</span>        self.head["next"] = self.tail</div>
                    <div><span className="text-zinc-600 mr-3">09</span>        self.tail["prev"] = self.head</div>
                    <div className="bg-zinc-800/60 -mx-4 px-4 py-0.5 border-l-2 border-emerald-400">
                      <span className="text-zinc-600 mr-3">10</span>    <span className="text-zinc-400">def</span> <span className="text-white">get</span>(self, key: int) -&gt; int:
                      <span className="inline-block w-1.5 h-3.5 bg-white ml-1 animate-pulse align-middle" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
                  <span>Keystroke Event #481 recorded at 04:18.291 UTC</span>
                  <span className="text-emerald-400">Consistent typing interval (135ms per char)</span>
                </div>
              </div>

              {/* Forensic Integrity Signals & Grading */}
              <div className="lg:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
                    <span>Forensic Integrity Signals</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                      selectedStudentForReplay === 'Maya Patel'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                        : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    }`}>
                      {selectedStudentForReplay === 'Maya Patel' ? 'Flagged for Review' : 'High Confidence'}
                    </span>
                  </h3>

                  <div className="space-y-2 text-xs max-h-[260px] overflow-y-auto">
                    {replaySignals.map((sig, sIdx) => {
                      const isHigh = sig.severity === 'high' || sig.type === 'PASTE' || sig.type === 'MULTIPLE_FACES';
                      const SigIcon = getSignalIcon(sig.type);
                      return (
                        <div
                          key={sIdx}
                          onClick={() => jumpToSignal(sig)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition hover:border-zinc-500 ${
                            activeSignal === sig
                              ? 'bg-zinc-800 border-white'
                              : isHigh
                              ? 'bg-rose-950/30 border-rose-800/80'
                              : 'bg-zinc-900 border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[11px] font-bold text-white flex items-center gap-1.5">
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                                isHigh
                                  ? 'bg-rose-950 border-rose-700 text-rose-400'
                                  : 'bg-zinc-800 border-zinc-700 text-amber-400'
                              }`}>
                                <SigIcon className="w-3 h-3" />
                              </span>
                              <span>{formatMs(sig.at)}</span>
                            </span>
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                              {sig.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-snug">
                            {sig.note}
                          </p>
                          <div className="mt-1 text-[10px] text-zinc-400 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>Click to jump scrubber to timestamp</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Trainer Verdict & Annotation Controls */}
                <div className="pt-3 border-t border-zinc-800 space-y-2.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Trainer Evaluation Verdict
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setVerdict('approved')}
                      className={`py-1.5 text-xs font-bold rounded-xl border ${
                        verdict === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      Approve (Genuine)
                    </button>
                    <button
                      onClick={() => setVerdict('flagged')}
                      className={`py-1.5 text-xs font-bold rounded-xl border ${
                        verdict === 'flagged'
                          ? 'bg-rose-950 text-rose-300 border-rose-600'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      Flag for Viva
                    </button>
                  </div>

                  <textarea
                    value={trainerFeedback}
                    onChange={(e) => setTrainerFeedback(e.target.value)}
                    rows={3}
                    placeholder="Enter trainer annotation..."
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2.5 text-xs text-zinc-200 focus:outline-none"
                  />

                  <button
                    onClick={() => alert('Evaluation verdict and annotation recorded successfully!')}
                    className="w-full py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition"
                  >
                    Save & Submit Evaluation
                  </button>
                </div>
              </div>
            </div>

            {/* Anti-Cheating Evidence Signal Notice (Feature 2) */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/60 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Anti-Cheating Policy &amp; Signal Interpretation (Feature 2)</span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-xs">
                <strong>Important:</strong> A tab switch or block paste (e.g. 50 lines) is an integrity signal, not conclusive proof of cheating. Browsers cannot detect every external AI tool with 100% certainty. The system provides objective telemetry signals; the final judgment rests with the Teacher.
              </p>
            </div>

            {/* Candidate AI Viva Voce Assessment & Code Similarity Inspector (Feature 4) */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white">
                      AI Viva Voce Inspection &amp; Code Semantic Similarity (Feature 4)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Candidate answers to 3 core questions based on submitted code, evaluated with semantic LLM similarity analysis.
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                  AI Alignment: 92% (High Semantic Match)
                </span>
              </div>

              {/* Submitted Code Preview */}
              <div className="p-3.5 rounded-xl bg-[#0d0d10] border border-zinc-800 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                  <span>Candidate Submitted Code Preview ({selectedStudentForReplay})</span>
                  <span>Language: JavaScript / Java</span>
                </div>
                <pre className="max-h-[120px] overflow-y-auto text-zinc-300 text-[11px] leading-relaxed p-2 rounded bg-zinc-950/80">
{liveCandidateSubmission?.code || `class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    get(key) {
        if (!this.cache.has(key)) return -1;
        const val = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, val);
        return val;
    }
}`}
                </pre>
              </div>

              {/* 3 Viva Answers Evaluated */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Question 1: Output &amp; Complexity</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 italic">"What will be the output and asymptotic complexity of this code?"</p>
                  <p className="text-xs text-zinc-200 leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                    {liveCandidateViva?.answers?.q1 ||
                      'Returns -1 on cache miss, updates item recency on get/put. O(1) average time complexity with O(capacity) auxiliary memory.'}
                  </p>
                  <div className="text-[10px] text-emerald-400 font-semibold">AI Evaluation: 9/10 (Accurate complexity bounds)</div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Question 2: Approach &amp; Data Structures</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 italic">"Why did you choose this architectural and data structure approach?"</p>
                  <p className="text-xs text-zinc-200 leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                    {liveCandidateViva?.answers?.q2 ||
                      'Used hash map with doubly linked list to achieve strict O(1) eviction and lookup instead of O(N) array scans.'}
                  </p>
                  <div className="text-[10px] text-emerald-400 font-semibold">AI Evaluation: 9/10 (Clear algorithmic rationale)</div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Question 3: Error Diagnostics &amp; Edge Cases</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 italic">"If an error or edge case occurs in this code, how would you diagnose and fix it?"</p>
                  <p className="text-xs text-zinc-200 leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                    {liveCandidateViva?.answers?.q3 ||
                      'Use sentinel dummy head/tail to prevent null pointer exceptions during eviction, and validate non-negative capacity.'}
                  </p>
                  <div className="text-[10px] text-emerald-400 font-semibold">AI Evaluation: 8/10 (Solid defensive programming)</div>
                </div>
              </div>

              {/* Teacher Decision Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 gap-3">
                <span className="text-xs text-zinc-400">
                  Teacher Final Authority: AI Viva score serves as an understanding indicator; final decision rests with the teacher.
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setVerdict('approved');
                      alert(`Submission and AI Viva for ${selectedStudentForReplay} approved as genuine!`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition"
                  >
                    Confirm &amp; Approve
                  </button>
                  <button
                    onClick={() => {
                      setVerdict('flagged');
                      alert(`Candidate ${selectedStudentForReplay} scheduled for 10-minute live oral viva interview.`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs hover:bg-zinc-700 transition"
                  >
                    Request Live Oral Interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
