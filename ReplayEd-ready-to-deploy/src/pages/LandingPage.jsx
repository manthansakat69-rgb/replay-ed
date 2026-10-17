"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Play,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Star,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Code2,
  Cpu,
  Fingerprint,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../config/mockUsers";

/**
 * ReplayEd Landing Page
 *
 * Exact spotlight crowd video hero + Google Fonts (Archivo Black, Bricolage Grotesque, DM Sans)
 * Connected interactive portals (Student, Trainer, Admin, Auth)
 * Engineering Core Team:
 *  - Er. Vaibhavi Gulhane (Lead AI Architect & Full-Stack Systems Lead)
 *  - Er. Soham Gadhave (Cloud Infrastructure & Kernel Security Lead)
 *  - Er. Pranjali Gaikwad (ML Systems & NLP Viva Voce Specialist)
 *  - Er. Gandharva Kolhe (Keystroke Forensics & Real-Time Telemetry Lead)
 * High-fidelity Dark Footer with Interactive Stay-Informed Newsletter & Social Links
 */

const VW = 1280; // crowd-loop.mp4 size
const VH = 414;

// [seconds, x, y] of each phone-holder's face in the 1280x414 clip
const TRACKS = {
  A: [
    [0.0, 266, 271], [0.1, 264, 271], [0.2, 260, 271], [0.3, 255, 271], [0.4, 251, 272],
    [0.5, 246, 273], [0.6, 242, 274], [0.7, 238, 276], [0.8, 233, 278], [0.9, 229, 281],
    [1.0, 222, 278], [1.1, 222, 278], [1.2, 218, 276], [1.3, 213, 274], [1.4, 209, 273],
    [1.5, 205, 272], [1.6, 200, 271], [1.7, 193, 270], [1.8, 189, 270], [1.9, 184, 270],
    [2.0, 180, 270], [2.1, 175, 271], [2.2, 168, 273], [2.3, 168, 273], [2.4, 164, 274],
    [2.5, 159, 276], [2.6, 155, 278], [2.7, 150, 279], [2.8, 146, 277], [2.9, 141, 275],
    [3.0, 137, 273], [3.1, 132, 272], [3.2, 128, 271], [3.3, 121, 270], [3.4, 116, 270],
    [3.5, 112, 270], [3.6, 107, 270], [3.7, 103, 270], [3.8, 98, 271], [3.9, 94, 272],
    [4.0, 90, 273], [4.1, 90, 273]
  ],
  B: [
    [0.0, 1115, 286], [0.1, 1116, 286], [0.2, 1119, 287], [0.3, 1122, 288], [0.4, 1125, 290],
    [0.5, 1128, 291], [0.6, 1131, 290], [0.7, 1134, 288], [0.8, 1137, 287], [0.9, 1140, 286],
    [1.0, 1145, 284], [1.1, 1145, 284], [1.2, 1148, 283], [1.3, 1151, 282], [1.4, 1154, 282],
    [1.5, 1157, 282], [1.6, 1160, 282], [1.7, 1165, 282], [1.8, 1168, 282], [1.9, 1171, 282],
    [2.0, 1174, 282], [2.1, 1177, 282], [2.2, 1182, 283], [2.3, 1182, 283], [2.4, 1185, 284],
    [2.5, 1188, 285], [2.6, 1191, 286], [2.7, 1194, 287], [2.8, 1197, 288], [2.9, 1200, 290],
    [3.0, 1203, 291], [3.1, 1206, 289], [3.2, 1209, 288], [3.3, 1214, 286], [3.4, 1217, 285],
    [3.5, 1220, 284], [3.6, 1223, 283], [3.7, 1226, 282], [3.8, 1229, 282], [3.9, 1232, 282],
    [4.0, 1233, 282], [4.1, 1233, 282]
  ]
};
const END = TRACKS.A[TRACKS.A.length - 1][0];

const at = (track, t) => {
  if (t <= track[0][0]) return track[0];
  for (let i = 1; i < track.length; i++) {
    if (t <= track[i][0]) {
      const a = track[i - 1];
      const b = track[i];
      const k = (t - a[0]) / (b[0] - a[0]);
      return [t, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    }
  }
  return track[track.length - 1];
};

const ease = (x) => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
};

export default function ReplayedLanding({
  videoSrc = "./crowd-loop.mp4",
  studentHref = "/login/student",
  teacherHref = "/login/teacher",
} = {}) {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();

  const videoRef = useRef(null);
  const crowdRef = useRef(null);
  const litRef = useRef(null);
  const coneRef = useRef(null);
  const poolRef = useRef(null);
  const lampRef = useRef(null);
  const brandRef = useRef(null);
  const tagRef = useRef(null);
  const loginsRef = useRef(null);

  // Newsletter state
  const [emailSub, setEmailSub] = useState("");
  const [subSuccess, setSubSuccess] = useState(false);

  // Engineer consult / contact modal state
  const [consultModal, setConsultModal] = useState(null);

  // Navigation Handlers connecting all platform modules
  const handleGoStudent = () => {
    demoLogin(ROLES.STUDENT);
    navigate("/student");
  };

  const handleGoTeacher = () => {
    demoLogin(ROLES.TEACHER);
    navigate("/teacher");
  };

  const handleGoAdmin = () => {
    demoLogin(ROLES.ADMIN);
    navigate("/admin");
  };

  const handleGoLogin = (role = "student") => {
    navigate(`/login/${role}?mode=signin`);
  };

  const handleGoSignIn = (role = "student") => {
    navigate(`/login/${role}?mode=signin`);
  };

  const handleGoRegister = (role = "student") => {
    navigate(`/login/${role}?mode=register`);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailSub.trim() && emailSub.includes("@")) {
      setSubSuccess(true);
      setTimeout(() => {
        setEmailSub("");
        setSubSuccess(false);
      }, 4000);
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    const crowd = crowdRef.current;
    if (!v || !crowd) return;

    let hero = null;
    let pan = 0.5;
    let prevT = 0;
    let brandDone = false;
    let raf = 0;
    const timers = [];

    const metrics = () => {
      const r = crowd.getBoundingClientRect();
      const s = Math.max(r.width / VW, r.height / VH);
      return { r, s, slack: r.width - VW * s };
    };

    const chooseHero = () => {
      hero = Math.random() < 0.5 ? "A" : "B";
      const m = metrics();
      const tr = TRACKS[hero];
      const mid = tr[Math.floor(tr.length / 2)][1];
      pan = m.slack === 0 ? 0.5 : Math.max(0, Math.min(1, (m.r.width / 2 - mid * m.s) / m.slack));
      v.style.objectPosition = `${pan * 100}% 100%`;
    };

    const revealBrandAndLogins = () => {
      if (!brandDone) {
        brandDone = true;
        timers.push(
          setTimeout(() => {
            brandRef.current?.classList.add("on");
            tagRef.current?.classList.add("on");
          }, 150)
        );
        timers.push(
          setTimeout(() => {
            loginsRef.current?.classList.add("on");
          }, 400)
        );
      }
    };

    const frame = () => {
      const t = v.currentTime;
      if (t < prevT - 0.5 || hero === null) chooseHero();
      prevT = t;
      const a = ease((t - 0.15) / 0.7) * (1 - ease((t - (END - 0.7)) / 0.65));

      if (!v.paused && a > 0.01 && hero) {
        const m = metrics();
        const p = at(TRACKS[hero], t);
        const s = m.s;
        const x = m.r.left + m.slack * pan + p[1] * s;
        const y = m.r.top + (m.r.height - VH * s) + p[2] * s;
        const cw = Math.max(120, 230 * s);
        const pw = 150 * s;
        const ph = 235 * s;
        const cone = coneRef.current;
        const pool = poolRef.current;
        const lamp = lampRef.current;
        if (cone && pool && lamp) {
          cone.style.left = `${x - cw / 2}px`;
          cone.style.width = `${cw}px`;
          cone.style.height = `${Math.max(40, y - 125 * s)}px`;
          pool.style.left = `${x - pw / 2}px`;
          pool.style.width = `${pw}px`;
          pool.style.height = `${ph}px`;
          pool.style.top = `${y - ph / 2 - 5 * s}px`;
          lamp.style.left = `${x - 35}px`;
        }
        if (a > 0.6 && !brandDone) {
          brandDone = true;
          timers.push(
            setTimeout(() => {
              brandRef.current?.classList.add("on");
              tagRef.current?.classList.add("on");
            }, 600)
          );
          timers.push(setTimeout(() => loginsRef.current?.classList.add("on"), 1400));
        }
      }
      if (litRef.current) litRef.current.style.opacity = String(a);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      v.play().catch(() => {});
    };
    const onPause = () => {
      if (!document.hidden) start();
    };
    const onVis = () => {
      if (!document.hidden) start();
    };
    const onResize = () => {
      if (hero) chooseHero();
    };
    const onError = () => {
      revealBrandAndLogins();
    };

    // Auto-reveal fallback ensures UI never stays blank even without media autoplay
    const fallbackTimer = setTimeout(() => {
      revealBrandAndLogins();
    }, 1000);
    timers.push(fallbackTimer);

    v.addEventListener("pause", onPause);
    v.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    start();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="landing-root min-h-screen w-full bg-[#f6f6f6] text-[#0d0d0d] flex flex-col justify-between overflow-x-hidden selection:bg-zinc-800 selection:text-white">
      {/* Google Fonts imported as requested */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@500;600&display=swap');

        :root {
          --bg: #f6f6f6;
          --ink: #0d0d0d;
          --lamp: 255, 205, 70;
          --accent: #f59e0b;
          --display: "Bricolage Grotesque", "Arial Black", system-ui, sans-serif;
          --punch: "Archivo Black", Impact, "Arial Black", system-ui, sans-serif;
          --body: "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
        }

        .hero-scene {
          position: relative;
          min-height: 88vh;
          width: 100%;
          overflow: hidden;
          background: var(--bg);
        }

        .crowd-container {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: min(48vh, calc(100vw * 414 / 1280 * 1.1));
          min-height: 230px;
          -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 14%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 14%);
          pointer-events: none;
          z-index: 2;
        }

        .crowd-container video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 100%;
          display: block;
        }

        .lit-layer {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
          z-index: 3;
        }

        .lamp-elem {
          position: absolute;
          top: 0;
          width: 70px;
          height: 14px;
          border-radius: 0 0 14px 14px;
          background: var(--ink);
          z-index: 5;
        }

        .lamp-elem::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -4px;
          width: 26px;
          height: 6px;
          margin-left: -13px;
          border-radius: 50%;
          background: rgb(var(--lamp));
          filter: blur(2px);
        }

        .cone-elem, .pool-elem {
          position: absolute;
          mix-blend-mode: multiply;
          z-index: 3;
        }

        .cone-elem {
          top: 0;
          clip-path: polygon(44% 0, 56% 0, 100% 100%, 0 100%);
          background: linear-gradient(to bottom, rgba(var(--lamp), .9), rgba(var(--lamp), .6) 60%, rgba(var(--lamp), .35));
          filter: blur(2px);
        }

        .pool-elem {
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(var(--lamp), .95) 0, rgba(var(--lamp), .8) 42%, rgba(var(--lamp), 0) 70%);
        }

        .top-content {
          position: relative;
          padding-top: max(4.5vh, 28px);
          padding-inline: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          z-index: 10;
        }

        .brand-box {
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0;
          transform: translateY(-14px) scale(.92);
          transition: opacity 1s, transform 1s;
        }
        .brand-box.on { opacity: 1; transform: none; }

        .mark-box {
          width: 52px;
          height: 52px;
          border-radius: 15px;
          background: var(--ink);
          display: grid;
          place-items: center;
          box-shadow: 0 10px 24px rgba(0,0,0,.2);
        }
        .mark-box svg { width: 29px; height: 29px; color: #fff; }

        .name-box {
          font-family: var(--display);
          font-weight: 800;
          font-size: clamp(1.9rem, 5vw, 2.6rem);
          letter-spacing: -.03em;
          line-height: 1;
          color: var(--ink);
        }

        .tag-headline {
          font-family: var(--punch);
          font-weight: 400;
          font-synthesis: none;
          text-transform: uppercase;
          font-size: clamp(2.2rem, min(5vw, 8vh), 3.8rem);
          line-height: .98;
          letter-spacing: -.02em;
          color: var(--ink);
          max-width: 20ch;
          text-wrap: balance;
          opacity: 0;
          transform: scale(.96);
          transition: opacity 1s .3s, transform 1s .3s;
        }
        .tag-headline.on { opacity: 1; transform: none; }
        .tag-headline .u { text-decoration: underline; text-decoration-thickness: .09em; text-underline-offset: .08em; }
        .tag-headline .hl { background: linear-gradient(transparent 52%, rgb(var(--lamp)) 52%, rgb(var(--lamp)) 94%, transparent 94%); padding: 0 .06em; }

        .logins-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 1s, transform 1s;
          visibility: hidden;
        }
        .logins-container.on {
          opacity: 1;
          transform: none;
          visibility: visible;
          pointer-events: auto;
        }

        .custom-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 13px 28px;
          border-radius: 999px;
          font-family: var(--body);
          font-weight: 600;
          font-size: .92rem;
          text-decoration: none;
          border: 1.5px solid var(--ink);
          transition: transform .2s, box-shadow .2s;
          cursor: pointer;
        }
        .custom-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 18px rgba(0,0,0,.18);
        }
        .custom-btn:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }
        .custom-btn.dark { background: var(--ink); color: #fff; }
        .custom-btn.light { background: #fff; color: var(--ink); }

        @media (prefers-reduced-motion: reduce) {
          .brand-box, .logins-container, .tag-headline { transition-duration: .01s; }
        }
      `}</style>

      {/* ========================================================
          GLOBAL NAVBAR: Connects ALL pages together
          ======================================================== */}
      <header className="relative z-30 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Tag */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d0d0d] shadow-sm group-hover:scale-105 transition-transform">
              <RotateCcw className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-zinc-950 block leading-tight">
                ReplayEd
              </span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block -mt-0.5">
                Interactive Coding &amp; Continuous Telemetry
              </span>
            </div>
          </div>

          {/* Sign In, Register & Direct Student Dashboard Navigation */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleGoStudent}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition shadow-xs cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Student Dashboard</span>
            </button>

            <button
              onClick={() => handleGoSignIn("student")}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition cursor-pointer"
            >
              Sign In
            </button>

            <button
              onClick={() => handleGoRegister("student")}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              <span>Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </nav>
        </div>
      </header>

      {/* ========================================================
          HERO SCENE: Exact Crowd Video Loop + Animated Spotlight
          ======================================================== */}
      <section className="hero-scene">
        {/* crowd video loops at bottom */}
        <div ref={crowdRef} className="crowd-container">
          <video
            ref={videoRef}
            id="v"
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            src={videoSrc}
          />
        </div>

        {/* spotlight that follows one phone-holder */}
        <div ref={litRef} id="lit" className="lit-layer">
          <div ref={lampRef} className="lamp-elem" />
          <div ref={coneRef} className="cone-elem" />
          <div ref={poolRef} className="pool-elem" />
        </div>

        {/* logo + huge tagline + logins sitting above the crowd */}
        <div className="top-content">
          <div ref={brandRef} className="brand-box">
            <div className="mark-box">
              <RotateCcw className="w-7 h-7" />
            </div>
            <div className="name-box">ReplayEd</div>
          </div>

          <h1 ref={tagRef} className="tag-headline">
            Don&apos;t be ordinary with other apps. Use{" "}
            <span className="u">ReplayEd</span> and be{" "}
            <span className="hl">extraordinary.</span>
          </h1>

          <div ref={loginsRef} className="logins-container">
            <button
              onClick={handleGoStudent}
              className="custom-btn"
              style={{ background: "#2563eb", color: "#ffffff", borderColor: "#1d4ed8" }}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Open Student Dashboard</span>
            </button>

            <button
              onClick={() => handleGoSignIn("student")}
              className="custom-btn dark"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => handleGoRegister("student")}
              className="custom-btn light"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          PORTAL NAVIGATION TILES: Instant One-Click Access
          ======================================================== */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-950 tracking-tight">
              Interactive Application Portals
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Seamlessly navigate across all 4 operational modules of ReplayEd.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Online
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Student Portal Tile */}
          <div
            onClick={handleGoStudent}
            className="p-5 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span>Student Assessment</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mt-2">
                Adaptive Java OOP curriculum, Monaco code editor, gaze calibration, and live camera verification.
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-900 mt-4 inline-flex items-center gap-1 group-hover:underline">
              Enter Student Portal →
            </span>
          </div>

          {/* 2. Trainer Console Tile */}
          <div
            onClick={handleGoTeacher}
            className="p-5 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span>Trainer Console</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mt-2">
                Keystroke telemetry replay, integrity look-away signal inspection, and viva explanation evaluation.
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-900 mt-4 inline-flex items-center gap-1 group-hover:underline">
              Open Trainer Console →
            </span>
          </div>

          {/* 3. Admin Console Tile */}
          <div
            onClick={handleGoAdmin}
            className="p-5 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Institutional Admin</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mt-2">
                Cluster health, student cohort management, course prerequisites, and audit security telemetry.
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-900 mt-4 inline-flex items-center gap-1 group-hover:underline">
              Open Admin Dashboard →
            </span>
          </div>

          {/* 4. Login & Authentication Tile */}
          <div
            onClick={() => handleGoLogin("student")}
            className="p-5 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <span>Unified Auth &amp; Login</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mt-2">
                WiFi connectivity verification, strict @gmail.com validation, and password strength evaluation.
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-900 mt-4 inline-flex items-center gap-1 group-hover:underline">
              Go to Authentication →
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          ENGINEERING & ARCHITECTURE BOARD
          (Updated: "Er." titles, Software Engineering experience, Tech developer portraits)
          ======================================================== */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-200 text-zinc-800 inline-block mb-2">
            Engineering &amp; Architecture Board
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Meet the Engineers Behind ReplayEd
          </h2>
          <p className="text-sm text-zinc-600 mt-2">
            Pioneering adaptive AI, sandboxed security kernels, and forensic keystroke telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Engineer 1: Er. Vaibhavi Gulhane */}
          <div className="bg-white rounded-3xl overflow-hidden border border-zinc-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-56 w-full overflow-hidden bg-zinc-100 relative">
                <img
                  src="./team-vaibhavi.jpg"
                  alt="Er. Vaibhavi Gulhane"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
                  Lead AI Architect &amp; Systems Lead
                </span>
                <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                  Er. Vaibhavi Gulhane
                </h3>
                <p className="text-xs font-semibold text-zinc-500">6+ Years Experience</p>

                {/* Rating */}
                <div className="flex items-center gap-1 my-2.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-zinc-800 ml-1">5.0 (240 Reviews)</span>
                </div>

                <p className="text-xs italic text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  &ldquo;Spearheaded ReplayEd&apos;s cognitive adaptive learning engine, dynamic OOP knowledge tracking, and student concept mastery pipelines.&rdquo;
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => setConsultModal("Er. Vaibhavi Gulhane")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Connect Profile</span>
              </button>
            </div>
          </div>

          {/* Engineer 2: Er. Soham Gadhave */}
          <div className="bg-white rounded-3xl overflow-hidden border border-zinc-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-56 w-full overflow-hidden bg-zinc-100 relative">
                <img
                  src="./team-soham.jpg"
                  alt="Er. Soham Gadhave"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
                  Cloud Infrastructure &amp; Security Lead
                </span>
                <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                  Er. Soham Gadhave
                </h3>
                <p className="text-xs font-semibold text-zinc-500">5+ Years Experience</p>

                {/* Rating */}
                <div className="flex items-center gap-1 my-2.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-zinc-800 ml-1">4.9 (185 Reviews)</span>
                </div>

                <p className="text-xs italic text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  &ldquo;Engineered the low-latency 512MB RAM isolated sandboxed execution environment and multi-container cluster security.&rdquo;
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => setConsultModal("Er. Soham Gadhave")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Connect Profile</span>
              </button>
            </div>
          </div>

          {/* Engineer 3: Er. Pranjali Gaikwad */}
          <div className="bg-white rounded-3xl overflow-hidden border border-zinc-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-56 w-full overflow-hidden bg-zinc-100 relative">
                <img
                  src="./team-pranjali.jpg"
                  alt="Er. Pranjali Gaikwad"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-50 text-pink-700 border border-pink-200 mb-2">
                  ML Systems &amp; NLP Viva Specialist
                </span>
                <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                  Er. Pranjali Gaikwad
                </h3>
                <p className="text-xs font-semibold text-zinc-500">5+ Years Experience</p>

                {/* Rating */}
                <div className="flex items-center gap-1 my-2.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-zinc-800 ml-1">4.9 (156 Reviews)</span>
                </div>

                <p className="text-xs italic text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  &ldquo;Architected the multi-modal AI Viva Voce model analyzing semantic syntax trees, code explanation depth, and conceptual clarity.&rdquo;
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => setConsultModal("Er. Pranjali Gaikwad")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Connect Profile</span>
              </button>
            </div>
          </div>

          {/* Engineer 4: Er. Gandharva Kolhe */}
          <div className="bg-white rounded-3xl overflow-hidden border border-zinc-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-56 w-full overflow-hidden bg-zinc-100 relative">
                <img
                  src="./team-gandharva.jpg"
                  alt="Er. Gandharva Kolhe"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                  Keystroke Forensics &amp; Real-Time Telemetry
                </span>
                <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                  Er. Gandharva Kolhe
                </h3>
                <p className="text-xs font-semibold text-zinc-500">4+ Years Experience</p>

                {/* Rating */}
                <div className="flex items-center gap-1 my-2.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-zinc-800 ml-1">4.8 (170 Reviews)</span>
                </div>

                <p className="text-xs italic text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  &ldquo;Designed the sub-millisecond keystroke event streaming pipeline, anti-cheating heuristic monitors, and real-time proctoring telemetry.&rdquo;
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => setConsultModal("Er. Gandharva Kolhe")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Connect Profile</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          DARK FOOTER (High-Fidelity Engineering & Tech Footer)
          ======================================================== */}
      <footer className="w-full bg-[#0d1627] text-white pt-14 pb-8 px-4 sm:px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-zinc-800/80">
          {/* Brand & Description */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <RotateCcw className="h-6 w-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                ReplayEd
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-5 max-w-sm">
              ReplayEd is revolutionizing interactive coding assessment.
              Connect with leading software architects, track adaptive mastery, replay keystroke telemetry, and verify student integrity on demand.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              <a
                href="#github"
                onClick={(e) => {
                  e.preventDefault();
                  window.open("https://github.com/manthansakat69-rgb/ReplayEd", "_blank");
                }}
                className="w-8 h-8 rounded-full bg-zinc-800/90 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition"
                aria-label="GitHub"
              >
                <span className="text-xs font-bold">git</span>
              </a>
              <a
                href="#twitter"
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-full bg-zinc-800/90 hover:bg-blue-400 flex items-center justify-center text-zinc-300 hover:text-white transition"
                aria-label="Twitter"
              >
                <span className="text-xs font-bold">t</span>
              </a>
              <a
                href="#linkedin"
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-full bg-zinc-800/90 hover:bg-blue-600 flex items-center justify-center text-zinc-300 hover:text-white transition"
                aria-label="LinkedIn"
              >
                <span className="text-xs font-bold">in</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-white transition text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={handleGoStudent}
                  className="hover:text-white transition text-left"
                >
                  Student Assessment Portal
                </button>
              </li>
              <li>
                <button
                  onClick={handleGoTeacher}
                  className="hover:text-white transition text-left"
                >
                  Trainer Replay Console
                </button>
              </li>
              <li>
                <button
                  onClick={handleGoAdmin}
                  className="hover:text-white transition text-left"
                >
                  Institutional Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleGoLogin("student")}
                  className="hover:text-white transition text-left"
                >
                  Unified Auth &amp; Login
                </button>
              </li>
              <li>
                <button
                  onClick={handleGoStudent}
                  className="hover:text-white transition text-left"
                >
                  Instant Sandbox Demo
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact &amp; Support
            </h3>
            <ul className="space-y-3 text-xs text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>100 EduTech Innovation Way, CA 94107</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>+1 (800) 555-REPLAY (7375)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>support@replayed.edu</span>
              </li>
            </ul>
          </div>

          {/* Stay Informed Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Stay Informed
            </h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Subscribe for updates on automated grading, telemetry AI, and new sandbox features.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <input
                type="email"
                required
                value={emailSub}
                onChange={(e) => setEmailSub(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </button>
              {subSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Subscribed successfully! Thank you.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>&copy; {new Date().getFullYear()} ReplayEd Engineering Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition cursor-pointer">Academic Integrity Compliance</span>
          </div>
        </div>
      </footer>

      {/* Floating Chat / Support Badge */}
      <div
        onClick={() => setConsultModal("ReplayEd Engineering Support")}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
        title="Live Engineering Chat"
      >
        <MessageSquare className="w-5 h-5" />
      </div>

      {/* Engineer Contact Modal */}
      {consultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-zinc-200 shadow-2xl text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-950 mb-1">
              Engineering Profile Connected
            </h3>
            <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
              Your connection request with <strong className="text-zinc-900">{consultModal}</strong> has been logged in the ReplayEd Developer &amp; Architecture Network.
            </p>
            <button
              onClick={() => setConsultModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#0d0d0d] text-white text-xs font-bold hover:bg-zinc-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
