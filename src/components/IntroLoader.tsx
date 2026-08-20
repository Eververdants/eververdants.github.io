import { useEffect, useState } from "react";

/* First-visit loading cover for the main site — "developing the darkroom".

   Concept: a sheet of photographic paper sits in a darkroom while the site
   name develops letter by letter (blurred negative → crisp, teal-lit print)
   under a travelling scan line. A hairline gradient bar tracks progress with
   darkroom stage captions — DEVELOPING → STOPPING → FIXING → WASHING →
   PRINTING — and the corner registration marks + ambient teal/amber glows
   echo the site's cinematic editorial backdrop (Background.tsx).

   On completion the cover collapses into a circle from the sheet's center —
   the same circular-wipe vocabulary as the theme toggle (themeWipe.ts) —
   while the hero entrance plays on the same beat (see initGsap, which waits
   for the "site-intro-reveal" event), so the page emerges out of the wipe
   like a print coming out of the tray.

   It only ever runs on a fresh visit:
   - skipped when reached via the main↔blog nav swap (body.nav-loading — the
     米白 LoadingOverlay owns that flow),
   - skipped once per tab session (sessionStorage), so reloads / back-nav
     don't replay the 2.8s cover,
   - skipped entirely under prefers-reduced-motion.
   In every skip case the reveal event still fires (next tick, after App's
   effect registered its listener) so the hero entrance always plays. */

const NAME = "Eververdants";
const DURATION = 2800; // ms, full develop
const STAGES = [
  { at: 0, label: "DEVELOPING" },
  { at: 42, label: "STOPPING" },
  { at: 58, label: "FIXING" },
  { at: 74, label: "WASHING" },
  { at: 88, label: "PRINTING" },
] as const;

const REVEAL_EVENT = "site-intro-reveal";
const SKIP_KEY = "__introShown";

const dispatchReveal = () =>
  window.dispatchEvent(new CustomEvent(REVEAL_EVENT));

export default function IntroLoader() {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const navSwap = document.body.classList.contains("nav-loading");
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const seen = (() => {
      try {
        return sessionStorage.getItem(SKIP_KEY) === "1";
      } catch {
        return false;
      }
    })();

    if (navSwap || reduced || seen) {
      // Never render, but the hero entrance still has to play — fire the
      // reveal on the next tick so initGsap's listener (registered in App's
      // effect, which runs after this one) is already attached.
      setVisible(false);
      const t = window.setTimeout(dispatchReveal, 0);
      return () => window.clearTimeout(t);
    }

    try {
      sessionStorage.setItem(SKIP_KEY, "1");
    } catch {}

    const lock = document.documentElement.classList;
    lock.add("intro-lock");

    const start = performance.now();
    let raf = 0;
    let hold = 0;
    let wipe = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      // Ease: fast start, slow finish — a weighted, "real" loading feel.
      const eased = 1 - Math.pow(1 - t, 2.2);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      // Hold the fully-developed sheet one beat, then wipe open.
      hold = window.setTimeout(() => {
        dispatchReveal();
        setLeaving(true);
      }, 260);
      wipe = window.setTimeout(() => {
        setVisible(false);
        lock.remove("intro-lock");
      }, 260 + 780);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hold);
      window.clearTimeout(wipe);
      lock.remove("intro-lock");
    };
  }, []);

  if (!visible) return null;

  const stage = STAGES.reduce(
    (acc, s) => (progress >= s.at ? s : acc),
    STAGES[0],
  ).label;
  const unveiled = (progress / 100) * NAME.length;
  const d = new Date();
  const today = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  const pct = String(progress).padStart(3, "0");

  return (
    <div className={`intro-loader ${leaving ? "leaving" : ""}`} aria-hidden>
      {/* backdrop: faint dot grid + ambient glows (echo Background.tsx) */}
      <div className="intro-dots" />
      <div className="intro-glow intro-glow-a" />
      <div className="intro-glow intro-glow-b" />

      {/* corner registration marks */}
      <span className="intro-mark intro-mark-tl" />
      <span className="intro-mark intro-mark-tr" />
      <span className="intro-mark intro-mark-bl" />
      <span className="intro-mark intro-mark-br" />

      <div className="intro-content">
        <div className="intro-sheet">
          <span className="intro-sheet-overline">EVERVERDANTS</span>
          <div className="intro-name">
            {NAME.split("").map((ch, i) => (
              <span
                key={i}
                className={`intro-char ${i < unveiled ? "unveiled" : ""}`}
              >
                {ch}
              </span>
            ))}
          </div>
          <div className="intro-scan" />
        </div>

        <div className="intro-progress">
          <div className="intro-track">
            <div
              className="intro-fill"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
          <span className="intro-pct">{pct}%</span>
        </div>

        <div className="intro-foot">
          <span className="intro-stage" key={stage}>
            {stage}
          </span>
          <span className="intro-foot-sep">·</span>
          <span>DEV 04:30 · {today}</span>
        </div>
      </div>
    </div>
  );
}
