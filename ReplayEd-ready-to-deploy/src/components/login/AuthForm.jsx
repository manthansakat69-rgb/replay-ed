import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Wifi, WifiOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { login, register } from '../../services/api';
import { STUDENT_BATCHES, MOCK_USERS_MAP, ROLES } from '../../config/mockUsers';

export default function AuthForm({ activeRole }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { loginUser, demoLogin } = useAuth();

  // Mode: 'signin' | 'register' (connected to landing page query param)
  const resolveInitialMode = () => {
    const qMode = searchParams.get('mode') || location.state?.mode;
    if (qMode === 'register' || qMode === 'signup' || qMode === 'create') return 'register';
    return 'signin';
  };

  const [mode, setMode] = useState(resolveInitialMode);

  useEffect(() => {
    const qMode = searchParams.get('mode') || location.state?.mode;
    if (qMode === 'register' || qMode === 'signup' || qMode === 'create') {
      setMode('register');
    } else if (qMode === 'signin' || qMode === 'login') {
      setMode('signin');
    }
  }, [searchParams, location.state]);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [batch, setBatch] = useState(STUDENT_BATCHES[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'apple' | null
  const [errors, setErrors] = useState({});
  const [generalNotice, setGeneralNotice] = useState('');

  // Live WiFi & Network Connectivity Detection
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [wifiNotice, setWifiNotice] = useState('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWifiNotice('WiFi / Network reconnected. You are online.');
      setTimeout(() => setWifiNotice(''), 3500);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setWifiNotice('WiFi disconnected. An active internet connection is required.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isStudent = activeRole === ROLES.STUDENT;

  // Strong Email Validation Helper
  const validateEmail = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      return { valid: false, message: 'Email address is required' };
    }
    if (/\s/.test(trimmed)) {
      return { valid: false, message: 'Email address cannot contain spaces' };
    }
    if (!trimmed.includes('@')) {
      return {
        valid: false,
        message: 'Email must contain @ and a domain (e.g. yourname@gmail.com)',
      };
    }
    const parts = trimmed.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return {
        valid: false,
        message: 'Invalid email format. Format: username@gmail.com',
      };
    }
    const [userPart, domainPart] = parts;
    if (userPart.length < 3) {
      return { valid: false, message: 'Email username prefix must be at least 3 characters' };
    }
    if (!domainPart.includes('.')) {
      return {
        valid: false,
        message: `Incomplete domain "@${domainPart}". Example: yourname@gmail.com`,
      };
    }
    const domainParts = domainPart.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2) {
      return { valid: false, message: 'Invalid top-level domain. Example: @gmail.com' };
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(trimmed)) {
      return {
        valid: false,
        message: 'Please enter a valid email address (e.g. yourname@gmail.com)',
      };
    }

    return { valid: true, message: '' };
  };

  // Password Strength Calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-zinc-700', text: 'text-zinc-500' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-400', text: 'text-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    // 1. WiFi & Network Connectivity Check
    if (!navigator.onLine) {
      newErrors.form = 'No WiFi or Internet connection detected. Please connect to WiFi/Internet to log in.';
    }

    // 2. Strong Email Validation
    const emailResult = validateEmail(emailOrUsername);
    if (!emailResult.valid) {
      newErrors.emailOrUsername = emailResult.message;
    }

    // 3. Password Validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters (8+ recommended)';
    }

    // 4. Register Mode Fields
    if (mode === 'register') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      } else if (fullName.trim().length < 3) {
        newErrors.fullName = 'Please enter your full name (minimum 3 characters)';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralNotice('');

    // Strict WiFi Connection Check
    if (!navigator.onLine) {
      setErrors({
        form: 'Network Error: WiFi / Internet is offline. Please check your WiFi connection and try again.',
      });
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'signin') {
        const res = await login({
          email: emailOrUsername,
          password,
          role: activeRole,
        });
        loginUser(res.user);
      } else {
        const res = await register({
          name: fullName,
          email: emailOrUsername,
          studentId: isStudent ? studentId : undefined,
          password,
          role: activeRole,
          batch: isStudent ? batch : undefined,
        });
        loginUser(res.user);
      }

      navigate(`/${activeRole}`);
    } catch (err) {
      setErrors({ form: err.message || 'Authentication failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Access (with strict WiFi verification)
  const handleDemoAccess = () => {
    if (!navigator.onLine) {
      setErrors({
        form: 'Network Error: WiFi / Internet is offline. You cannot access accounts without an active WiFi connection.',
      });
      return;
    }
    demoLogin(activeRole);
    navigate(`/${activeRole}`);
  };

  // Social Sign-In Handler (Google / Apple ID with strict WiFi verification)
  const handleSocialAuth = async (provider) => {
    if (!navigator.onLine) {
      setErrors({
        form: 'Network Error: WiFi / Internet is offline. Google and Apple sign-in require an active WiFi connection.',
      });
      return;
    }
    setSocialLoading(provider);
    await new Promise((resolve) => setTimeout(resolve, 400));
    demoLogin(activeRole);
    setSocialLoading(null);
    navigate(`/${activeRole}`);
  };

  // Fill sample mock user credentials for testing
  const handleQuickFill = () => {
    const mock = MOCK_USERS_MAP[activeRole];
    if (mock) {
      setEmailOrUsername(mock.email || 'vaibhavi.gulhane@gmail.com');
      setPassword('password123');
      setErrors({});
    }
  };

  // Dynamic button labels
  const getButtonText = () => {
    if (loading) return 'Authenticating...';
    const roleCapitalized = activeRole.charAt(0).toUpperCase() + activeRole.slice(1);
    return mode === 'signin'
      ? `Sign In to ${roleCapitalized} Portal`
      : `Create ${roleCapitalized} Account`;
  };

  return (
    <div className="w-full mt-4">
      {/* 1-Click Instant Access to Student Dashboard Banner */}
      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <span>Student Dashboard</span>
              <span className="text-[9px] font-bold bg-amber-400 text-zinc-950 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                Instant
              </span>
            </div>
            <div className="text-[10px] text-blue-100 font-medium">
              Open directly without typing credentials
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            demoLogin(ROLES.STUDENT);
            navigate('/student');
          }}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-black transition shadow-sm cursor-pointer hover:scale-105 active:scale-95"
        >
          Open Dashboard →
        </button>
      </div>

      {/* Tabs: Sign In / Create Account */}
      <div className="flex border-b border-zinc-200 mb-3.5">
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrors({});
          }}
          className={`relative pb-2.5 text-xs sm:text-sm font-semibold transition-colors duration-150 flex-1 text-center ${
            mode === 'signin' ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Sign In
          {mode === 'signin' && (
            <motion.div
              layoutId="authTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-zinc-950 rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrors({});
          }}
          className={`relative pb-2.5 text-xs sm:text-sm font-semibold transition-colors duration-150 flex-1 text-center ${
            mode === 'register' ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Create Account
          {mode === 'register' && (
            <motion.div
              layoutId="authTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-zinc-950 rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      </div>

      {/* Live WiFi & Network Connectivity Bar */}
      <div
        className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold border mb-3 transition-all ${
          isOnline
            ? 'bg-zinc-900/80 border-zinc-700 text-zinc-200'
            : 'bg-rose-950/80 border-rose-700 text-rose-200 animate-pulse'
        }`}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span>
            {isOnline ? 'Network: WiFi Connected & Online' : 'No WiFi / Internet Disconnected'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="text-[10px] font-mono text-zinc-400 uppercase">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {wifiNotice && (
        <div className="mb-3 rounded-lg bg-zinc-800 p-2 text-xs text-zinc-200 border border-zinc-700">
          {wifiNotice}
        </div>
      )}

      {generalNotice && (
        <div className="mb-3 rounded-lg bg-zinc-100 p-2 text-xs text-zinc-700 border border-zinc-200">
          {generalNotice}
        </div>
      )}

      {errors.form && (
        <div className="mb-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-800 border border-rose-300 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* Registration Extra Fields */}
        <AnimatePresence initial={false}>
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2.5 overflow-hidden"
            >
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vaibhavi Gulhane"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: null });
                  }}
                  className={`w-full rounded-xl border bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 transition duration-150 focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800 ${
                    errors.fullName ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-300'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-0.5 text-[10px] text-zinc-700 font-medium">{errors.fullName}</p>
                )}
              </div>

              {/* Student ID field during registration (if student) */}
              {isStudent && (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                    Student ID (Assigned by Institute)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. STU-2026-042"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 transition duration-150 focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800"
                  />
                </div>
              )}

              {/* Batch Dropdown (Only for Student) */}
              {isStudent && (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                    Assigned Cohort / Batch
                  </label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 transition duration-150 focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800"
                  >
                    {STUDENT_BATCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Address with Strong @gmail.com & Domain Validation */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Email Address (Domain Required: @gmail.com)
            </label>
            <div className="flex items-center gap-1.5">
              {!emailOrUsername.includes('@') && emailOrUsername.trim().length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setEmailOrUsername((prev) => `${prev.trim()}@gmail.com`);
                    if (errors.emailOrUsername) setErrors({ ...errors, emailOrUsername: null });
                  }}
                  className="text-[10px] font-bold text-zinc-800 hover:text-black bg-zinc-200 hover:bg-zinc-300 px-2 py-0.5 rounded-md border border-zinc-300 transition shadow-xs"
                  title="Click to append @gmail.com"
                >
                  + @gmail.com
                </button>
              )}
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[10px] text-zinc-500 hover:text-zinc-900 underline underline-offset-2 transition-colors"
                  title="Fill sample demo credentials"
                >
                  Auto-fill sample
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              type="email"
              placeholder="e.g. yourname@gmail.com"
              value={emailOrUsername}
              onChange={(e) => {
                setEmailOrUsername(e.target.value);
                if (errors.emailOrUsername) setErrors({ ...errors, emailOrUsername: null });
              }}
              className={`w-full rounded-xl border bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 transition duration-150 focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800 ${
                errors.emailOrUsername
                  ? 'border-rose-600 ring-1 ring-rose-600'
                  : validateEmail(emailOrUsername).valid
                  ? 'border-emerald-600'
                  : 'border-zinc-300'
              }`}
            />
            {validateEmail(emailOrUsername).valid && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            )}
          </div>

          {errors.emailOrUsername ? (
            <p className="mt-1 text-[10px] text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.emailOrUsername}</span>
            </p>
          ) : validateEmail(emailOrUsername).valid ? (
            <p className="mt-0.5 text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>Valid email format verified (@gmail.com / domain valid)</span>
            </p>
          ) : (
            <p className="mt-0.5 text-[10px] text-zinc-400">
              Must include valid domain format like <span className="font-semibold text-zinc-600">@gmail.com</span> or educational email.
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Password
            </label>
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() =>
                  setGeneralNotice('Password recovery link has been dispatched to your institution admin.')
                }
                className="text-[11px] font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              className={`w-full rounded-xl border bg-white pl-3 pr-9 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 transition duration-150 focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800 ${
                errors.password ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-300'
              }`}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Dynamic Password Strength Indicator */}
          {password && (
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-500 font-medium">Password Strength:</span>
                <span className={`font-bold ${getPasswordStrength(password).text}`}>
                  {getPasswordStrength(password).label}
                </span>
              </div>
              <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden flex gap-1">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    getPasswordStrength(password).color
                  }`}
                  style={{
                    width:
                      getPasswordStrength(password).score === 1
                        ? '33%'
                        : getPasswordStrength(password).score === 2
                        ? '66%'
                        : '100%',
                  }}
                />
              </div>
            </div>
          )}

          {errors.password && (
            <p className="mt-0.5 text-[10px] text-zinc-700 font-medium">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password (Register mode) */}
        {mode === 'register' && (
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
              }}
              className={`w-full rounded-xl border bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 transition duration-150 focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800 ${
                errors.confirmPassword
                  ? 'border-zinc-900 ring-1 ring-zinc-900'
                  : 'border-zinc-300'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-0.5 text-[10px] text-zinc-700 font-medium">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        )}

        {/* Remember Me Checkbox */}
        <div className="flex items-center pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 accent-zinc-900 focus:ring-zinc-800 transition"
            />
            <span className="text-[11px] font-medium text-zinc-600">Remember me</span>
          </label>
        </div>

        {/* Primary Action Button (Strict Black to Dark-Grey Gradient) */}
        <button
          type="submit"
          disabled={loading || !isOnline}
          className={`relative w-full mt-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
            !isOnline
              ? 'bg-zinc-700 cursor-not-allowed opacity-75'
              : 'bg-gradient-to-r from-[#111111] to-[#3f3f46] hover:from-[#1a1a1a] hover:to-[#52525b] hover:shadow-lg active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed'
          }`}
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />}
          {!isOnline && <WifiOff className="w-3.5 h-3.5 text-rose-300" />}
          <span>{!isOnline ? 'WiFi Disconnected — Reconnect to Login' : getButtonText()}</span>
        </button>

        {/* Demo Mode Link */}
        <div className="text-center pt-0.5">
          <button
            type="button"
            onClick={handleDemoAccess}
            className="text-[11px] font-medium text-zinc-500 hover:text-zinc-950 underline underline-offset-4 transition-colors duration-150"
          >
            Demo mode: continue without login
          </button>
        </div>

        {/* ========================================================
            OR CONTINUE WITH: Google and Apple ID (Reference Layout)
            ======================================================== */}
        <div className="pt-1.5">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative bg-white px-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Or continue with
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            {/* Google Button */}
            <button
              type="button"
              disabled={socialLoading !== null}
              onClick={() => handleSocialAuth('google')}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-800 disabled:opacity-70"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
              ) : (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>Google</span>
            </button>

            {/* Apple ID Button */}
            <button
              type="button"
              disabled={socialLoading !== null}
              onClick={() => handleSocialAuth('apple')}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-800 disabled:opacity-70"
            >
              {socialLoading === 'apple' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
              ) : (
                <svg
                  className="w-3.5 h-3.5 shrink-0 fill-current text-zinc-950"
                  viewBox="0 0 170 170"
                >
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.55-8.5-9.98-18.43-13.29-29.77-3.32-11.33-4.98-22.18-4.98-32.54 0-14.4 3.7-26.06 11.1-34.98 7.4-8.93 16.64-13.46 27.73-13.59 4.35 0 9.25 1.16 14.69 3.49 5.44 2.33 9.38 3.55 11.83 3.67 2.11 0 6.13-1.32 12.06-3.95 5.93-2.64 11.13-3.8 15.59-3.5 11.53.53 20.89 4.8 28.09 12.82-10.23 6.17-15.22 14.86-14.98 26.07.24 9.07 3.63 16.67 10.17 22.8 6.53 6.14 14.28 9.53 23.23 10.18-2.39 7.07-5.21 14.36-8.46 21.87zm-27.18-113.88c0 6.07-2.18 11.96-6.53 17.67-5.23 6.84-11.75 10.84-19.57 12-1.08-6.19.78-12.07 5.58-17.65 4.8-5.58 11.08-9.44 18.84-11.58.55-.15 1.11-.27 1.68-.44z" />
                </svg>
              )}
              <span>Apple ID</span>
            </button>
          </div>
        </div>

        {/* Footer Audit / Review Note */}
        <div className="pt-2 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 font-normal">
            Your coding session may be recorded for trainer review.
          </p>
        </div>
      </form>
    </div>
  );
}
