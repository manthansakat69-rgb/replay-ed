import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/login/Logo';
import { LogOut, Users, FileCheck2, Clock, PlaySquare, ArrowRight } from 'lucide-react';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo variant="light" size="sm" subtitle="Teacher Portal" />

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-medium text-zinc-300">{user?.name || 'Dr. Elena Vance'}</span>
              <span className="text-zinc-500">(Trainer Verified)</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 shadow-2xl relative overflow-hidden mb-8">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-md mb-3 border border-zinc-700/50">
              Instructor Console
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Welcome back, {user?.name || 'Trainer'}
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              7 student coding replays are pending evaluation. Observe keystroke timing, pasted code flags, and algorithmic efficiency.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition shadow-sm">
                <PlaySquare className="w-3.5 h-3.5 fill-current" />
                Open Replay Evaluation Queue (7)
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700/50 transition"
              >
                Switch Role / Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Users className="w-5 h-5 text-zinc-200" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">142</div>
              <div className="text-xs text-zinc-400">Assigned Students</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">7 Pending</div>
              <div className="text-xs text-zinc-400">Keystroke Replays Waiting</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">89 Solved</div>
              <div className="text-xs text-zinc-400">Evaluations Completed This Week</div>
            </div>
          </div>
        </div>

        {/* Pending Queue */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Session Replay Queue
            </h2>
            <span className="text-xs text-zinc-500">Live keystroke recording enabled</span>
          </div>

          <div className="space-y-3">
            {[
              {
                student: 'Alex Chen (Batch 2026-A)',
                task: 'Distributed Key-Value Store with Raft consensus',
                metric: 'Typing cadence: 84 wpm • No paste events',
                status: 'Ready to Review',
              },
              {
                student: 'Maya Patel (Batch 2026-B)',
                task: 'Red-Black Tree Self-Balancing Insertion',
                metric: 'Typing cadence: 62 wpm • 1 large block paste flagged',
                status: 'Flagged for Review',
              },
              {
                student: 'Jordan Lee (Batch 2026-A)',
                task: 'Custom Memory Allocator in C++',
                metric: 'Typing cadence: 71 wpm • Normal rhythm',
                status: 'Ready to Review',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition"
              >
                <div>
                  <div className="font-semibold text-sm text-zinc-200">{item.student}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{item.task}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{item.metric}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-300 bg-zinc-800 px-3 py-1 rounded-md border border-zinc-700/50">
                    {item.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
