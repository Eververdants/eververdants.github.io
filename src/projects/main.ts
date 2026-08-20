import "./style.css";
import data from "./data/repos.json";
import type { Repo, Dataset } from "./lib/types";
import { langColor } from "./lib/langs";
import { fmtCount, timeAgo, lastActive, esc } from "./lib/format";

const d = data as unknown as Dataset;
const repos: Repo[] = d.repos;

/* ================= 主题 ================= */
function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle") as HTMLButtonElement;
  const set = (t: string) => {
    root.dataset.theme = t;
    try {
      localStorage.setItem("windex-theme", t);
    } catch {}
    btn.setAttribute("aria-pressed", String(t === "dark"));
    btn.setAttribute("aria-label", t === "dark" ? "切换到浅色" : "切换到深色");
  };
  btn.addEventListener("click", () => set(root.dataset.theme === "dark" ? "light" : "dark"));
  set(root.dataset.theme || "dark");
}

/* ================= 数字滚动 ================= */
function countUp(el: HTMLElement, target: number, duration = 1100) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    el.textContent = String(target);
    return;
  }
  const t0 = performance.now();
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const tick = (now: number) => {
    const p = Math.min((now - t0) / duration, 1);
    el.textContent = String(Math.round(ease(p) * target));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ================= 顶栏 / Hero / 页脚 ================= */
function renderTopbar() {
  const el = document.getElementById("topbar")!;
  el.innerHTML = `
    <div class="wrap topbar__inner">
      <a class="brand" href="#top" aria-label="回到顶部">
        <span class="brand__name">Eververdants<em>.</em></span>
        <span class="brand__sub mono">WORKS INDEX</span>
      </a>
      <div class="topbar__right">
        <a class="navlink" href="https://eververdants.github.io/blog/" target="_blank" rel="noopener">Blog ↗</a>
        <a class="navlink" href="https://eververdants.github.io/" target="_blank" rel="noopener">Site ↗</a>
        <a class="navlink" href="https://github.com/Eververdants" target="_blank" rel="noopener">GitHub ↗</a>
        <button id="theme-toggle" class="theme-toggle" type="button" aria-label="切换主题">
          <svg class="ic-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <circle cx="12" cy="12" r="4.2"/>
            <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"/>
          </svg>
          <svg class="ic-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"/>
          </svg>
        </button>
      </div>
    </div>`;
  const inner = el.querySelector(".topbar__inner")! as HTMLElement;
  inner.style.cssText = "display:flex;align-items:center;justify-content:space-between;height:100%";
}

function renderHero() {
  const meta = d._meta;
  const langs = new Set(repos.map((r) => r.language)).size;
  const stars = repos.reduce((s, r) => s + r.stars, 0);
  const el = document.getElementById("hero")!;
  el.innerHTML = `
    <div class="wrap">
      <div class="hero__overline mono" data-reveal>作品索引 · OPEN-SOURCE INDEX · EST. 2025</div>
      <h1 class="hero__title" data-reveal style="--reveal-delay:60ms">Everything<br/>I've <em>shipped.</em></h1>
      <div class="hero__row">
        <p class="hero__sub" data-reveal style="--reveal-delay:120ms">
          A live index of my open-source works — names, languages and stars pulled
          straight from GitHub.
          <span class="zh">万山青未阑的个人开源项目台账：由 GitHub API 自动同步，新仓库会定期自动收录。</span>
        </p>
        <div class="stats" data-reveal style="--reveal-delay:180ms">
          <div class="stat">
            <span class="stat__num" data-count="${meta.count}" data-suffix="">0</span>
            <span class="stat__label mono">Repositories</span>
          </div>
          <div class="stat">
            <span class="stat__num" data-count="${stars}" data-suffix="">0</span>
            <span class="stat__label mono">Stars</span>
          </div>
          <div class="stat">
            <span class="stat__num" data-count="${langs}" data-suffix="">0</span>
            <span class="stat__label mono">Languages</span>
          </div>
        </div>
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

function renderFeatured() {
  const featured = repos.filter((r) => r.featured).slice(0, 3);
  const el = document.getElementById("featured")!;
  el.innerHTML = `
    <div class="wrap">
      <div class="section__head" data-reveal>
        <div>
          <span class="section__overline mono">[ FEATURED · 精选 ]</span>
          <h2 class="section__title">Flagship works.</h2>
        </div>
        <span class="section__note mono">Hover to reveal · 悬停显色</span>
      </div>
      <div class="featured" data-reveal style="--reveal-delay:100ms">
        ${featured
          .map(
            (r, i) => `
          <a class="feat" href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="打开 ${esc(r.name)}">
            <div class="feat__media">
              <span class="feat__idx mono">${String(i + 1).padStart(2, "0")}</span>
              ${r.thumb ? `<img src="${esc(r.thumb)}" alt="${esc(r.name)} 界面截图" loading="lazy"/>` : ""}
            </div>
            <div class="feat__body">
              <span class="feat__tag mono">${esc(r.tag || r.language)}</span>
              <h3 class="feat__name">${esc(r.name)}<span class="arrow">↗</span></h3>
              <p class="feat__blurb">${esc(r.blurb || r.description)}</p>
              <div class="feat__meta">
                <span class="meta-item"><span class="lang-dot" style="background:${langColor(r.language)}"></span>${esc(r.language)}</span>
                <span class="meta-item">★ ${fmtCount(r.stars)}</span>
                <span class="meta-item">↺ ${timeAgo(r.pushedAt)}</span>
              </div>
            </div>
          </a>`
          )
          .join("")}
      </div>
    </div>`;
}

/* ================= 台账（搜索 / 筛选 / 排序） ================= */
type SortKey = "updated" | "stars" | "name";

const state = {
  q: "",
  lang: "ALL",
  sort: "updated" as SortKey,
};

function filtered(): Repo[] {
  let list = repos.filter((r) => state.lang === "ALL" || r.language === state.lang);
  if (state.q.trim()) {
    const q = state.q.trim().toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.blurb?.toLowerCase().includes(q) ||
        r.language.toLowerCase().includes(q) ||
        r.topics.some((t) => t.toLowerCase().includes(q))
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

function renderLedger() {
  const list = filtered();
  const el = document.getElementById("ledger")!;
  const resultCount = document.getElementById("result-count")!;
  resultCount.textContent = `${list.length} / ${repos.length}`;

  if (!list.length) {
    el.innerHTML = `
      <div class="empty">
        <div class="empty__title">Nothing filed here.</div>
        <div class="empty__sub">没有匹配的项目 —— 换个关键词或清空筛选。</div>
        <button type="button" id="clear-filters">Clear · 清空</button>
      </div>`;
    el.querySelector("#clear-filters")!.addEventListener("click", () => {
      state.q = "";
      state.lang = "ALL";
      (document.getElementById("search-input") as HTMLInputElement).value = "";
      document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.textContent === "ALL")));
      syncUrl();
      renderLedger();
    });
    return;
  }

  el.innerHTML = list
    .map(
      (r, i) => `
    <a class="row" href="${esc(r.url)}" target="_blank" rel="noopener" style="--row-i:${Math.min(i, 12)}"
       aria-label="在 GitHub 打开 ${esc(r.name)}">
      <span class="row__idx">${String(i + 1).padStart(2, "0")}</span>
      <div class="row__main">
        <div class="row__name">
          ${esc(r.name)}
          ${r.tag ? `<span class="row__tag">${esc(r.tag)}</span>` : ""}
          ${r.archived ? `<span class="row__tag" style="border-color:var(--faint);color:var(--muted)">ARCHIVED</span>` : ""}
        </div>
        <p class="row__desc">${esc(r.blurb || r.description) || `<span style="color:var(--faint)">No description — 暂无描述</span>`}</p>
        ${
          r.topics.length
            ? `<div class="row__topics">${r.topics.slice(0, 4).map((t) => `<span class="row__topic">${esc(t)}</span>`).join("")}</div>`
            : ""
        }
      </div>
      <div class="row__meta">
        <span class="meta-item"><span class="lang-dot" style="background:${langColor(r.language)}"></span>${esc(r.language)}</span>
        <span class="meta-item">★ ${fmtCount(r.stars)}</span>
        <span class="meta-item">↺ ${timeAgo(r.pushedAt)}</span>
        <span class="row__link">Open <span class="arrow">↗</span></span>
      </div>
    </a>`
    )
    .join("");
}

function renderToolbar() {
  const langs = langOptions();
  const el = document.getElementById("toolbar")!;
  el.innerHTML = `
    <label class="search">
      <span class="search__icon" aria-hidden="true">⌕</span>
      <input id="search-input" type="search" placeholder="Search index · 搜索项目 / 语言 / 标签" autocomplete="off" spellcheck="false"/>
    </label>
    <div class="chips" role="group" aria-label="按语言筛选">
      <button class="chip" type="button" data-lang="ALL" aria-pressed="true">All <span class="cnt">${repos.length}</span></button>
      ${langs
        .map(
          (l) =>
            `<button class="chip" type="button" data-lang="${esc(l.lang)}" aria-pressed="false">${esc(l.lang)} <span class="cnt">${l.count}</span></button>`
        )
        .join("")}
    </div>
    <div class="sort" role="group" aria-label="排序方式">
      <button class="sort__btn" type="button" data-sort="updated" aria-pressed="true">Updated</button>
      <button class="sort__btn" type="button" data-sort="stars" aria-pressed="false">Stars</button>
      <button class="sort__btn" type="button" data-sort="name" aria-pressed="false">Name</button>
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
      state.lang = (c as HTMLElement).dataset.lang || "ALL";
      el.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      syncUrl();
      renderLedger();
    });
  });

  el.querySelectorAll(".sort__btn").forEach((b) => {
    b.addEventListener("click", () => {
      state.sort = (b as HTMLElement).dataset.sort as SortKey;
      el.querySelectorAll(".sort__btn").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      syncUrl();
      renderLedger();
    });
  });
}

/* ================= URL 状态（可分享） ================= */
function syncUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.lang !== "ALL") p.set("lang", state.lang);
  if (state.sort !== "updated") p.set("sort", state.sort);
  const qs = p.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

function readUrl() {
  const p = new URLSearchParams(location.search);
  state.q = p.get("q") || "";
  const lang = p.get("lang");
  state.lang = lang && repos.some((r) => r.language === lang) ? lang : "ALL";
  const s = p.get("sort");
  state.sort = s === "stars" || s === "name" ? s : "updated";
}

/* ================= 页脚 ================= */
function renderFooter() {
  const meta = d._meta;
  const stars = repos.reduce((s, r) => s + r.stars, 0);
  const el = document.getElementById("footer")!;
  el.innerHTML = `
    <div class="wrap footer__grid">
      <div>
        <div class="footer__line1">
          <span class="footer__sign">Eververdants</span>
          <span class="mono" style="color:var(--muted)">· 万山青未阑</span>
        </div>
        <p class="footer__meta mono">
          ${meta.count} REPOSITORIES · ${stars} STARS · SYNCED ${new Date(meta.fetchedAt).toLocaleString("zh-CN")}
          <br/>Data pulled via <em style="font-style:normal;color:var(--accent)">gh repo list</em> — 由 GitHub API 自动同步
        </p>
      </div>
      <nav class="footer__links">
        <a class="navlink" href="https://github.com/Eververdants" target="_blank" rel="noopener">GitHub ↗</a>
        <a class="navlink" href="https://eververdants.github.io/" target="_blank" rel="noopener">Main Site ↗</a>
        <a class="navlink" href="https://eververdants.github.io/blog/" target="_blank" rel="noopener">Blog ↗</a>
      </nav>
    </div>`;
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
    { threshold: 0.05, rootMargin: "0px 0px -3% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    // 初始可见的元素：下一帧标记 is-in，--reveal-delay 改为 0 避免动画延迟
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

/* ================= 入口 ================= */
function boot() {
  // 启动 JS 后再让 [data-reveal] 默认隐藏，配合 IO 触发显现
  document.documentElement.classList.add("is-js");
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <div class="bg-fx" aria-hidden="true"></div>
    <header id="topbar"></header>
    <main id="top">
      <section id="hero"></section>
      <section id="featured" class="section"></section>
      <section id="index" class="section">
        <div class="wrap">
          <div class="section__head" data-reveal>
            <div>
              <span class="section__overline mono">[ INDEX · 全量台账 ]</span>
              <h2 class="section__title">The full ledger.</h2>
            </div>
            <span class="section__note mono"><span id="result-count"></span> FILED · 收录</span>
          </div>
          <div id="toolbar" data-reveal style="--reveal-delay:80ms"></div>
          <div id="ledger" data-reveal style="--reveal-delay:140ms"></div>
        </div>
      </section>
    </main>
    <footer id="footer"></footer>`;

  readUrl();
  renderTopbar();
  renderHero();
  renderFeatured();
  renderToolbar();
  renderLedger();
  renderFooter();
  initTheme();
  initReveal();
}

boot();
