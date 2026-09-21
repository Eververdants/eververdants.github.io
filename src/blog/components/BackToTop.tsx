import { useEffect, useState } from "react";
import { usePrefs } from "../../shared/prefs-react";
import { pick } from "../../shared/prefs";
import { ui } from "../copy";

/* Ring-shaped back-to-top. Appears once the reader is a screen into the
   page; on an article it doubles as the reading-progress dial, since the
   fraction scrolled is exactly what that ring should show. */

const R = 20;
const C = 2 * Math.PI * R;

export default function BackToTop() {
  const { lang } = usePrefs();
  const t = ui[lang];
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (progress < 0.08) return null;

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t.backToTop}
      title={t.backToTop}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle className="back-to-top__track" cx="24" cy="24" r={R} />
        <circle
          className="back-to-top__fill"
          cx="24"
          cy="24"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
        />
      </svg>
      <span aria-hidden="true">↑</span>
    </button>
  );
}
