import "./style.css";
import data from "./data/repos.json";
import type { Repo, Dataset } from "./lib/types";
import { langColor } from "./lib/langs";
import { fmtCount, timeAgo, lastActive, esc } from "./lib/format";
import { ui, repoDesc, type Lang } from "./lib/i18n";
import { initSmoothScroll } from "../effects/smoothScroll";
import { initScrollbar } from "../effects/scrollbar";
import { runThemeWipe } from "../effects/themeWipe";

const d = data as unknown as Dataset;
const repos: Repo[] = d.repos;

/* ================= 偏好：与博客打通（共享 blog-lang / blog-theme） ================= */
function readPrefs() {
  let lang: Lang = "en";
  let theme: "light" | "dark" = "light";
  try {
    if (document.documentElement.lang === "zh") lang = "zh";
    const t = document.documentElement.dataset.theme;
    if (t === "dark" || t === "light") theme = t;
  } catch {}
  return { lang, theme };
}
function persistLang(lang: Lang) {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem("blog-lang", lang);
  } catch {}
}
function persistTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("blog-theme", theme);
  } catch {}
}

/* ================= 状态 ================= */
type SortKey = "updated" | "stars" | "name";
const state = {
  q: "",
  filterLang: "ALL",
  sort: "updated" as SortKey,
};

const t = () => ui[document.documentElement.lang === "zh" ? "zh" : "en"];
let lenisHandle: ReturnType<typeof initSmoothScroll> = null;

/* ================= 数字滚动 ================= */
function countUp(el: HTMLElement, target: number, duration = 900) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = String(target);
    return;
  }
  const t0 = performance.now();
  const ease = (p: number) => 1 - Math.pow(1 - p, 3);
  const tick = (now: number) => {
    const p = Math.min((now - t0) / duration, 1);
    el.textContent = String(Math.round(ease(p) * target));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ================= 滚动到顶 ================= */
function scrollTop() {
  if (lenisHandle?.lenis) lenisHandle.lenis.scrollTo(0);
  else window.scrollTo(0, 0);
}

/* ================= 控制簇 ================= */
function renderControls() {
  const el = document.getElementById("controls")!;
  const { lang, theme } = readPrefs();
  el.innerHTML = `
    <div class="controls__cap">
      <div class="lang-pair" aria-label="Language">
        <span class="lang-underline" style="transform:translateX(${lang === "zh" ? "100%" : "0"})"></span>
        <button class="lang-btn" data-lang="en" aria-pressed="${lang === "en"}" title="English">EN</button>
        <button class="lang-btn" data-lang="zh" aria-pressed="${lang === "zh"}" title="中文">中</button>
      </div>
      <span class="controls__divider" aria-hidden="true"></span>
      <button class="theme-btn" id="theme-btn" type="button" aria-label="${theme === "light" ? t().themeDark : t().themeLight}" title="${theme === "light" ? "Dark" : "Light"}">
        <span class="theme-icon ${theme === "dark" ? "is-off" : "is-on"}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7"/></svg>
        </span>
        <span class="theme-icon ${theme === "dark" ? "is-on" : "is-off"}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 14.2A8.3 8.3 0 0 1 9.8 3.8a8.3 8.3 0 1 0 10.4 10.4Z"/></svg>
        </span>
      </button>
    </div>`;

  el.querySelectorAll(".lang-btn").forEach((b) => {
    b.addEventListener("click", () => {
      const next: Lang = (b as HTMLElement).dataset.lang as Lang;
      if (next === document.documentElement.lang) return;
      persistLang(next);
      const y = window.scrollY;
      render();
      if (lenisHandle?.lenis) lenisHandle.lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
      initReveal();
    });
  });

  const btn = el.querySelector("#theme-btn") as HTMLButtonElement;
  btn.addEventListener("click", (e) => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    const r = btn.getBoundingClientRect();
    runThemeWipe(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    persistTheme(next);
    // 图标状态跟随
    btn.querySelectorAll(".theme-icon").forEach((i, k) => {
      const on = (k === 0) === (next === "light");
      i.classList.toggle("is-on", on);
      i.classList.toggle("is-off", !on);
    });
    btn.setAttribute("aria-label", next === "light" ? t().themeDark : t().themeLight);
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
    <div class="wrap">
      <div class="hero__overline mono" data-reveal>${esc(u.overline(new Date().getFullYear()))}</div>
      <h1 class="hero__title" data-reveal style="--reveal-delay:70ms">${esc(u.title)}</h1>
      <div class="hero__row" data-reveal style="--reveal-delay:120ms">
        <p class="hero__sub">${esc(u.sub)}</p>
        <a class="home-btn" href="/">${esc(u.mainSite)} <span aria-hidden="true">↗</span></a>
      </div>
      <div class="hero__meta" data-reveal style="--reveal-delay:170ms">
        <div class="meta-item"><b data-count="${meta.count}"><em>·</em>0</b><span class="mono">${esc(u.metaRepos)}</span></div>
        <div class="meta-item"><b data-count="${stars}"><em>·</em>0</b><span class="mono">${esc(u.metaStars)}</span></div>
        <div class="meta-item"><b data-count="${langs}"><em>·</em>0</b><span class="mono">${esc(u.metaLangs)}</span></div>
      </div>
    </div>`;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.querySelectorAll("[data-count]").forEach((n) => {
            countUp(n as HTMLElement, Number((n as HTMLElement).dataset.count || 0));
          });
          io.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  io.observe(el);
}

/* ================= 精选 ================= */
function renderFeatured() {
  const featured = repos.filter((r) => r.featured).slice(0, 3);
  const el = document.getElementById("featured")!;
  const u = t();
  el.innerHTML = `
    <div class="wrap">
      <div class="section__head" data-reveal>
        <div>
          <span class="section__overline mono">${esc(u.featuredOverline)}</span>
          <h2 class="section__title">${esc(u.featuredTitle)}</h2>
        </div>
        <span class="section__note mono">${esc(u.hoverHint)}</span>
      </div>
      <div class="featured" data-reveal style="--reveal-delay:90ms">
        ${featured
          .map(
            (r, i) => `
          <a class="feat" href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="Open ${esc(r.name)}">
            <div class="feat__media">
              <span class="feat__idx mono">${String(i + 1).padStart(2, "0")}</span>
              ${r.thumb ? `<img src="${esc(r.thumb)}" alt="${esc(r.name)}" loading="lazy"/>` : ""}
            </div>
            <div class="feat__body">
              <span class="feat__tag mono">${esc(r.tag || r.language)}</span>
              <h3 class="feat__name">${esc(r.name)}<span class="arrow">↗</span></h3>
              <p class="feat__desc">${esc(repoDesc(langNow(), r.description, r.blurbEn, r.blurbZh))}</p>
              <div class="feat__meta">
                <span class="mono lang-chip"><span class="lang-dot" style="background:${langColor(r.language)}"></span>${esc(r.language)}</span>
                <span class="mono">★ ${fmtCount(r.stars)}</span>
                <span class="mono">↺ ${timeAgo(langNow(), r.pushedAt)}</span>
              </div>
            </div>
          </a>`
          )
          .join("")}
      </div>
    </div>`;
}

/* ================= 台账 ================= */
function langNow(): Lang {
  return document.documentElement.lang === "zh" ? "zh" : "en";
}

function filtered(): Repo[] {
  let list = repos.filter((r) => state.filterLang === "ALL" || r.language === state.filterLang);
  if (state.q.trim()) {
    const q = state.q.trim().toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.blurbEn || "").toLowerCase().includes(q) ||
        (r.blurbZh || "").toLowerCase().includes(q) ||
        r.language.toLowerCase().includes(q) ||
        r.topics.some((x) => x.toLowerCase().includes(q))
    );
  }
  if (state.sort === "updated") list = [...list].sort((a, b) => lastActive(b) - lastActive(a));
  if (state.sort === "stars") list = [...list].sort((a, b) => b.stars - a.stars);
  if (state.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
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
      <button class="chip" type="button" data-lang="ALL" aria-pressed="${state.filterLang === "ALL"}">${esc(u.all)} <span class="cnt">${repos.length}</span></button>
      ${langs
        .map(
          (l) =>
            `<button class="chip" type="button" data-lang="${esc(l.lang)}" aria-pressed="${state.filterLang === l.lang}">${esc(l.lang)} <span class="cnt">${l.count}</span></button>`
        )
        .join("")}
    </div>
    <div class="sort" role="group" aria-label="sort">
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
    c.setAttribute("aria-pressed", String((c as HTMLElement).dataset.lang === state.filterLang));
  });
  document.querySelectorAll("#toolbar .sort__btn").forEach((b) => {
    b.setAttribute("aria-pressed", String((b as HTMLElement).dataset.sort === state.sort));
  });
}

function renderLedger() {
  const list = filtered();
  const u = t();
  const lang = langNow();
  const el = document.getElementById("ledger")!;
  const resultCount = document.getElementById("result-count")!;
  resultCount.textContent = `${list.length} / ${repos.length}`;

  if (!list.length) {
    el.innerHTML = `
      <div class="empty">
        <div class="empty__title">${esc(u.emptyTitle)}</div>
        <div class="empty__sub">${esc(u.emptySub)}</div>
        <button type="button" id="clear-filters">${esc(u.clear)}</button>
      </div>`;
    el.querySelector("#clear-filters")!.addEventListener("click", () => {
      state.q = "";
      state.filterLang = "ALL";
      const input = document.getElementById("search-input") as HTMLInputElement | null;
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
      <span class="row__idx">${String(i + 1).padStart(2, "0")}</span>
      <div class="row__main">
        <div class="row__name">
          ${esc(r.name)}
          ${r.tag ? `<span class="row__tag">${esc(r.tag)}</span>` : ""}
          ${r.archived ? `<span class="row__tag" style="border-color:var(--border);color:var(--faint)">${esc(u.archived)}</span>` : ""}
        </div>
        <p class="row__desc">${esc(repoDesc(lang, r.description, r.blurbEn, r.blurbZh)) || `<span style="color:var(--fainter)">${esc(u.noDesc)}</span>`}</p>
        ${
          r.topics.length
            ? `<div class="row__topics">${r.topics.slice(0, 4).map((x) => `<span class="row__topic">${esc(x)}</span>`).join("")}</div>`
            : ""
        }
      </div>
      <div class="row__meta">
        <span class="mono lang-chip"><span class="lang-dot" style="background:${langColor(r.language)}"></span>${esc(r.language)}</span>
        <span class="mono">★ ${fmtCount(r.stars)}</span>
        <span class="mono">↺ ${timeAgo(lang, r.pushedAt)}</span>
        <span class="row__link">${esc(u.open)} <span class="arrow">↗</span></span>
      </div>
    </a>`
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
  const lang = p.get("lang");
  state.filterLang = lang && repos.some((r) => r.language === lang) ? lang : "ALL";
  const s = p.get("sort");
  state.sort = s === "stars" || s === "name" ? s : "updated";
}

/* ================= 页脚 ================= */
function renderFooter() {
  const el = document.getElementById("footer")!;
  const u = t();
  el.innerHTML = `
    <div class="wrap footer__grid">
      <span class="footer__sign">Eververdants <span class="mono" style="color:var(--faint)">· 万山青未阑</span></span>
      <nav class="footer__links">
        <a class="navlink" href="#top" id="top-link">↑ ${esc(u.backHome)}</a>
        <a class="navlink" href="https://eververdants.github.io/" target="_blank" rel="noopener">${esc(u.mainSite)} ↗</a>
        <a class="navlink" href="https://github.com/Eververdants" target="_blank" rel="noopener">${esc(u.github)} ↗</a>
      </nav>
    </div>`;
  el.querySelector("#top-link")!.addEventListener("click", (e) => {
    e.preventDefault();
    scrollTop();
  });
}

/* ================= JSON-LD（SEO：CollectionPage + ItemList） ================= */
function injectJsonLd() {
  const itemList = repos.map((r, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "SoftwareSourceCode",
      name: r.name,
      description: r.blurbZh || r.blurbEn || r.description || undefined,
      codeRepository: r.url,
      programmingLanguage: r.language === "Markdown" ? undefined : r.language,
      author: { "@type": "Person", name: "Eververdants" },
    },
  }));
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "WORKS INDEX — Eververdants",
      alternateName: "作品索引",
      url: "https://eververdants.github.io/projects/",
      inLanguage: ["en", "zh-Hans"],
      isPartOf: { "@type": "WebSite", name: "Eververdants", url: "https://eververdants.github.io/" },
      mainEntity: {
        "@type": "ItemList",
        name: "Open-source projects by Eververdants",
        itemListElement: itemList,
      },
    },
  ];
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);
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
    { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const r = (el as HTMLElement).getBoundingClientRect();
    const inView = r.top < (window.innerHeight || 800) && r.bottom > 0;
    if (inView) {
      (el as HTMLElement).style.transitionDelay = "0ms";
      requestAnimationFrame(() => el.classList.add("is-in"));
    } else {
      io.observe(el);
    }
  });
}

/* ================= 整体渲染 ================= */
function render() {
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <div class="bg-grid" aria-hidden="true"></div>
    <div id="controls" class="controls"></div>
    <main>
      <section id="hero" class="hero"></section>
      <section id="featured" class="section"></section>
      <section id="index" class="section">
        <div class="wrap">
          <div class="section__head" data-reveal>
            <div>
              <span class="section__overline mono" id="index-overline"></span>
              <h2 class="section__title" id="index-title"></h2>
            </div>
            <span class="section__note mono"><span id="result-count"></span> · ${esc(t().filed)}</span>
          </div>
          <div id="toolbar" data-reveal style="--reveal-delay:60ms"></div>
          <div id="ledger" data-reveal style="--reveal-delay:120ms"></div>
        </div>
      </section>
    </main>
    <footer id="footer" class="footer"></footer>`;

  document.getElementById("index-overline")!.textContent = t().indexOverline;
  document.getElementById("index-title")!.textContent = t().indexTitle;
  renderControls();
  renderHero();
  renderFeatured();
  renderToolbar();
  renderLedger();
  renderFooter();
}

function boot() {
  document.documentElement.classList.add("is-js");
  readUrl();
  render();
  injectJsonLd();
  initReveal();

  /* 自定义滚动条：挂在 #app 之外，语言切换重渲染不重建（避免事件丢失） */
  const barEl = document.createElement("div");
  barEl.id = "scrollbar";
  barEl.setAttribute("aria-hidden", "true");
  barEl.innerHTML = '<div id="scrollbar-thumb"></div>';
  document.body.appendChild(barEl);

  /* 平滑滚动 + 滚动条（与主站/博客同款） */
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  lenisHandle = initSmoothScroll(reduced);
  const thumb = document.getElementById("scrollbar-thumb");
  if (barEl && thumb) initScrollbar(barEl, thumb, lenisHandle?.lenis ?? null);
}

boot();
