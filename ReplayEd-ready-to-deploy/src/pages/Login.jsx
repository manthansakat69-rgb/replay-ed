import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/login/Logo';
import RoleSwitcher from '../components/login/RoleSwitcher';
import AuthForm from '../components/login/AuthForm';
import GlassInfoCard from '../components/login/GlassInfoCard';
import { ROLES } from '../config/mockUsers';

// Lazy load the 3D Scene for maximum initial load performance
const Scene = lazy(() => import('../components/three/Scene'));

/**
 * Animated CSS Gradient Fallback while 3D Three.js canvas initializes
 */
function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] overflow-hidden pointer-events-none">
      {/* Subtle radial glow */}
      <div className="w-[450px] h-[450px] rounded-full bg-zinc-800/20 blur-[100px] animate-soft-pulse" />
      <div className="absolute text-xs tracking-widest uppercase font-mono text-zinc-600">
        Loading 3D Engine...
      </div>
    </div>
  );
}

/**
 * If the 3D scene fails (no WebGL, blocked network, etc.) show the gradient
 * fallback instead of crashing the whole login page to a blank screen.
 */
class SceneBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return <div className="absolute inset-0 bg-[#0a0a0a]" />;
    }
    return this.props.children;
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { roleParam } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const resolveRole = () => {
    const fromPath = (location.state?.from?.pathname || '').toLowerCase();
    const p = (roleParam || searchParams.get('role') || '').toLowerCase();
    if (p === 'teacher' || p === ROLES.TEACHER || fromPath.includes('teacher')) return ROLES.TEACHER;
    if (p === 'admin' || p === ROLES.ADMIN || fromPath.includes('admin')) return ROLES.ADMIN;
    return ROLES.STUDENT;
  };

  const [activeRole, setActiveRole] = useState(resolveRole);

  useEffect(() => {
    const r = resolveRole();
    if (r) setActiveRole(r);
  }, [roleParam, searchParams, location.state]);

  return (
    <div className="h-screen max-h-screen w-full flex flex-col lg:flex-row bg-[#0a0a0a] overflow-hidden font-sans">
      {/* ========================================================
          LEFT PANEL: Branding + 3D Scene Canvas + Glass Info Card
          ======================================================== */}
      <section
        aria-label="ReplayEd Brand Showcase"
        className="relative hidden lg:flex lg:w-1/2 h-full max-h-screen flex-col justify-between p-8 xl:p-10 overflow-hidden bg-[#0a0a0a] select-none"
      >
        {/* Subtle radial grey gradient glow behind the 3D objects */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(circle at 45% 42%, rgba(255, 255, 255, 0.05) 0%, rgba(10, 10, 10, 0.95) 65%, #0a0a0a 100%)',
          }}
        />

        {/* 3D Scene Layer (Hidden on screens under 1024px for strict performance) */}
        <div className="absolute inset-0 z-[1]">
          <SceneBoundary><Suspense fallback={<SceneFallback />}>
            <Scene />
          </Suspense></SceneBoundary>
        </div>

        {/* Top-Left Branding Overlay */}
        <header className="relative z-10">
          <Logo
            variant="light"
            size="md"
            subtitle="Adaptive Learning Platform"
            className="drop-shadow-sm"
          />
        </header>

        {/* Bottom-Left Glass Info Card Overlay (Elevated with zero overflow) */}
        <footer className="relative z-10 mb-2 xl:mb-4">
          <GlassInfoCard />
        </footer>
      </section>

      {/* ========================================================
          RIGHT PANEL: Light grey backdrop + Centered Login Card
          ======================================================== */}
      <section
        aria-label="User Authentication"
        className="w-full lg:w-1/2 h-full max-h-screen bg-[#f4f4f5] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-6 overflow-y-auto lg:overflow-hidden relative"
      >
        {/* Mobile-only header (shows when left panel is hidden on screens < 1024px) */}
        <div className="lg:hidden w-full max-w-[420px] mb-4 flex items-center justify-between px-1">
          <Logo variant="dark" size="sm" subtitle="Adaptive Learning Platform" />
        </div>

        {/* Centered White Login Card */}
        <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-zinc-200/80 transition-all duration-300">
          {/* Card Header: Logo + ReplayEd + LEARNING SYSTEM + Trainer Verified Pill */}
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-100">
            <Logo variant="dark" size="sm" subtitle="LEARNING SYSTEM" />

            {/* Pill Badge (Replaces "MD / DO Certified") */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-semibold text-zinc-700 tracking-tight shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span>Trainer Verified</span>
            </div>
          </div>

          {/* Segmented User Role Switcher */}
          <RoleSwitcher
            activeRole={activeRole}
            onRoleChange={(role) => setActiveRole(role)}
          />

          {/* Authentication Form with Tabs, Validation, Dynamic Button, Demo Mode */}
          <AuthForm activeRole={activeRole} />
        </div>

        {/* Navigation & Institutional Copyright */}
        <div className="mt-3.5 flex items-center justify-between w-full max-w-[420px] px-2 text-[11px] text-zinc-500">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hover:text-zinc-950 font-semibold transition cursor-pointer flex items-center gap-1"
          >
            ← Back to Landing Page
          </button>
          <span>&copy; {new Date().getFullYear()} ReplayEd Inc.</span>
        </div>
      </section>
    </div>
  );
}
