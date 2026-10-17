import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../login/Logo';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ArrowLeftRight, Home, Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import { ROLES } from '../../config/mockUsers';
import { useTheme } from '../../context/ThemeContext';

export default function PortalNavbar({
  currentRole, // 'student' | 'teacher'
  tabs = [],
  activeTab,
  onTabChange,
}) {
  const { user, logout, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Live WiFi & Network Connectivity Detection
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleToggle = () => {
    if (!navigator.onLine) {
      alert('Network Error: WiFi / Internet is offline. You cannot switch accounts or roles while disconnected.');
      return;
    }
    if (currentRole === ROLES.STUDENT) {
      demoLogin(ROLES.TEACHER);
      navigate('/teacher');
    } else {
      demoLogin(ROLES.STUDENT);
      navigate('/student');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Landing Link */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            title="Go to Public Landing Page"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
          >
            <Logo
              variant="light"
              size="sm"
              subtitle={currentRole === ROLES.STUDENT ? 'Student Portal' : 'Trainer Console'}
            />
          </button>
        </div>

        {/* Right Actions: Clean Student Profile & Sign Out vs Trainer Console */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Trainer Portal Specific Links (Hidden on Student Dashboard as requested) */}
          {currentRole !== ROLES.STUDENT && (
            <>
              {/* Quick Landing Page link */}
              <button
                onClick={() => navigate('/')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 transition"
                title="Back to Landing Page"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Landing Page</span>
              </button>

              {/* Admin Console Quick Link */}
              <button
                onClick={() => {
                  if (!navigator.onLine) {
                    alert('Network Error: WiFi / Internet is offline. Admin Console requires an active connection.');
                    return;
                  }
                  demoLogin(ROLES.ADMIN);
                  navigate('/admin');
                }}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 transition"
                title="Open Admin Console"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span>Admin Console</span>
              </button>

              {/* Switch to Student */}
              <button
                onClick={handleRoleToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 shadow-sm transition"
                title="Switch to Student Portal"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Switch to</span>
                <span className="font-bold text-white">Student</span>
              </button>

              {/* Live WiFi Status Indicator Pill (Trainer) */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  isOnline
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                    : 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse'
                }`}
              >
                {isOnline ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                <span className="hidden sm:inline text-[11px] font-semibold">
                  {isOnline ? 'WiFi Online' : 'WiFi Offline'}
                </span>
              </div>
            </>
          )}

          {/* Student-Only Quick Links: Home + Top Rankers + About Us */}
          {currentRole === ROLES.STUDENT && (
            <>
              <button
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 transition"
                title="Back to Landing Page"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                onClick={() => onTabChange && onTabChange('leaderboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'leaderboard'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-500/50'
                    : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80'
                }`}
                title="View Top Rankers Leaderboard"
              >
                <span>🏆</span>
                <span className="hidden sm:inline font-bold">Top Rankers</span>
              </button>

              <button
                onClick={() => onTabChange && onTabChange('about')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'about'
                    ? 'bg-blue-400/20 text-blue-300 border border-blue-500/50'
                    : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80'
                }`}
                title="About ReplayEd Platform"
              >
                <span>ℹ️</span>
                <span className="hidden sm:inline font-bold">About Us</span>
              </button>
            </>
          )}

          {/* Theme Toggle (Sun / Moon) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white transition shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Student Profile Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white">
              {user?.name || (currentRole === ROLES.STUDENT ? 'Student Learner' : 'Trainer Faculty')}
            </span>
            <span className="text-zinc-500 hidden sm:inline font-mono">
              {user?.studentId ? `(${user.studentId})` : currentRole === ROLES.STUDENT ? '(Candidate)' : '(Trainer)'}
            </span>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-950/40 hover:bg-red-900/80 border border-red-800/70 transition"
            title="Sign out of account"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Bottom Sub-Navigation: Portal Tabs */}
      {tabs.length > 0 && (
        <div className="border-t border-zinc-800/60 bg-zinc-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-1.5 no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-700 text-zinc-200 font-normal">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
