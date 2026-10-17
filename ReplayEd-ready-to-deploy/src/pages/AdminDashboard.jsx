import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/login/Logo';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config/mockUsers';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileCode2,
  Brain,
  BarChart3,
  ShieldAlert,
  Settings,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Trash2,
  LogOut,
  ArrowLeftRight,
  Home,
  Server,
  Activity,
  Sliders,
  Sparkles,
  Layers,
  Clock,
  Code2,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Download,
  Save,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();

  // Active Sidebar View
  const [activeSection, setActiveSection] = useState('dashboard');

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [usersList, setUsersList] = useState([
    {
      id: 'usr_stu_001',
      name: 'Alex Chen',
      email: 'student@replayed.edu',
      role: 'Student',
      cohort: 'Batch 2026-A',
      status: 'Active',
      joined: 'Jan 12, 2026',
    },
    {
      id: 'usr_tea_002',
      name: 'Dr. Elena Vance',
      email: 'trainer@replayed.edu',
      role: 'Trainer',
      cohort: 'Faculty (Algorithms)',
      status: 'Active',
      joined: 'Nov 04, 2025',
    },
    {
      id: 'usr_stu_089',
      name: 'Maya Patel',
      email: 'maya.patel@replayed.edu',
      role: 'Student',
      cohort: 'Batch 2026-B',
      status: 'Active',
      joined: 'Feb 01, 2026',
    },
    {
      id: 'usr_stu_114',
      name: 'Jordan Lee',
      email: 'jordan.lee@replayed.edu',
      role: 'Student',
      cohort: 'Batch 2026-A',
      status: 'Active',
      joined: 'Jan 15, 2026',
    },
    {
      id: 'usr_tea_008',
      name: 'Prof. David Krum',
      email: 'david.krum@replayed.edu',
      role: 'Trainer',
      cohort: 'Faculty (Distributed Systems)',
      status: 'Active',
      joined: 'Oct 19, 2025',
    },
    {
      id: 'usr_stu_301',
      name: 'Liam Vance',
      email: 'liam.vance@replayed.edu',
      role: 'Student',
      cohort: 'Batch 2026-B',
      status: 'Inactive',
      joined: 'Mar 10, 2026',
    },
  ]);

  // New User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Student');
  const [newUserCohort, setNewUserCohort] = useState('Batch 2026-A');

  // Course Management State
  const [coursesList, setCoursesList] = useState([
    {
      id: 'CRS-101',
      title: 'Full-Stack Distributed Systems',
      modules: 6,
      concepts: ['Microservices', 'Raft Consensus', 'gRPC', 'PostgreSQL Sharding'],
      prereq: 'Data Structures & Algorithms',
      assignedTrainer: 'Dr. Elena Vance',
      enrolled: 78,
    },
    {
      id: 'CRS-102',
      title: 'High-Performance Algorithms & Memory',
      modules: 8,
      concepts: ['Dynamic Programming', 'Tries & Heaps', 'Cache Locality', 'Concurrency'],
      prereq: 'C++ / Systems Basics',
      assignedTrainer: 'Prof. David Krum',
      enrolled: 64,
    },
    {
      id: 'CRS-103',
      title: 'Cloud Sandbox & Isolated Execution',
      modules: 4,
      concepts: ['cgroups', 'Linux Namespaces', 'Wasm Runtimes', 'Docker Internals'],
      prereq: 'Operating Systems Foundations',
      assignedTrainer: 'Dr. Elena Vance',
      enrolled: 42,
    },
  ]);

  // Adaptive Settings State
  const [masteryThreshold, setMasteryThreshold] = useState(85);
  const [remediationThreshold, setRemediationThreshold] = useState(55);
  const [autoBridgeModule, setAutoBridgeModule] = useState(true);
  const [aiVivaEvaluator, setAiVivaEvaluator] = useState(true);
  const [strictPasteAlert, setStrictPasteAlert] = useState(true);

  // Security Platform Settings
  const [sessionRetentionDays, setSessionRetentionDays] = useState(90);
  const [sandboxCpuLimit, setSandboxCpuLimit] = useState('1.5 Cores');
  const [sandboxMemoryLimit, setSandboxMemoryLimit] = useState('512 MB');

  // Handle Add User
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const created = {
      id: `usr_${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      cohort: newUserCohort,
      status: 'Active',
      joined: 'Just now',
    };
    setUsersList([created, ...usersList]);
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  const handleToggleUserStatus = (id) => {
    setUsersList(
      usersList.map((u) =>
        u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
      )
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.cohort.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users, badge: `${usersList.length}` },
    { id: 'courses', label: 'Courses & Syllabus', icon: BookOpen },
    { id: 'assessments', label: 'Assessments', icon: FileCode2 },
    { id: 'adaptive', label: 'Adaptive Learning', icon: Brain, badge: 'AI' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'audit', label: 'Audit Logs', icon: ShieldAlert, badge: 'Live' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* ========================================================
          TOP HEADER
          ======================================================== */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo variant="light" size="sm" subtitle="System Control Console" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              24 / 24 Clusters Online
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Portal Switchers */}
            <button
              onClick={() => {
                demoLogin(ROLES.STUDENT);
                navigate('/student');
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
            >
              <span>Student Portal</span>
            </button>

            <button
              onClick={() => {
                demoLogin(ROLES.TEACHER);
                navigate('/teacher');
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
            >
              <span>Trainer Console</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              title="Landing Page"
            >
              <Home className="w-4 h-4" />
            </button>

            {/* Admin Profile */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-zinc-200">Marcus Wright</span>
              <span className="text-zinc-500">(Admin)</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          BODY: SIDEBAR + MAIN WORKSPACE
          ======================================================== */}
      <div className="flex-1 flex w-full">
        {/* Persistent Sidebar */}
        <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950/60 p-4 shrink-0 flex flex-col justify-between hidden md:flex">
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Platform Administration
            </div>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-zinc-200 text-zinc-900'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Infrastructure Health Card in Sidebar */}
          <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 text-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold">Sandbox Telemetry</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="font-mono text-white text-sm font-bold">14,290 Executions</div>
            <div className="text-[10px] text-zinc-500">API Gateway latency: 24ms</div>
          </div>
        </aside>

        {/* Mobile Horizontal Subbar (shown on small screens) */}
        <div className="md:hidden w-full border-b border-zinc-800 bg-zinc-950 p-2 flex overflow-x-auto gap-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-semibold ${
                activeSection === item.id ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400 bg-zinc-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Workspace */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {/* ========================================================
              SECTION 1: DASHBOARD OVERVIEW
              ======================================================== */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">System Performance & Institute Overview</h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Real-time aggregated telemetry across all student assessments and sandbox compute clusters.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Cluster Status:</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-bold">
                    Healthy (99.98% Uptime)
                  </span>
                </div>
              </div>

              {/* 4 Core Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="text-xs text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Total Students & Faculty</span>
                    <Users className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">1,458</div>
                  <div className="text-[11px] text-zinc-500 mt-1">1,420 Students • 38 Trainers</div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="text-xs text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Active Courses & Tests</span>
                    <BookOpen className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">102</div>
                  <div className="text-[11px] text-zinc-500 mt-1">18 Courses • 84 Coding Assessments</div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="text-xs text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Assessment Completion Rate</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400">92.4%</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Avg Score: 86.4% across cohort</div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="text-xs text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Replay Forensic Confidence</span>
                    <ShieldCheck className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">99.1%</div>
                  <div className="text-[11px] text-zinc-500 mt-1">4 Anomaly flags waiting review</div>
                </div>
              </div>

              {/* Quick Jump Modules */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">User Directory</h3>
                    <button
                      onClick={() => setActiveSection('users')}
                      className="text-xs text-zinc-400 hover:text-white underline underline-offset-4"
                    >
                      Manage
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    6 users registered in active test cohort. Provision student credentials or assign faculty roles.
                  </p>
                  <button
                    onClick={() => {
                      setActiveSection('users');
                      setShowAddUserModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create User Account</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Adaptive AI Settings</h3>
                    <button
                      onClick={() => setActiveSection('adaptive')}
                      className="text-xs text-zinc-400 hover:text-white underline underline-offset-4"
                    >
                      Configure
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Promotion threshold: <strong>{masteryThreshold}%</strong>. Remediation bridge module triggers at{' '}
                    <strong>{remediationThreshold}%</strong>.
                  </p>
                  <button
                    onClick={() => setActiveSection('adaptive')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Adjust Mastery Tracer</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Security & Audit</h3>
                    <button
                      onClick={() => setActiveSection('audit')}
                      className="text-xs text-zinc-400 hover:text-white underline underline-offset-4"
                    >
                      View Stream
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Keystroke replication snapshots active. All administrative actions logged to immutable store.
                  </p>
                  <button
                    onClick={() => setActiveSection('audit')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Open Audit Telemetry</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 2: USER MANAGEMENT
              ======================================================== */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">User & Faculty Management</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Add, edit, deactivate student accounts, assign faculty roles, and manage permissions.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or cohort..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-zinc-500 font-semibold">Filter Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-zinc-900 text-xs font-semibold text-zinc-300 px-3 py-1.5 rounded-xl border border-zinc-700 focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="Student">Students Only</option>
                    <option value="Trainer">Trainers Only</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Assigned Role</th>
                      <th className="p-3.5">Cohort / Department</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Registration Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-900/50 transition">
                        <td className="p-3.5 font-medium text-white">
                          <div>{u.name}</div>
                          <div className="text-[10px] text-zinc-500">{u.email}</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'Trainer'
                                ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-zinc-300">{u.cohort}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              u.status === 'Active'
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.status === 'Active' ? 'bg-emerald-400' : 'bg-zinc-500'
                              }`}
                            />
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-zinc-500 font-mono text-[11px]">{u.joined}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300"
                          >
                            {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add User Modal */}
              {showAddUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                  <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">Provision New User Account</h3>
                    <form onSubmit={handleAddUser} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Maya Patel"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="maya.patel@replayed.edu"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                            Role
                          </label>
                          <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none"
                          >
                            <option value="Student">Student</option>
                            <option value="Trainer">Trainer</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                            Cohort / Dept
                          </label>
                          <input
                            type="text"
                            value={newUserCohort}
                            onChange={(e) => setNewUserCohort(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddUserModal(false)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200"
                        >
                          Create Account
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SECTION 3: COURSE & SYLLABUS MANAGEMENT
              ======================================================== */}
          {activeSection === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">Course & Curriculum Engineering</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Configure courses, assign lead faculty, define prerequisites and prerequisite concepts.
                  </p>
                </div>
                <button
                  onClick={() => alert('New Course Blueprint modal opened!')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Course</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {coursesList.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-2">
                        <span>{c.id}</span>
                        <span className="text-emerald-400 font-bold">{c.enrolled} Students</span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{c.title}</h3>
                      <div className="text-xs text-zinc-400 mb-4">
                        Instructor: <strong className="text-zinc-200">{c.assignedTrainer}</strong>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          Target Core Concepts:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {c.concepts.map((cp, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300"
                            >
                              {cp}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-900">
                        Prerequisite: <span className="text-zinc-300 font-medium">{c.prereq}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">{c.modules} Active Modules</span>
                      <button className="text-xs text-zinc-300 hover:text-white font-semibold flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Syllabus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 4: ASSESSMENT MANAGEMENT
              ======================================================== */}
          {activeSection === 'assessments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">Coding Assessments & Test Bench</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage coding challenges, test case evaluation suites, and supported execution runtimes.
                  </p>
                </div>
                <button
                  onClick={() => alert('New Assessment Creator opened!')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Challenge</span>
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Challenge Title</th>
                      <th className="p-3.5">Difficulty</th>
                      <th className="p-3.5">Supported Runtimes</th>
                      <th className="p-3.5">Test Cases (Public / Hidden)</th>
                      <th className="p-3.5">Submissions</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                    {[
                      {
                        title: 'LRU Cache with O(1) Eviction',
                        diff: 'Hard',
                        runtimes: 'Python 3, JS, C++',
                        tests: '4 Public / 16 Hidden',
                        subs: 142,
                      },
                      {
                        title: 'Red-Black Tree Self Balancing',
                        diff: 'Hard',
                        runtimes: 'Python 3, C++',
                        tests: '6 Public / 24 Hidden',
                        subs: 118,
                      },
                      {
                        title: 'Distributed Log Replicator',
                        diff: 'Advanced',
                        runtimes: 'Go, Rust, Python 3',
                        tests: '3 Public / 10 Hidden',
                        subs: 74,
                      },
                      {
                        title: 'Thread-Safe Lockless Queue',
                        diff: 'Medium',
                        runtimes: 'C++, Java, Go',
                        tests: '5 Public / 12 Hidden',
                        subs: 96,
                      },
                    ].map((a, i) => (
                      <tr key={i} className="hover:bg-zinc-900/50 transition">
                        <td className="p-3.5 font-bold text-white">{a.title}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {a.diff}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-zinc-400">{a.runtimes}</td>
                        <td className="p-3.5 text-zinc-300">{a.tests}</td>
                        <td className="p-3.5 font-mono">{a.subs} Submissions</td>
                        <td className="p-3.5 text-right">
                          <button className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold">
                            Configure
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
              SECTION 5: AI & ADAPTIVE LEARNING SETTINGS
              ======================================================== */}
          {activeSection === 'adaptive' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">Adaptive Learning & Knowledge Tracer Configuration</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Control mastery thresholds, automatic remediation triggers, and AI code viva generation.
                  </p>
                </div>
                <button
                  onClick={() => alert('Adaptive Engine parameters saved!')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Parameters</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mastery Threshold Controls */}
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 space-y-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    <Brain className="w-4 h-4 text-zinc-300" />
                    <span>Bayesian Mastery Cutoffs</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-white">Promotion to Advanced Algorithms</span>
                      <span className="font-bold text-emerald-400">{masteryThreshold}% Concept Confidence</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="95"
                      value={masteryThreshold}
                      onChange={(e) => setMasteryThreshold(Number(e.target.value))}
                      className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-white">Weak Concept Remediation Trigger</span>
                      <span className="font-bold text-amber-400">Below {remediationThreshold}% Mastery</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="65"
                      value={remediationThreshold}
                      onChange={(e) => setRemediationThreshold(Number(e.target.value))}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Automation & Remediation Rules */}
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Remediation & Viva Rules
                  </h3>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div>
                      <div className="text-xs font-bold text-white">Auto-Assign Bridge Modules</div>
                      <div className="text-[11px] text-zinc-400">
                        Automatically unlock targeted mini-labs when weak concepts detected
                      </div>
                    </div>
                    <button onClick={() => setAutoBridgeModule(!autoBridgeModule)}>
                      {autoBridgeModule ? (
                        <ToggleRight className="w-7 h-7 text-white" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-zinc-600" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div>
                      <div className="text-xs font-bold text-white">AI Viva Voce Generator</div>
                      <div className="text-[11px] text-zinc-400">
                        Synthesize oral questions based on student's actual code submissions
                      </div>
                    </div>
                    <button onClick={() => setAiVivaEvaluator(!aiVivaEvaluator)}>
                      {aiVivaEvaluator ? (
                        <ToggleRight className="w-7 h-7 text-white" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-zinc-600" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div>
                      <div className="text-xs font-bold text-white">Strict Clipboard Paste Flagging</div>
                      <div className="text-[11px] text-zinc-400">
                        Flag any single paste event exceeding 80 characters for trainer audit
                      </div>
                    </div>
                    <button onClick={() => setStrictPasteAlert(!strictPasteAlert)}>
                      {strictPasteAlert ? (
                        <ToggleRight className="w-7 h-7 text-white" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-zinc-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 6: REPORTS & ANALYTICS
              ======================================================== */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">Platform Intelligence & Reports</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Aggregate student performance metrics, completion rates, and forensic integrity signals.
                  </p>
                </div>
                <button
                  onClick={() => alert('Exporting platform CSV report...')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV Report</span>
                </button>
              </div>

              {/* Weak Concept Matrix */}
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Institute-Wide Weak Concept Diagnostics
                </h3>
                <div className="space-y-3">
                  {[
                    { topic: 'Dynamic Programming Memoization', weakCount: 48, rate: '48% Pass' },
                    { topic: 'Thread-Safe Concurrency & Mutexes', weakCount: 36, rate: '54% Pass' },
                    { topic: 'Self-Balancing Tree Rotations (AVL)', weakCount: 22, rate: '68% Pass' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{item.topic}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {item.weakCount} learners flagged below threshold
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800">
                        {item.rate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 7: SECURITY & AUDIT LOGS
              ======================================================== */}
          {activeSection === 'audit' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">Immutable Security & Audit Stream</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Continuous ledger of administrator permissions, privilege changes, and integrity anomalies.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-emerald-400 font-mono">
                  All Records Encrypted &amp; Signed
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 divide-y divide-zinc-800">
                {[
                  {
                    event: 'Privilege Elevation: Student Alex Chen -> Sandbox Admin Sandbox Access',
                    actor: 'Marcus Wright (System Admin)',
                    time: '8 mins ago',
                    level: 'Security Audit',
                  },
                  {
                    event: 'Keystroke Replay Snapshot #8921 Sealed (SHA-256 Verified)',
                    actor: 'Telemetry Stream Engine',
                    time: '24 mins ago',
                    level: 'Integrity Check',
                  },
                  {
                    event: 'Clipboard Anomaly Flag: Student Maya Patel (184 chars in 80ms)',
                    actor: 'Automated Forensic Detector',
                    time: '1 hour ago',
                    level: 'Warning Alert',
                  },
                  {
                    event: 'Sandbox Docker Container cgroup memory ceiling adjusted to 512MB',
                    actor: 'Marcus Wright (System Admin)',
                    time: '3 hours ago',
                    level: 'Config Change',
                  },
                ].map((log, i) => (
                  <div key={i} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{log.event}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Actor: {log.actor} • {log.time}
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
                      {log.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 8: PLATFORM SETTINGS
              ======================================================== */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">Platform & Sandbox Environment Settings</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage session retention, isolated container resource caps, and security quotas.
                  </p>
                </div>
                <button
                  onClick={() => alert('Platform Settings Saved!')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Configuration</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Session & Storage Retention
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      Keystroke Replay Retention Period
                    </label>
                    <select
                      value={sessionRetentionDays}
                      onChange={(e) => setSessionRetentionDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none"
                    >
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days (Recommended for Training Institutes)</option>
                      <option value="365">1 Year (Compliance Archive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      Per-Runner CPU Allocation
                    </label>
                    <input
                      type="text"
                      value={sandboxCpuLimit}
                      onChange={(e) => setSandboxCpuLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      Container Memory Cap
                    </label>
                    <input
                      type="text"
                      value={sandboxMemoryLimit}
                      onChange={(e) => setSandboxMemoryLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    API & Connectivity
                  </h3>
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                    <div className="text-zinc-400">Environment Base Endpoint</div>
                    <div className="font-mono text-white text-[11px]">https://api.replayed.dev/v1</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                    <div className="text-zinc-400">Database Replica Status</div>
                    <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Multi-Region Hot Standby Synced
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
