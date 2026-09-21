/* <site-topbar> — the one navigation bar for all five entries.
 *
 * Implemented as a custom element so the React sites (hub, /about, /blog,
 * /photos) and the deliberately framework-free /projects share a single
 * source of markup, styling and behaviour instead of the two near-identical
 * clones the site used to carry.
 *
 * Attributes:
 *   active="home|about|blog|works|photos"  — marks the current page
 *   search                                 — show the ⌘K trigger
 *   compact                                — narrower gutter (article views)
 *
 * Language and theme come from ./prefs, so the bar stays in sync with the
 * rest of the page and with any other tab. */

import { getPrefs, pick, setLang, subscribePrefs, toggleTheme } from "./prefs";
import type { Lang } from "./prefs";

interface NavItem {
  id: string;
  href: string;
  en: string;
  zh: string;
}

const NAV: NavItem[] = [
  { id: "home", href: "/", en: "Home", zh: "首页" },
  { id: "about", href: "/about/", en: "About", zh: "关于" },
  { id: "blog", href: "/blog/", en: "Blog", zh: "博客" },
  { id: "works", href: "/projects/", en: "Works", zh: "作品" },
  { id: "photos", href: "/photos/", en: "Photographs", zh: "摄影" },
];

const STYLES = /* css */ `
  :host {
    position: fixed;
    inset: clamp(10px, 1.8vh, 20px) clamp(10px, 2vw, 22px) auto;
    z-index: var(--z-header);
    display: block;
    font-family: var(--font-sans);
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 62px;
    padding-inline: clamp(14px, 2vw, 22px);
    border-radius: var(--r-xl);
    background: var(--glass-fill);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    box-shadow:
      var(--glass-shadow),
      inset 0 1px 0 var(--glass-specular);
  }

  @supports (corner-shape: squircle) {
    .bar,
    .menu,
    .icon-btn,
    .search-btn {
      corner-shape: squircle;
    }
  }

  a { color: inherit; text-decoration: none; }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .brand img {
    width: 32px;
    height: 32px;
    border-radius: var(--r-sm);
    object-fit: cover;
    border: 1px solid var(--glass-border);
  }

  .wordmark {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 17px;
    letter-spacing: 0.1em;
    color: var(--ink);
    white-space: nowrap;
  }

  nav { display: flex; align-items: center; gap: clamp(14px, 2vw, 26px); }

  .link {
    position: relative;
    font-size: 14.5px;
    font-weight: 500;
    color: var(--muted);
    padding-block: 6px;
    transition: color var(--dur-2) var(--ease-out);
    white-space: nowrap;
  }
  .link:hover { color: var(--ink); }
  .link::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -2px;
    width: 5px;
    height: 5px;
    border-radius: var(--r-full);
    background: var(--accent);
    opacity: 0;
    transform: translate(-50%, 4px) scale(0.6);
    transition:
      opacity var(--dur-2) var(--ease-out),
      transform var(--dur-2) var(--ease-out);
  }
  .link[aria-current="page"] { color: var(--ink); }
  .link[aria-current="page"]::after {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }

  .tools { display: flex; align-items: center; gap: 6px; }

  .divider {
    width: 1px;
    height: 18px;
    margin-inline: 6px;
    background: var(--border);
  }

  .lang {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    border-radius: var(--r-full);
    border: 1px solid var(--border-soft);
  }
  .lang button {
    appearance: none;
    border: 0;
    background: transparent;
    cursor: pointer;
    font: inherit;
    font-size: 12.5px;
    font-weight: 600;
    line-height: 1;
    padding: 6px 9px;
    border-radius: var(--r-full);
    color: var(--muted);
    transition:
      background-color var(--dur-2) var(--ease-out),
      color var(--dur-2) var(--ease-out);
  }
  .lang button[aria-pressed="true"] {
    background: var(--accent-soft);
    color: var(--accent-ink);
  }
  .lang button:hover { color: var(--ink); }

  .icon-btn,
  .search-btn {
    display: grid;
    place-items: center;
    appearance: none;
    cursor: pointer;
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    border-radius: var(--r-md);
    transition:
      color var(--dur-2) var(--ease-out),
      background-color var(--dur-2) var(--ease-out),
      border-color var(--dur-2) var(--ease-out);
  }
  .icon-btn { width: 36px; height: 36px; }
  .icon-btn:hover,
  .search-btn:hover {
    color: var(--ink);
    background: var(--accent-soft);
    border-color: var(--border-soft);
  }
  .icon-btn svg { width: 18px; height: 18px; display: block; }

  .search-btn {
    gap: 8px;
    height: 36px;
    padding-inline: 10px;
    font: inherit;
    font-size: 13px;
  }
  .search-btn .label { display: none; }
  kbd {
    font-family: var(--font-mono);
    font-size: 10.5px;
    line-height: 1;
    padding: 4px 5px;
    border-radius: var(--r-xs);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--faint);
  }

  .menu-toggle { display: none; }
  .menu { display: none; }

  @media (min-width: 721px) {
    .search-btn .label { display: inline; }
  }

  @media (max-width: 720px) {
    .bar { height: 56px; border-radius: var(--r-lg); }
    nav, .tools { display: none; }
    .menu-toggle {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border: 1px solid var(--border-soft);
      border-radius: var(--r-md);
      background: transparent;
      color: var(--ink);
      cursor: pointer;
    }
    @supports (corner-shape: squircle) { .menu-toggle { corner-shape: squircle; } }
    .menu-toggle svg { width: 18px; height: 18px; }
    .menu {
      display: none;
      position: absolute;
      left: 0;
      right: 0;
      top: calc(100% + 8px);
      padding: 8px;
      border-radius: var(--r-lg);
      background: var(--glass-fill-strong);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
      -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
      box-shadow: var(--glass-shadow-lift);
    }
    :host([open]) .menu { display: block; }
    .menu a {
      display: flex;
      align-items: center;
      height: 44px;
      padding-inline: 12px;
      border-radius: var(--r-md);
      font-size: 15px;
      color: var(--body);
    }
    .menu a:hover { background: var(--accent-soft); color: var(--ink); }
    .menu a[aria-current="page"] { color: var(--accent-ink); font-weight: 600; }
    .menu .foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px 4px;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    .bar, .menu {
      background: var(--surface);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }

  :host([compact]) .bar { height: 54px; }
`;

const SunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7"/></svg>`;
const MoonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.2 14.2A8.3 8.3 0 0 1 9.8 3.8a8.3 8.3 0 1 0 10.4 10.4Z"/></svg>`;
const SearchIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.4"/><path d="m16 16 4.4 4.4"/></svg>`;
const MenuIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`;
const CloseIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

class SiteTopBar extends HTMLElement {
  static get observedAttributes() {
    return ["active", "search", "compact"];
  }

  #root: ShadowRoot | null = null;
  #unsub: (() => void) | null = null;

  connectedCallback(): void {
    if (!this.#root) {
      this.#root = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = STYLES;
      this.#root.append(style);
      const holder = document.createElement("div");
      holder.className = "host";
      this.#root.append(holder);
    }
    this.#render();
    this.#unsub = subscribePrefs(() => this.#render());
  }

  disconnectedCallback(): void {
    this.#unsub?.();
    this.#unsub = null;
  }

  attributeChangedCallback(): void {
    if (this.#root) this.#render();
  }

  get #lang(): Lang {
    return getPrefs().lang;
  }

  #render(): void {
    const root = this.#root;
    if (!root) return;
    const lang = this.#lang;
    const active = this.getAttribute("active") ?? "";
    const theme = getPrefs().theme;

    const link = (item: NavItem, inMenu: boolean) =>
      `<a class="${inMenu ? "" : "link"}" href="${item.href}"${
        item.id === active ? ' aria-current="page"' : ""
      }>${pick(lang, item.en, item.zh)}</a>`;

    const tools = `
      <div class="lang" role="group" aria-label="${pick(lang, "Language", "语言")}">
        <button type="button" data-lang="en" aria-pressed="${lang === "en"}">EN</button>
        <button type="button" data-lang="zh" aria-pressed="${lang === "zh"}">中</button>
      </div>
      <span class="divider" aria-hidden="true"></span>
      <button type="button" class="icon-btn" data-theme-toggle
        aria-label="${pick(lang, "Switch theme", "切换主题")}"
        title="${pick(lang, "Theme", "主题")}">${theme === "dark" ? SunIcon : MoonIcon}</button>`;

    root.innerHTML = `
      <div class="bar">
        <a class="brand" href="/" aria-label="${pick(lang, "Eververdants — home", "Eververdants —— 首页")}">
          <img src="/assets/avatar.webp" alt="" width="32" height="32" />
          <span class="wordmark">EVERVERDANTS</span>
        </a>
        <nav aria-label="${pick(lang, "Primary", "主导航")}">
          ${NAV.map((i) => link(i, false)).join("")}
        </nav>
        <div class="tools">
          ${this.hasAttribute("search")
            ? `<button type="button" class="search-btn" data-search
                 aria-label="${pick(lang, "Search", "搜索")}">
                 ${SearchIcon}<span class="label">${pick(lang, "Search", "搜索")}</span><kbd>⌘K</kbd>
               </button>
               <span class="divider" aria-hidden="true"></span>`
            : ""}
          ${tools}
        </div>
        <button type="button" class="menu-toggle" aria-expanded="${this.hasAttribute("open")}"
          aria-label="${pick(lang, "Menu", "菜单")}">${this.hasAttribute("open") ? CloseIcon : MenuIcon}</button>
        <div class="menu">
          <nav aria-label="${pick(lang, "Primary", "主导航")}">
            ${NAV.map((i) => link(i, true)).join("")}
          </nav>
          <div class="foot">${tools}</div>
        </div>
      </div>`;

    root.querySelectorAll<HTMLElement>("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () =>
        setLang(btn.dataset.lang === "zh" ? "zh" : "en"),
      );
    });
    root
      .querySelector<HTMLElement>("[data-theme-toggle]")
      ?.addEventListener("click", () => toggleTheme());
    root
      .querySelector<HTMLElement>("[data-search]")
      ?.addEventListener("click", () => this.#openSearch());
    root.querySelector<HTMLElement>(".menu-toggle")?.addEventListener("click", () => {
      if (this.hasAttribute("open")) this.removeAttribute("open");
      else this.setAttribute("open", "");
      this.#render();
    });
    root.querySelectorAll<HTMLAnchorElement>(".menu a").forEach((a) =>
      a.addEventListener("click", () => {
        this.removeAttribute("open");
        this.#render();
      }),
    );
  }

  #openSearch(): void {
    this.dispatchEvent(
      new CustomEvent("site-search", { bubbles: true, composed: true }),
    );
  }
}

/** Register <site-topbar>. Safe to call from every entry; idempotent. */
export function defineTopBar(): void {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("site-topbar")) {
    customElements.define("site-topbar", SiteTopBar);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "site-topbar": SiteTopBar;
  }
}
