import { useEffect, useState } from "react";
import { ui, useBlogPrefs } from "../prefs";

/* Floating "back to top" control for the blog sub-site — bottom-right,
   opposite the top-right preference pills, appearing only after the page
   has scrolled past one viewport. Same grammar as the rest of the blog:
   hairline border, field-tinted surface, teal hover. Smooth-scrolls via
   the app's lenis instance (falling back to native scrollTo). */

export default function BackToTop({
  scrollTo,
}: {
  scrollTo: (y: number) => void;
}) {
  const { lang } = useBlogPrefs();
  const t = ui[lang];
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => scrollTo(0)}
      aria-label={t.backToTop}
      title={t.backToTop}
      className={`fixed bottom-[clamp(20px,4vh,36px)] right-[clamp(16px,2vw,28px)] z-[55] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--field)]/90 text-[var(--muted)] backdrop-blur transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)] ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
