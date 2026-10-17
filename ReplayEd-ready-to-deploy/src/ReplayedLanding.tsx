import { BookOpen, GraduationCap, RotateCcw } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * ReplayEd landing.
 *
 * 1. Put crowd-loop.mp4 in /public
 * 2. Add the tagline font once (layout.tsx or globals.css):
 *      @import url("https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap");
 * 3. <ReplayedLanding />
 *
 * The crowd video loops forever and never pauses. In the slow-motion part of every
 * loop a spotlight follows ONE of the two people who already hold a phone in the video
 * (picked at random each loop). Logo, tagline and logins appear after the first light.
 */

const VW = 1280; // crowd-loop.mp4 size
const VH = 414;

// [seconds, x, y] of each phone-holder's face in the 1280x414 clip (tracked from the video).
const TRACKS: Record<"A" | "B", number[][]> = {"A":[[0.0,266,271],[0.1,264,271],[0.2,260,271],[0.3,255,271],[0.4,251,272],[0.5,246,273],[0.6,242,274],[0.7,238,276],[0.8,233,278],[0.9,229,281],[1.0,222,278],[1.1,222,278],[1.2,218,276],[1.3,213,274],[1.4,209,273],[1.5,205,272],[1.6,200,271],[1.7,193,270],[1.8,189,270],[1.9,184,270],[2.0,180,270],[2.1,175,271],[2.2,168,273],[2.3,168,273],[2.4,164,274],[2.5,159,276],[2.6,155,278],[2.7,150,279],[2.8,146,277],[2.9,141,275],[3.0,137,273],[3.1,132,272],[3.2,128,271],[3.3,121,270],[3.4,116,270],[3.5,112,270],[3.6,107,270],[3.7,103,270],[3.8,98,271],[3.9,94,272],[4.0,90,273],[4.1,90,273]],"B":[[0.0,1115,286],[0.1,1116,286],[0.2,1119,287],[0.3,1122,288],[0.4,1125,290],[0.5,1128,291],[0.6,1131,290],[0.7,1134,288],[0.8,1137,287],[0.9,1140,286],[1.0,1145,284],[1.1,1145,284],[1.2,1148,283],[1.3,1151,282],[1.4,1154,282],[1.5,1157,282],[1.6,1160,282],[1.7,1165,282],[1.8,1168,282],[1.9,1171,282],[2.0,1174,282],[2.1,1177,282],[2.2,1182,283],[2.3,1182,283],[2.4,1185,284],[2.5,1188,285],[2.6,1191,286],[2.7,1194,287],[2.8,1197,288],[2.9,1200,290],[3.0,1203,291],[3.1,1206,289],[3.2,1209,288],[3.3,1214,286],[3.4,1217,285],[3.5,1220,284],[3.6,1223,283],[3.7,1226,282],[3.8,1229,282],[3.9,1232,282],[4.0,1233,282],[4.1,1233,282]]};
const END = TRACKS.A[TRACKS.A.length - 1][0];

const at = (track: number[][], t: number) => {
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
const ease = (x: number) => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
};

type Props = {
  videoSrc?: string;
  studentHref?: string;
  teacherHref?: string;
};

export default function ReplayedLanding({
  videoSrc = `${import.meta.env.BASE_URL}crowd-loop.mp4`,
  studentHref = "/login/student",
  teacherHref = "/login/teacher",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const crowdRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const coneRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<HTMLDivElement>(null);
  const lampRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLHeadingElement>(null);
  const loginsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    const crowd = crowdRef.current;
    if (!v || !crowd) return;

    let hero: "A" | "B" | null = null;
    let pan = 0.5;
    let prevT = 0;
    let brandDone = false;
    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

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
      // on narrow screens the video is cropped: slide it so this person is in view
      pan = m.slack === 0 ? 0.5 : Math.max(0, Math.min(1, (m.r.width / 2 - mid * m.s) / m.slack));
      v.style.objectPosition = `${pan * 100}% 100%`;
    };

    const frame = () => {
      const t = v.currentTime;
      if (t < prevT - 0.5 || hero === null) chooseHero(); // loop restarted
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
              brandRef.current?.classList.add("rp-on");
              tagRef.current?.classList.add("rp-on");
            }, 900),
          );
          timers.push(setTimeout(() => loginsRef.current?.classList.add("rp-on"), 2300));
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
    v.addEventListener("pause", onPause);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    start();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      v.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#f6f6f6] text-[#0d0d0d]">
      <style>{`
        .rp-brand{opacity:0;transform:translateY(-14px) scale(.92);transition:opacity 1s,transform 1s}
        .rp-tag{opacity:0;transform:scale(.96);transition:opacity 1s .3s,transform 1s .3s}
        .rp-logins{opacity:0;transform:translateY(14px);visibility:hidden;transition:opacity 1s,transform 1s}
        .rp-brand.rp-on,.rp-tag.rp-on,.rp-logins.rp-on{opacity:1;transform:none}
        .rp-logins.rp-on{visibility:visible;pointer-events:auto}
      `}</style>

      {/* crowd video: loops by itself, never pauses */}
      <div
        ref={crowdRef}
        className="absolute inset-x-0 bottom-0 min-h-[230px]"
        style={{
          height: "min(46vh, calc(100vw * 414 / 1280 * 1.1))",
          maskImage: "linear-gradient(to bottom, transparent 0, #000 14%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 14%)",
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          style={{ objectPosition: "50% 100%" }}
        />
      </div>

      {/* spotlight that follows one phone-holder */}
      <div ref={litRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
        <div ref={lampRef} className="absolute top-0 z-[3] h-3.5 w-[70px] rounded-b-2xl bg-[#0d0d0d]" />
        <div
          ref={coneRef}
          className="absolute top-0 z-[1]"
          style={{
            clipPath: "polygon(44% 0, 56% 0, 100% 100%, 0 100%)",
            background:
              "linear-gradient(to bottom, rgba(255,205,70,.9), rgba(255,205,70,.6) 60%, rgba(255,205,70,.35))",
            mixBlendMode: "multiply",
            filter: "blur(2px)",
          }}
        />
        <div
          ref={poolRef}
          className="absolute z-[1]"
          style={{
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(255,205,70,.95) 0, rgba(255,205,70,.8) 42%, rgba(255,205,70,0) 70%)",
            mixBlendMode: "multiply",
          }}
        />
      </div>

      {/* logo + huge tagline + logins */}
      <div className="pointer-events-none absolute inset-x-0 top-[4.5vh] z-20 flex flex-col items-center gap-4 px-4 text-center">
        <div ref={brandRef} className="rp-brand flex items-center gap-3">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#0d0d0d] shadow-lg">
            <RotateCcw className="h-7 w-7 text-white" />
          </div>
          <span className="text-[clamp(1.9rem,5vw,2.6rem)] font-extrabold leading-none tracking-tight">ReplayEd</span>
        </div>

        <h1
          ref={tagRef}
          className="rp-tag max-w-[20ch] text-balance uppercase leading-[.98] tracking-[-0.02em]"
          style={{
            fontFamily: '"Archivo Black", Impact, "Arial Black", system-ui, sans-serif',
            fontWeight: 400,
            fontSynthesis: "none",
            fontSize: "clamp(2.3rem, min(5vw, 8vh), 3.9rem)",
          }}
        >
          Don&apos;t be ordinary with other apps. Use{" "}
          <span className="underline decoration-[.09em] underline-offset-[.08em]">ReplayEd</span> and be{" "}
          <span
            className="px-[.06em]"
            style={{
              background:
                "linear-gradient(transparent 52%, rgb(255,205,70) 52%, rgb(255,205,70) 94%, transparent 94%)",
            }}
          >
            extraordinary.
          </span>
        </h1>

        <div ref={loginsRef} className="rp-logins pointer-events-none flex flex-wrap justify-center gap-3">
          <Link
            to={studentHref}
            className="flex items-center gap-2 rounded-full border-[1.5px] border-[#0d0d0d] bg-[#0d0d0d] px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <GraduationCap className="h-4 w-4" /> Student Login
          </Link>
          <Link
            to={teacherHref}
            className="flex items-center gap-2 rounded-full border-[1.5px] border-[#0d0d0d] bg-white px-7 py-3 text-sm font-semibold text-[#0d0d0d] transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <BookOpen className="h-4 w-4" /> Teacher Login
          </Link>
        </div>
      </div>
    </div>
  );
}
