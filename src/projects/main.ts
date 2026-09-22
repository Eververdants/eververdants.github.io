/* WORKS INDEX — /projects/
 *
 * Deliberately zero-runtime-dependency vanilla TypeScript: this sub-site is a
 * static ledger, so it renders with template strings rather than pulling in a
 * framework. The only code it shares with the rest of the site is the design
 * system in ../shared — the prefs store, the <site-topbar> element and the
 * head/JSON-LD writer. Everything else on the page is a string.
 *
 * Data comes from src/projects/data/repos.json, regenerated from GitHub by
 * scripts/fetch-repos.mjs. */

import "./style.css";
import data from "./data/repos.json";
import type { Dataset, Repo } from "./lib/types";
import { langColor } from "./lib/langs";
import { esc, fmtCount, lastActive, timeAgo } from "./lib/format";
import { repoDesc, ui } from "./lib/i18n";
import { getPrefs, initPrefs, pick, subscribePrefs } from "../shared/prefs";
import type { Lang } from "../shared/prefs";
import { defineTopBar } from "../shared/topbar";
import { applyHead, breadcrumbLd, PERSON, SITE } from "../shared/seo";

/* Language + theme live in blog-lang / blog-theme, so a reader's choices carry
   across all five entries. initPrefs() writes the document attributes before
   first paint; defineTopBar() registers <site-topbar>, which subscribes to the
   prefs store itself — this file never renders or re-renders the bar. */
initPrefs();
defineTopBar();

const d = data as unknown as Dataset;
const repos: Repo[] = d.repos;

/* ================= 状态 ================= */
type SortKey = "updated" | "stars" | "name";
const state = {
  q: "",
  filterLang: "ALL",
  sort: "updated" as SortKey,
};

const lang = (): Lang => getPrefs().lang;
const t = () => ui[lang()];
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* A scroll *restoration* must not be animated by `scroll-behavior: smooth`. */
function jumpTo(y: number) {
  window.scrollTo({ top: y, left: 0, behavior: "instant" });
}
function scrollTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: reducedMotion() ? "auto" : "smooth",
  });
}

/* ================= Hero ================= */
function renderHero() {
  const el = document.getElementById("hero")!;
  const meta = d._meta;
  const langs = new Set(repos.map((r) => r.language)).size;
  const stars = repos.reduce((s, r) => s + r.stars, 0);
  const u = t();
  el.innerHTML = `
    <span class="ring-field hero__rings" aria-hidden="true"></span>
    <div class="shell hero__inner">
      <p class="kicker hero__overline" data-reveal>${esc(u.overline(new Date().getFullYear()))}</p>
      <h1 class="display hero__title" data-reveal style="--reveal-delay:70ms">${esc(u.title)}</h1>
      <div class="hero__row" data-reveal style="--reveal-delay:120ms">
        <p class="lede hero__sub">${esc(u.sub)}</p>
        <a class="btn sq-md hero__cta" href="/">${esc(u.mainSite)} <span aria-hidden="true">↗</span></a>
      </div>
      <div class="hero__meta" data-reveal style="--reveal-delay:170ms">
        <div class="stat"><b class="num">${meta.count}</b><span class="kicker">${esc(u.metaRepos)}</span></div>
        <div class="stat"><b class="num">${stars}</b><span class="kicker">${esc(u.metaStars)}</span></div>
        <div class="stat"><b class="num">${langs}</b><span class="kicker">${esc(u.metaLangs)}</span></div>
      </div>
    </div>`;
}

/* ================= 精选 ================= */
function renderFeatured() {
  const featured = repos.filter((r) => r.featured).slice(0, 3);
  const el = document.getElementById("featured")!;
  const u = t();
  const l = lang();
  el.innerHTML = `
    <div class="shell">
      <div class="section__head" data-reveal>
        <div class="section__heading">
          <span class="ring-mark" aria-hidden="true"></span>
          <div>
            <p class="kicker section__overline">${esc(u.featuredOverline)}</p>
            <h2 class="display section__title">${esc(u.featuredTitle)}</h2>
          </div>
        </div>
        <p class="section__note">${esc(u.hoverHint)}</p>
      </div>
      <div class="featured">
        ${featured
          .map(
            (r, i) => `
          <div class="feat-cell" data-reveal style="--reveal-delay:${i * 70}ms">
            <a class="feat glass glass-sheen glass-press sq-xl" href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="Open ${esc(r.name)}">
              <div class="feat__media">
                <span class="feat__idx num sq-sm">${String(i + 1).padStart(2, "0")}</span>
                ${r.thumb ? `<img src="${esc(r.thumb)}" alt="${esc(r.name)}" loading="lazy" decoding="async"/>` : ""}
              </div>
              <div class="feat__body">
                <p class="kicker feat__tag">${esc(r.tag || r.language)}</p>
                <h3 class="feat__name">${esc(r.name)}<span class="arrow" aria-hidden="true">↗</span></h3>
                <p class="feat__desc">${esc(repoDesc(l, r.description, r.blurbEn, r.blurbZh))}</p>
                <div class="feat__meta">
                  <span class="mono lang-chip"><span class="lang-dot" style="background:${langColor(r.language)}"></span>${esc(r.language)}</span>
                  <span class="mono num">★ ${fmtCount(r.stars)}</span>
                  <span class="mono num">↺ ${timeAgo(l, r.pushedAt)}</span>
                </div>
              </div>
            </a>
          </div>`,
          )
          .join("")}
      </div>
    </div>`;
}

/* ================= 台账 ================= */
function filtered(): Repo[] {
  let list = repos.filter(
    (r) => state.filterLang === "ALL" || r.language === state.filterLang,
  );
  if (state.q.trim()) {
    const q = state.q.trim().toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.blurbEn || "").toLowerCase().includes(q) ||
        (r.blurbZh || "").toLowerCase().includes(q) ||
        r.language.toLowerCase().includes(q) ||
        r.topics.some((x) => x.toLowerCase().includes(q)),
    );
  }
  if (state.sort === "updated")
    list = [...list].sort((a, b) => lastActive(b) - lastActive(a));
  if (state.sort === "stars")
    list = [...list].sort((a, b) => b.stars - a.stars);
  if (state.sort === "name")
    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function langOptions(): { lang: string; count: number }[] {
  const m = new Map<string, number>();
  repos.forEach((r) => m.set(r.language, (m.get(r.language) || 0) + 1));
  return [...m.entries()]
    .map(([lang, count]) => ({ lang, count }))
    .sort((a, b) => b.count - a.count || a.lang.localeCompare(b.lang));
}

function renderToolbar() {
  const el = document.getElementById("toolbar")!;
  const u = t();
  const langs = langOptions();
  el.innerHTML = `
    <label class="search">
      <span class="search__icon" aria-hidden="true">⌕</span>
      <input id="search-input" type="search" placeholder="${esc(u.searchPlaceholder)}" autocomplete="off" spellcheck="false"/>
    </label>
    <div class="chips" role="group" aria-label="filter by language">
      <button class="chip" type="button" data-lang="ALL" aria-pressed="${state.filterLang === "ALL"}">${esc(u.all)} <span class="cnt num">${repos.length}</span></button>
      ${langs
        .map(
          (l) =>
            `<button class="chip" type="button" data-lang="${esc(l.lang)}" aria-pressed="${state.filterLang === l.lang}">${esc(l.lang)} <span class="cnt num">${l.count}</span></button>`,
        )
        .join("")}
    </div>
    <div class="sort sq-md" role="group" aria-label="sort">
      <button class="sort__btn" type="button" data-sort="updated" aria-pressed="${state.sort === "updated"}">${esc(u.sortUpdated)}</button>
      <button class="sort__btn" type="button" data-sort="stars" aria-pressed="${state.sort === "stars"}">${esc(u.sortStars)}</button>
      <button class="sort__btn" type="button" data-sort="name" aria-pressed="${state.sort === "name"}">${esc(u.sortName)}</button>
    </div>`;

  const input = el.querySelector("#search-input") as HTMLInputElement;
  input.value = state.q;
  input.addEventListener("input", () => {
    state.q = input.value;
    syncUrl();
    renderLedger();
  });

  el.querySelectorAll(".chip").forEach((c) => {
    c.addEventListener("click", () => {
      state.filterLang = (c as HTMLElement).dataset.lang || "ALL";
      syncToolbar();
      syncUrl();
      renderLedger();
    });
  });
  el.querySelectorAll(".sort__btn").forEach((b) => {
    b.addEventListener("click", () => {
      state.sort = (b as HTMLElement).dataset.sort as SortKey;
      syncToolbar();
      syncUrl();
      renderLedger();
    });
  });
}

/* 点击筛选/排序后，把选中态同步到所有 chip / sort 按钮（aria-pressed） */
function syncToolbar() {
  document.querySelectorAll("#toolbar .chip").forEach((c) => {
    c.setAttribute(
      "aria-pressed",
      String((c as HTMLElement).dataset.lang === state.filterLang),
    );
  });
  document.querySelectorAll("#toolbar .sort__btn").forEach((b) => {
    b.setAttribute(
      "aria-pressed",
      String((b as HTMLElement).dataset.sort === state.sort),
    );
  });
}

function renderLedger() {
  const list = filtered();
  const u = t();
  const l = lang();
  const el = document.getElementById("ledger")!;
  document.getElementById("result-count")!.textContent = `${list.length} / ${repos.length}`;

  if (!list.length) {
    el.innerHTML = `
      <div class="empty">
        <span class="ring-mark" aria-hidden="true"></span>
        <p class="display empty__title">${esc(u.emptyTitle)}</p>
        <p class="empty__sub">${esc(u.emptySub)}</p>
        <button type="button" class="btn sq-md" id="clear-filters">${esc(u.clear)}</button>
      </div>`;
    el.querySelector("#clear-filters")!.addEventListener("click", () => {
      state.q = "";
      state.filterLang = "ALL";
      const input = document.getElementById(
        "search-input",
      ) as HTMLInputElement | null;
      if (input) input.value = "";
      syncToolbar();
      syncUrl();
      renderLedger();
    });
    return;
  }

  el.innerHTML = list
    .map(
      (r, i) => `
    <a class="row" href="${esc(r.url)}" target="_blank" rel="noopener" style="--row-i:${Math.min(i, 12)}" aria-label="Open ${esc(r.name)} on GitHub">
      <span class="row__idx num">${String(i + 1).padStart(2, "0")}</span>
      <div class="row__main">
        <div class="row__name">
          ${esc(r.name)}
          ${r.tag ? `<span class="row__tag">${esc(r.tag)}</span>` : ""}
          ${r.archived ? `<span class="row__tag row__tag--muted">${esc(u.archived)}</span>` : ""}
        </div>
        <p class="row__desc">${esc(repoDesc(l, r.description, r.blurbEn, r.blurbZh)) || `<span class="row__nodesc">${esc(u.noDesc)}</span>`}</p>
        ${
          r.topics.length
            ? `<div class="row__topics">${r.topics
                .slice(0, 4)
                .map((x) => `<span class="row__topic">${esc(x)}</span>`)
                .join("")}</div>`
            : ""
        }
      </div>
      <div class="row__meta">
        <span class="mono lang-chip"><span class="lang-dot" style="background:${langColor(r.language)}"></span>${esc(r.language)}</span>
        <span class="mono num">★ ${fmtCount(r.stars)}</span>
        <span class="mono num">↺ ${timeAgo(l, r.pushedAt)}</span>
        <span class="row__link">${esc(u.open)} <span class="arrow" aria-hidden="true">↗</span></span>
      </div>
    </a>`,
    )
    .join("");
}

/* ================= URL 状态 ================= */
function syncUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.filterLang !== "ALL") p.set("lang", state.filterLang);
  if (state.sort !== "updated") p.set("sort", state.sort);
  const qs = p.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}
function readUrl() {
  const p = new URLSearchParams(location.search);
  state.q = p.get("q") || "";
  const l = p.get("lang");
  /* `?lang=` is also the site-wide language override (see shared/prefs) — a
     value that names a GitHub language is a filter, anything else is left to
     the prefs store. */
  state.filterLang = l && repos.some((r) => r.language === l) ? l : "ALL";
  const s = p.get("sort");
  state.sort = s === "stars" || s === "name" ? s : "updated";
}

/* ================= 页脚 ================= */
function renderFooter() {
  const el = document.getElementById("footer")!;
  const u = t();
  el.innerHTML = `
    <div class="shell">
      <hr class="ring-rule" />
      <div class="footer__grid">
        <p class="footer__sign">Eververdants <span class="footer__alias">· 万山青未阑</span></p>
        <nav class="footer__links" aria-label="Footer">
          <a class="navlink" href="#top" id="top-link">↑ ${esc(u.backHome)}</a>
          <a class="navlink" href="/">${esc(u.mainSite)} ↗</a>
          <a class="navlink" href="https://github.com/Eververdants" target="_blank" rel="noopener">${esc(u.github)} ↗</a>
        </nav>
      </div>
    </div>`;
  el.querySelector("#top-link")!.addEventListener("click", (e) => {
    e.preventDefault();
    scrollTop();
  });
}

/* ================= HEAD / JSON-LD =================
   One CollectionPage + ItemList of SoftwareSourceCode, rebuilt whenever the
   language changes so the blurred descriptions follow the reader's language.
   applyHead() upserts title / description / canonical / og:* / twitter:* /
   hreflang alternates and replaces the managed JSON-LD blocks — the same
   helper scripts/prerender.mjs bakes, which is what keeps the static head and
   the live one from drifting. */
function worksLd(l: Lang): unknown[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pick(l, "Works — Eververdants", "作品索引 — Eververdants"),
      alternateName: pick(l, "作品索引", "Works — Eververdants"),
      description: docDescription(l),
      url: `${SITE}/projects/`,
      inLanguage: ["en", "zh-Hans"],
      isPartOf: {
        "@type": "WebSite",
        name: "Eververdants",
        url: `${SITE}/`,
      },
      about: PERSON,
      mainEntity: {
        "@type": "ItemList",
        name: "Open-source projects by Eververdants",
        itemListElement: repos.map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "SoftwareSourceCode",
            name: r.name,
            description:
              repoDesc(l, r.description, r.blurbEn, r.blurbZh) || undefined,
            codeRepository: r.url,
            programmingLanguage: r.language === "Markdown" ? undefined : r.language,
            author: PERSON,
          },
        })),
      },
    },
    breadcrumbLd([
      { name: "Eververdants", path: "/" },
      { name: pick(l, "Works", "作品"), path: "/projects/" },
    ]),
  ];
}

/* Same two strings as projects/index.html's static head, so the baked document
   and the live one never disagree for the default language. */
const docTitle = (l: Lang) =>
  pick(l, "Works — Eververdants", "作品索引 — Eververdants");
const docDescription = (l: Lang) =>
  pick(
    l,
    "The open-source index of Eververdants — a live ledger of every public repository, synced from GitHub. Tauri desktop tools, Rust services, TypeScript apps and Python experiments.",
    "Eververdants（万山青未阑）的个人开源项目索引，由 GitHub 自动同步。",
  );

function applySeo() {
  const l = lang();
  applyHead({
    title: docTitle(l),
    description: docDescription(l),
    path: "/projects/",
    ogType: "website",
    locale: l === "zh" ? "zh_CN" : "en_US",
    localeAlternate: l === "zh" ? ["en_US"] : ["zh_CN"],
    lang: l,
    alternates: [
      { hreflang: "en", href: "/projects/?lang=en" },
      { hreflang: "zh-Hans", href: "/projects/?lang=zh" },
      { hreflang: "x-default", href: "/projects/" },
    ],
    jsonLd: worksLd(l),
  });
}

/* ================= 滚动显现 ================= */
function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
  );
  document
    .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)")
    .forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) && r.bottom > 0) {
        el.style.transitionDelay = "0ms";
        requestAnimationFrame(() => el.classList.add("is-in"));
      } else {
        io.observe(el);
      }
    });
}

/* ================= 整体渲染 ================= */
/* renderSkeleton() runs once: it owns <site-topbar>, so a language change can
   re-render the body without touching the bar (the bar subscribes to prefs and
   repaints itself). renderBody() owns everything below it. */
function renderSkeleton() {
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <site-topbar active="works"></site-topbar>
    <main id="main">
      <section id="hero" class="hero"></section>
      <section id="featured" class="section"></section>
      <section id="index" class="section section--index">
        <div class="shell">
          <div class="section__head" data-reveal>
            <div class="section__heading">
              <span class="ring-mark" aria-hidden="true"></span>
              <div>
                <p class="kicker section__overline" id="index-overline"></p>
                <h2 class="display section__title" id="index-title"></h2>
              </div>
            </div>
            <p class="section__note">
              <span class="num" id="result-count"></span> · <span id="filed-label"></span>
            </p>
          </div>
          <div id="toolbar" class="toolbar glass-bar sq-xl" data-reveal style="--reveal-delay:60ms"></div>
          <div id="ledger" class="ledger glass-panel sq-xl" data-reveal style="--reveal-delay:120ms"></div>
        </div>
      </section>
    </main>
    <footer id="footer" class="footer"></footer>`;
}

function renderBody() {
  const u = t();
  document.getElementById("index-overline")!.textContent = u.indexOverline;
  document.getElementById("index-title")!.textContent = u.indexTitle;
  document.getElementById("filed-label")!.textContent = u.filed;
  renderHero();
  renderFeatured();
  renderToolbar();
  renderLedger();
  renderFooter();
}

function boot() {
  document.documentElement.classList.add("is-js");
  readUrl();
  renderSkeleton();
  renderBody();
  applySeo();
  initReveal();

  /* 语言改变（本站的 <site-topbar>、其它标签页、?lang= 覆盖）：重渲染正文与
     head，保留滚动位置。顶栏自己不在此列 —— 它订阅了 prefs。 */
  let rendered = lang();
  subscribePrefs((p) => {
    if (p.lang === rendered) return;
    rendered = p.lang;
    const y = window.scrollY;
    renderBody();
    applySeo();
    jumpTo(y);
    initReveal();
  });
}

boot();
