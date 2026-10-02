/* <site-topbar> — the one navigation bar for all five entries.
 *
 * Implemented as a custom element so the React sites (hub, /about, /blog,
 * /photos) and the deliberately framework-free /projects share a single
 * source of markup, styling and behaviour instead of the two near-identical
 * clones the site used to carry. Styles live in ./topbar.css, imported
 * through tokens.css.
 *
 * It renders into the light DOM, not a shadow root: prerendering serialises
 * outerHTML, and a shadow tree would bake an empty element — leaving every
 * static page without navigation for a crawler that skips JS.
 *
 * Attributes:
 *   active="home|about|blog|works|photos"  — marks the current page
 *   search                                 — show the ⌘K trigger
 *   compact                                — shorter bar (article views) */

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

const SunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7"/></svg>`;
const MoonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.2 14.2A8.3 8.3 0 0 1 9.8 3.8a8.3 8.3 0 1 0 10.4 10.4Z"/></svg>`;
const SearchIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.4"/><path d="m16 16 4.4 4.4"/></svg>`;
const MenuIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`;
const CloseIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

class SiteTopBar extends HTMLElement {
  static get observedAttributes() {
    return ["active", "search", "compact", "data-open"];
  }

  #unsub: (() => void) | null = null;
  #rendered = false;

  /* Document-level behaviours, bound once — the bar re-renders its nodes, but
     these listeners outlive any single render. */
  #onDocKey = (e: KeyboardEvent): void => {
    if (e.key !== "Escape") return;
    if (this.getAttribute("data-open") !== "true") return;
    this.setAttribute("data-open", "false");
    this.querySelector<HTMLElement>(".stb-toggle")?.focus();
  };

  #onDocClick = (e: MouseEvent): void => {
    if (this.getAttribute("data-open") !== "true") return;
    if (!this.contains(e.target as Node))
      this.setAttribute("data-open", "false");
  };

  connectedCallback(): void {
    this.render();
    this.#unsub = subscribePrefs(() => this.render());
    document.addEventListener("keydown", this.#onDocKey);
    document.addEventListener("click", this.#onDocClick);
  }

  disconnectedCallback(): void {
    this.#unsub?.();
    this.#unsub = null;
    document.removeEventListener("keydown", this.#onDocKey);
    document.removeEventListener("click", this.#onDocClick);
  }

  attributeChangedCallback(): void {
    if (this.#rendered) this.render();
  }

  get #lang(): Lang {
    return getPrefs().lang;
  }

  private render(): void {
    /* A prefs re-render swaps every node in the bar; if a control held focus
       (language / theme / search / menu toggle) remember which so focus can be
       handed back after the swap instead of dropping to <body>. */
    const focusedEl = document.activeElement as HTMLElement | null;
    let restore: string | null = null;
    if (focusedEl && this.contains(focusedEl)) {
      if (focusedEl.dataset.stbLang)
        restore = `[data-stb-lang="${focusedEl.dataset.stbLang}"]`;
      else if (focusedEl.hasAttribute("data-stb-theme"))
        restore = "[data-stb-theme]";
      else if (focusedEl.hasAttribute("data-stb-search"))
        restore = "[data-stb-search]";
      else if (focusedEl.classList.contains("stb-toggle"))
        restore = ".stb-toggle";
    }

    const lang = this.#lang;
    const active = this.getAttribute("active") ?? "";
    const open = this.getAttribute("data-open") === "true";
    const theme = getPrefs().theme;

    const link = (item: NavItem) =>
      `<a class="stb-link" href="${item.href}"${
        item.id === active ? ' aria-current="page"' : ""
      }>${esc(pick(lang, item.en, item.zh))}</a>`;

    const menuLink = (item: NavItem) =>
      `<a href="${item.href}"${
        item.id === active ? ' aria-current="page"' : ""
      }>${esc(pick(lang, item.en, item.zh))}</a>`;

    const controls = `
      <span class="stb-lang" role="group" aria-label="${esc(pick(lang, "Language", "语言"))}">
        <button type="button" data-stb-lang="en" aria-pressed="${lang === "en"}">EN</button><button type="button" data-stb-lang="zh" aria-pressed="${lang === "zh"}">中</button>
      </span>
      <span class="stb-rule" aria-hidden="true"></span>
      <button type="button" class="stb-icon" data-stb-theme
        aria-label="${esc(pick(lang, "Switch colour theme", "切换配色"))}"
        title="${esc(pick(lang, "Theme", "主题"))}">${theme === "dark" ? SunIcon : MoonIcon}</button>`;

    const search = this.hasAttribute("search")
      ? `<button type="button" class="stb-search" data-stb-search
           aria-label="${esc(pick(lang, "Search the site", "搜索本站"))}">
           ${SearchIcon}<span class="stb-search-label">${esc(pick(lang, "Search", "搜索"))}</span><span class="stb-kbd">Ctrl K</span>
         </button><span class="stb-rule" aria-hidden="true"></span>`
      : "";

    this.innerHTML = `
      <div class="stb-bar">
        <a class="stb-brand" href="/" aria-label="${esc(pick(lang, "Eververdants — home", "Eververdants —— 首页"))}">
          <img src="/assets/avatar.webp" alt="" width="32" height="32" />
          <span class="stb-wordmark">EVERVERDANTS</span>
        </a>
        <nav class="stb-nav" aria-label="${esc(pick(lang, "Primary", "主导航"))}">
          ${NAV.map(link).join("")}
        </nav>
        <div class="stb-tools">${search}${controls}</div>
        <button type="button" class="stb-toggle" aria-expanded="${open}"
          aria-label="${esc(pick(lang, "Menu", "菜单"))}">${open ? CloseIcon : MenuIcon}</button>
        <div class="stb-menu">
          <nav aria-label="${esc(pick(lang, "Primary", "主导航"))}">
            ${NAV.map(menuLink).join("")}
          </nav>
          <div class="stb-menu-foot">${controls}</div>
        </div>
      </div>`;

    this.#rendered = true;

    if (restore) {
      /* The language and theme controls exist twice — once in the bar and
         once in the mobile menu — and only one of them is rendered at a
         time. Hand focus back to the copy the reader can actually see. */
      const candidates = Array.from(
        this.querySelectorAll<HTMLElement>(restore),
      );
      (candidates.find((el) => el.offsetParent !== null) ?? candidates[0])?.focus();
    }

    this.querySelectorAll<HTMLElement>("[data-stb-lang]").forEach((b) =>
      b.addEventListener("click", () =>
        setLang(b.dataset.stbLang === "zh" ? "zh" : "en"),
      ),
    );
    /* Every copy of the theme button must be wired: the bar's copy is
       display:none under 720px, so a single querySelector bound only the
       hidden one and the phone's button did nothing. */
    this.querySelectorAll<HTMLElement>("[data-stb-theme]").forEach((b) =>
      b.addEventListener("click", () => toggleTheme()),
    );
    this.querySelector<HTMLElement>("[data-stb-search]")?.addEventListener(
      "click",
      () =>
        this.dispatchEvent(
          new CustomEvent("site-search", { bubbles: true }),
        ),
    );
    this.querySelector<HTMLElement>(".stb-toggle")?.addEventListener(
      "click",
      (e) => {
        /* The re-render below detaches this toggle before the event finishes
           bubbling; without stopPropagation the document-level outside-click
           handler would see a target outside the bar and close the menu the
           same click just opened. */
        e.stopPropagation();
        const willOpen = this.getAttribute("data-open") !== "true";
        /* setAttribute re-renders synchronously, so focus lands on the fresh
           nodes. Keyboard users step straight into the disclosure they just
           opened; closing hands focus back to the toggle it came from. */
        this.setAttribute("data-open", String(willOpen));
        if (willOpen) this.querySelector<HTMLElement>(".stb-menu a")?.focus();
        else this.querySelector<HTMLElement>(".stb-toggle")?.focus();
      },
    );
    this.querySelectorAll<HTMLElement>(".stb-menu a").forEach((a) =>
      a.addEventListener("click", () => this.setAttribute("data-open", "false")),
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
