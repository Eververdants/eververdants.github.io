/* GlassTopBar — the universal rounded glass top bar shared by the main
 * site and every sub-site (blog / works / photographs).
 *
 * Self-contained presentational component. Props:
 *   - prefs:   the shared { lang, setLang, theme, setTheme }
 *   - active:  which nav item is current (drives the accent underline)
 *   - showLang: show the EN/中 switch (default true — every site keeps it)
 *   - transparent: drop the glass tint and go fully see-through with just a
 *              backdrop blur (the main site's dark cinematic canvas wants a
 *              weightless bar, no fill)
 *
 * Styling is pure Tailwind — no hand-written .gtb CSS. Theme-aware colours
 * are pulled from the existing --bg / --ink / --accent tokens via arbitrary
 * values, so the bar follows data-theme with zero recolouring and (per the
 * brief) zero gradients. <760px collapses to a hamburger + dropdown.
 */
import { useEffect, useRef, useState } from "react";
import { themeFlip } from "../effects/themePlain";
import type { Theme, TopBarPrefs } from "./useSharedPrefs";

export type NavKey = "home" | "blog" | "works" | "photos";

interface NavItem {
  id: NavKey;
  href: string;
  en: string;
  zh: string;
}

const NAV: NavItem[] = [
  { id: "home", href: "/", en: "Home", zh: "首页" },
  { id: "blog", href: "/blog", en: "Blog", zh: "博客" },
  { id: "works", href: "/projects", en: "Works", zh: "作品" },
  { id: "photos", href: "/photos", en: "Photographs", zh: "摄影集" },
];

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M20.2 14.2A8.3 8.3 0 0 1 9.8 3.8a8.3 8.3 0 1 0 10.4 10.4Z" />
    </svg>
  );
}

interface GlassTopBarProps {
  prefs: TopBarPrefs;
  active: NavKey;
  showLang?: boolean;
  transparent?: boolean;
  /** Lock the bar to dark and hide the theme toggle. The main site is dark by
   *  design; a stored "light" is still honoured on the sub-sites. */
  lockTheme?: boolean;
  /** On the main site the hero is a full-screen sticky section the rest of the
   *  page scrolls over. When true, the bar scrolls up + fades out as the hero
   *  leaves (instead of floating forever), then returns when you scroll back. */
  hideWithHero?: boolean;
  /** Smart auto-hide for long-reading surfaces (the blog article reader):
   *  the bar slides up + fades out on downward scroll, returns on the first
   *  upward scroll, and stays pinned near the top or while the mobile menu
   *  is open. */
  autoHide?: boolean;
}

export default function GlassTopBar({
  prefs,
  active,
  showLang = true,
  transparent = false,
  lockTheme = false,
  hideWithHero = false,
  autoHide = false,
}: GlassTopBarProps) {
  const { lang, setLang, theme, setTheme } = prefs;
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuOpenRef = useRef(menuOpen);
  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  const onTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    themeFlip(() => setTheme(next));
  };

  const closeMenu = () => setMenuOpen(false);

  /* Scroll-linked hide: translate the bar up and fade it out across the first
     ~60% of a viewport of scroll, so it leaves with the hero. Driven by the
     native scroll position (Lenis writes real scrollTop), rAF-throttled. */
  useEffect(() => {
    if (!hideWithHero) return;
    const el = headerRef.current;
    if (!el) return;
    let raf = 0;
    const measureShift = () => {
      const r = el.getBoundingClientRect();
      return r.top + r.height + 24;
    };
    let shift = measureShift();
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY || window.pageYOffset || 0;
        const h =
          window.innerHeight || document.documentElement.clientHeight || 1;
        const p = Math.min(Math.max(y / (h * 0.6), 0), 1);
        el.style.transform = `translateY(${-p * shift}px)`;
        el.style.opacity = String(1 - p);
        el.style.pointerEvents = p > 0.92 ? "none" : "";
      });
    };
    const onResize = () => {
      shift = measureShift();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hideWithHero]);

  /* Smart auto-hide: hide on downward scroll, reveal on upward. The bar
     stays pinned near the top of the page and while the mobile menu is
     open. Threshold on |dy| swallows Lenis's tiny scroll jitter. */
  useEffect(() => {
    if (!autoHide) return;
    const el = headerRef.current;
    if (!el) return;
    let lastY = window.scrollY;
    let raf = 0;
    let hidden = false;
    const apply = (hide: boolean) => {
      if (hide === hidden) return;
      hidden = hide;
      el.style.transform = hide ? "translateY(-120%)" : "translateY(0)";
      el.style.opacity = hide ? "0" : "1";
      el.style.pointerEvents = hide ? "none" : "";
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY || window.pageYOffset || 0;
        const dy = y - lastY;
        lastY = y;
        if (menuOpenRef.current || y < 96) {
          apply(false);
          return;
        }
        if (Math.abs(dy) < 5) return;
        apply(dy > 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      /* Leaving auto-hide (index page, other route) — restore the bar so it
         never gets stuck off-screen. */
      el.style.transform = "";
      el.style.opacity = "";
      el.style.pointerEvents = "";
    };
  }, [autoHide]);

  /* Bar surface: tinted glass on sub-sites, fully transparent (blur only) on
     the main site. Colour tokens flip with data-theme, so neither variant
     needs a dark/light branch. */
  const surface = transparent
    ? "bg-transparent border-[color-mix(in_srgb,var(--ink)_14%,transparent)]"
    : "bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] border-[color-mix(in_srgb,var(--ink)_18%,transparent)]";

  /* Auto-hide runs its own slide/fade transition (transform + opacity +
     theme colours); everything else keeps the quiet colour-only fade. */
  const transitionCls = autoHide
    ? "transition-[transform,opacity,background-color,border-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
    : "transition-colors duration-300";

  const barClass = [
    "fixed",
    "left-[clamp(12px,2vw,24px)]",
    "right-[clamp(12px,2vw,24px)]",
    "top-[clamp(12px,2vh,24px)]",
    "z-[60]",
    "flex",
    "items-center",
    "justify-between",
    "h-16",
    "px-[clamp(18px,2.4vw,28px)]",
    "rounded-[20px]",
    "border",
    "backdrop-blur-lg",
    "backdrop-saturate-150",
    "text-[var(--ink)]",
    transitionCls,
    surface,
    "max-[760px]:h-14",
    "max-[760px]:px-[18px]",
    "max-[760px]:rounded-[18px]",
  ].join(" ");

  const navNodes = (menu: boolean, onClick?: () => void) =>
    NAV.map((item) => {
      const isActive = item.id === active;
      const activeClass = isActive ? "opacity-100 text-[var(--accent)]" : "";
      if (menu) {
        return (
          <a
            key={item.id}
            href={item.href}
            onClick={onClick}
            aria-current={isActive ? "page" : undefined}
            className={`flex h-[46px] items-center pl-4 font-medium text-[16px] text-[var(--ink)] opacity-[0.78] transition hover:opacity-100 ${activeClass}`}
          >
            <span>{lang === "zh" ? item.zh : item.en}</span>
          </a>
        );
      }
      return (
        <a
          key={item.id}
          href={item.href}
          onClick={onClick}
          aria-current={isActive ? "page" : undefined}
          className={`relative inline-flex items-center font-medium text-[15px] opacity-60 transition hover:opacity-100 ${activeClass}`}
        >
          <span>{lang === "zh" ? item.zh : item.en}</span>
          <span
            aria-hidden="true"
            className={`absolute left-0 right-0 -bottom-[7px] h-[2px] rounded-full bg-[var(--accent)] origin-center transition-transform duration-300 ease-out ${isActive ? "scale-x-100" : "scale-x-0"}`}
          />
        </a>
      );
    });

  const langUnderline = `absolute bottom-[2px] left-0 h-[2px] w-7 rounded-full bg-[var(--accent)] transition-transform duration-300 ease-out ${lang === "zh" ? "translate-x-full" : "translate-x-0"}`;

  const langPair = (
    <div
      className="relative flex items-stretch"
      role="group"
      aria-label="Language"
    >
      <span aria-hidden="true" className={langUnderline} />
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        title="English"
        className={`relative z-10 w-7 border-0 cursor-pointer bg-transparent py-[4px] pb-[6px] font-medium text-[14px] text-[var(--ink)] opacity-50 transition hover:opacity-[0.85] ${lang === "en" ? "opacity-100" : ""}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
        title="中文"
        className={`relative z-10 w-7 border-0 cursor-pointer bg-transparent py-[4px] pb-[6px] font-medium text-[14px] text-[var(--ink)] opacity-50 transition hover:opacity-[0.85] ${lang === "zh" ? "opacity-100" : ""}`}
      >
        中
      </button>
    </div>
  );

  const themeBtn = (
    <button
      type="button"
      onClick={onTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "切换到浅色模式"}
      title="Theme"
      className="relative grid h-9 w-9 cursor-pointer place-items-center border-0 bg-transparent text-[var(--ink)] opacity-70 transition hover:opacity-100"
    >
      <span
        className={`absolute inset-0 grid place-items-center transition duration-500 ${theme === "light" ? "rotate-0 scale-100 opacity-100" : "-rotate-[120deg] scale-50 opacity-0"}`}
      >
        <SunIcon />
      </span>
      <span
        className={`absolute inset-0 grid place-items-center transition duration-500 ${theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-[120deg] scale-50 opacity-0"}`}
      >
        <MoonIcon />
      </span>
    </button>
  );

  return (
    <header ref={headerRef} className={barClass}>
      <a
        href="/"
        aria-label="Eververdants — home"
        onClick={closeMenu}
        className="inline-flex items-center gap-[10px] no-underline text-[var(--ink)]"
      >
        <img
          src="/assets/avatar.webp"
          alt="Eververdants"
          className="h-8 w-8 rounded-full object-cover max-[760px]:h-7 max-[760px]:w-7"
        />
        <span className="font-['Fraunces',serif] font-semibold text-[19px] tracking-[0.12em]">
          EVERVERDANTS
        </span>
      </a>

      <div className="flex items-center gap-[clamp(20px,3vw,40px)] max-[760px]:hidden">
        <nav
          className="flex items-center gap-[clamp(18px,2.4vw,30px)]"
          aria-label="Primary"
        >
          {navNodes(false)}
        </nav>
        <div className="flex items-center gap-[clamp(16px,2vw,26px)]">
          {showLang && langPair}
          {showLang && (
            <span
              className="block h-5 w-px bg-[var(--ink)] opacity-[0.16]"
              aria-hidden="true"
            />
          )}
          {!lockTheme && themeBtn}
        </div>
      </div>

      <button
        type="button"
        className="hidden h-9 w-9 cursor-pointer place-items-center border-0 bg-transparent text-[var(--ink)] max-[760px]:grid"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          aria-hidden="true"
          className="h-5 w-5"
        >
          {menuOpen ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      <div
        className={`hidden ${menuOpen ? "max-[760px]:block" : "max-[760px]:hidden"}
          max-[760px]:absolute max-[760px]:left-0 max-[760px]:right-0 max-[760px]:top-[calc(100%+10px)]
          max-[760px]:rounded-[18px] max-[760px]:border max-[760px]:p-[10px]
          max-[760px]:backdrop-blur-lg max-[760px]:backdrop-saturate-150 max-[760px]:shadow-lg
          ${surface} max-[760px]:border-[color-mix(in_srgb,var(--ink)_16%,transparent)]`}
        role="dialog"
        aria-label="Menu"
      >
        <nav
          className="max-[760px]:relative max-[760px]:flex max-[760px]:flex-col"
          aria-label="Primary"
        >
          {navNodes(true, closeMenu)}
        </nav>
        <span
          className="hidden max-[760px]:block max-[760px]:mx-2 max-[760px]:my-1 max-[760px]:h-px max-[760px]:bg-[var(--ink)] max-[760px]:opacity-10"
          aria-hidden="true"
        />
        <div className="hidden max-[760px]:flex max-[760px]:items-center max-[760px]:gap-4 max-[760px]:px-4 max-[760px]:pb-1 max-[760px]:relative">
          {showLang && <div className="max-[760px]:mr-auto">{langPair}</div>}
          {!lockTheme && themeBtn}
        </div>
      </div>
    </header>
  );
}
