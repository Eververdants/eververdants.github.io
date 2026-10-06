/* <site-palette> — the ⌘K / Ctrl-K search across every sub-site.

   A personal site with four destinations fails a reader in one specific way:
   they know what they want but not which sub-site it lives on. This is the
   shortcut for that. It searches one flat list built at build time
   (essays in both languages, repositories, photo series, and the fixed
   pages), so it costs each bundle a few KB and one lazy fetch instead of
   importing three sub-sites' worth of data.

   Framework-free and light-DOM like <site-topbar>, so the vanilla-TS
   /projects entry gets the identical widget. Open it by dispatching a
   `site-search` click on the bar's search button, or just press Ctrl/Cmd-K.

   Five states, all of them designed rather than defaulted:

     loading   the index chunk is in flight (first open only)
     empty     nothing typed yet — show what is searchable and how
     results   grouped, scored, with the matched terms marked in ink
     no-match  nothing matched — say so, and say what was searched
     ready     the index is cached; typing is synchronous from here

   The one thing it must never do is block: the index fetch is the only
   await, it is fired on first open rather than on page load, and every
   keystroke after that is a filter over an in-memory array. */

import { getPrefs, subscribePrefs } from "./prefs";
import type { Lang } from "./prefs";
import { lockScroll, attachSmoothPort, refreshSmoothPort } from "./smooth";

interface Item {
  type: "essay" | "photo" | "repo" | "page";
  url: string;
  urlZh?: string;
  external?: boolean;
  title: { en: string; zh: string };
  label?: { en: string; zh: string };
  blurb?: { en: string; zh: string };
  date?: string;
  stars?: number;
}

const COPY: Record<Lang, Record<string, string>> = {
  en: {
    placeholder: "Search essays, repositories, photographs…",
    loading: "Loading index…",
    empty: "Type to search.",
    emptyHint: "Essays · repositories · photographs · pages",
    noMatch: "Nothing matched",
    hintUpdown: "to navigate",
    hintEnter: "to open",
    hintEsc: "to close",
    pages: "Pages",
    essays: "Writing",
    repos: "Works",
    photos: "Photographs",
    count: "result",
  },
  zh: {
    placeholder: "搜索文章、仓库、摄影作品……",
    loading: "正在载入索引…",
    empty: "输入以搜索。",
    emptyHint: "文章 · 仓库 · 摄影 · 页面",
    noMatch: "没有匹配结果",
    hintUpdown: "切换",
    hintEnter: "打开",
    hintEsc: "关闭",
    pages: "页面",
    essays: "写作",
    repos: "作品",
    photos: "摄影",
    count: "条结果",
  },
};

const GROUP_ORDER: Item["type"][] = ["page", "essay", "repo", "photo"];
const GROUP_KEY: Record<Item["type"], string> = {
  page: "pages",
  essay: "essays",
  repo: "repos",
  photo: "photos",
};
/** Cap per group so one noisy group cannot push the others off-screen. */
const PER_GROUP = 6;

async function loadIndex(): Promise<Item[]> {
  const res = await fetch("/search.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`search.json ${res.status}`);
  const data = (await res.json()) as { items: Item[] };
  return data.items ?? [];
}

/* Substring scoring, deliberately dumb and language-aware: a title hit beats
   a blurb hit, and every whitespace term must match somewhere. */
function score(item: Item, terms: string[], lang: Lang): number {
  if (!terms.length) return 0;
  const hay = [
    item.title[lang],
    item.title.en,
    item.title.zh,
    item.label?.[lang] ?? "",
    item.blurb?.[lang] ?? "",
  ]
    .join(" ")
    .toLowerCase();
  const titleHay = `${item.title[lang]} ${item.title.en} ${item.title.zh}`.toLowerCase();
  let total = 0;
  for (const t of terms) {
    if (titleHay.includes(t)) total += 3;
    else if (hay.includes(t)) total += 1;
    else return -1;
  }
  return total;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Escape `text` and wrap every occurrence of any term in a <mark>.
 *
 * Escaping happens per *slice*, never on the whole string first — the
 * obvious implementation (escape, then replace) would search inside
 * `&amp;` and friends and happily mark up an entity as if it were a
 * match. It also merges overlapping ranges, so two terms that hit the
 * same word produce one mark instead of nested ones.
 */
function markTerms(text: string, terms: string[]): string {
  const clean = terms.filter(Boolean);
  if (!clean.length) return escapeHtml(text);
  const lower = text.toLowerCase();

  const ranges: [number, number][] = [];
  for (const t of clean) {
    let from = 0;
    for (;;) {
      const i = lower.indexOf(t, from);
      if (i < 0) break;
      ranges.push([i, i + t.length]);
      from = i + t.length;
    }
  }
  if (!ranges.length) return escapeHtml(text);

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }

  let out = "";
  let at = 0;
  for (const [s, e] of merged) {
    if (s > at) out += escapeHtml(text.slice(at, s));
    out += `<mark class="palette__mark">${escapeHtml(text.slice(s, e))}</mark>`;
    at = e;
  }
  if (at < text.length) out += escapeHtml(text.slice(at));
  return out;
}

/** Home/End and plain printable keys must move the caret, not the row
 *  cursor — the palette hijacks Arrow/Tab/Enter and nothing else. */
const NAV_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "Tab",
  "Enter",
  "Escape",
]);

class SitePalette extends HTMLElement {
  #dialog: HTMLDialogElement | null = null;
  #input: HTMLInputElement | null = null;
  #list: HTMLElement | null = null;
  #items: Item[] | null = null;
  #loading: Promise<void> | null = null;
  #rows: { item: Item; el: HTMLElement }[] = [];
  #cursor = 0;
  #unsub: (() => void) | null = null;
  /** False once the dialog has actually been opened — keeps the scroll
   *  lock paired with a real open even if close() fires first. */
  #locked = false;
  /** Teardown of the result list's own smoothing instance, held while the
   *  dialog is open (see open()). */
  #detachPort: (() => void) | null = null;

  /* Window-level activators, bound as fields so disconnectedCallback can
     remove the exact functions it added — an element that is detached and
     reattached (or upgraded twice) would otherwise stack duplicate Ctrl-K
     handlers that fire `open()` once per stale registration. */
  #onWindowKey = (e: KeyboardEvent): void => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      this.open();
    }
    /* "/" as a search shortcut, the way every reader-facing app does it
       — but never inside a field, where "/" is just a character. */
    if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const el = document.activeElement as HTMLElement | null;
      const typing =
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);
      if (!typing) {
        e.preventDefault();
        this.open();
      }
    }
  };
  #onSearch = (): void => this.open();

  connectedCallback(): void {
    this.innerHTML = `
      <dialog class="palette" aria-label="Search">
        <div class="palette__frame">
          <div class="palette__box">
            <div class="palette__field">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>
              </svg>
              <input type="search" spellcheck="false" autocomplete="off"
                aria-controls="palette-results" aria-describedby="palette-status" />
              <kbd>Esc</kbd>
            </div>
            <p class="palette__status" id="palette-status" role="status"
              aria-live="polite"></p>
            <div class="palette__results" id="palette-results" role="listbox"
              aria-label="Search results"></div>
            <div class="palette__foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> <i data-hint="updown"></i></span>
              <span><kbd>↵</kbd> <i data-hint="enter"></i></span>
              <span><kbd>Esc</kbd> <i data-hint="esc"></i></span>
            </div>
          </div>
        </div>
      </dialog>`;

    this.#dialog = this.querySelector("dialog");
    this.#input = this.querySelector("input");
    this.#list = this.querySelector(".palette__results");
    /* The markup is the literal above, so all three exist; bail anyway so
       a drift degrades to "no palette" instead of a thrown TypeError. */
    if (!this.#dialog || !this.#input || !this.#list) return;

    this.#input.addEventListener("input", () => this.#render());
    this.#input.addEventListener("keydown", (e) => this.#onKey(e));
    /* Pointer hover must not fight the keyboard cursor: hovering a row
       moves the selection, which is what every command palette does and
       what a reader expects from a list they can also click. */
    this.#list.addEventListener("pointermove", (e) => {
      const row = (e.target as Element | null)?.closest?.(".palette__row");
      if (!row) return;
      const i = this.#rows.findIndex((r) => r.el === row);
      if (i >= 0 && i !== this.#cursor) this.#setCursor(i);
    });
    this.#dialog.addEventListener("click", (e) => {
      if (e.target === this.#dialog) this.#dialog?.close();
    });
    this.#dialog.addEventListener("close", () => {
      if (this.#locked) {
        this.#locked = false;
        lockScroll(false);
      }
      /* The instance is only useful while the dialog is up, and a fresh
         one measures the list correctly next time it opens. */
      this.#detachPort?.();
      this.#detachPort = null;
      this.dispatchEvent(new CustomEvent("palette-close", { bubbles: true }));
    });

    this.#localise();
    this.#unsub = subscribePrefs(() => {
      this.#localise();
      this.#render();
    });

    addEventListener("keydown", this.#onWindowKey);
    addEventListener("site-search", this.#onSearch);
  }

  disconnectedCallback(): void {
    this.#unsub?.();
    this.#unsub = null;
    removeEventListener("keydown", this.#onWindowKey);
    removeEventListener("site-search", this.#onSearch);
    /* An element pulled out of the document while open would otherwise
       leave the page frozen. */
    if (this.#locked) {
      this.#locked = false;
      lockScroll(false);
    }
    /* Same for the list's smoothing instance — it holds its own rAF. */
    this.#detachPort?.();
    this.#detachPort = null;
  }

  #localise(): void {
    const c = COPY[getPrefs().lang];
    if (!this.#input) return;
    this.#input.placeholder = c.placeholder;
    this.querySelectorAll<HTMLElement>("[data-hint]").forEach((el) => {
      const k = el.dataset.hint;
      if (k) el.textContent = c[`hint${k}`] ?? "";
    });
  }

  open(): void {
    if (!this.#dialog || !this.#input) return;
    if (!this.#dialog.open) this.#dialog.showModal();
    if (!this.#locked) {
      this.#locked = true;
      lockScroll(true);
    }
    this.#input.value = "";
    this.#render();
    /* The result list is its own scrollport and gets its own smoothing
       instance, created once the dialog is actually visible (a hidden box
       measures zero travel). Torn down on close. */
    if (!this.#detachPort && this.#list) {
      this.#detachPort = attachSmoothPort(this.#list);
    }
    this.#input.focus();
    if (!this.#items) {
      // A failed fetch leaves #items null so the next open retries, rather
      // than caching an empty index and disabling search for the session.
      this.#loading ??= loadIndex()
        .then((items) => {
          this.#items = items;
        })
        .catch(() => {})
        .finally(() => {
          this.#loading = null;
          this.#render();
        });
    }
  }

  #onKey(e: KeyboardEvent): void {
    if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      this.#move(1);
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      this.#move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      this.#rows[this.#cursor]?.el.querySelector<HTMLAnchorElement>("a")?.click();
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.#dialog?.close();
    } else if (NAV_KEYS.has(e.key)) {
      /* Any other navigation key belongs to the text field. */
    }
  }

  #setCursor(i: number): void {
    this.#cursor = i;
    this.#rows.forEach((r, k) => {
      const on = k === i;
      r.el.classList.toggle("palette__row--on", on);
      r.el.setAttribute("aria-selected", String(on));
    });
    const el = this.#rows[i]?.el;
    if (el?.id) this.#list?.setAttribute("aria-activedescendant", el.id);
    el?.scrollIntoView({ block: "nearest" });
  }

  #move(delta: number): void {
    if (!this.#rows.length) return;
    this.#setCursor(
      (this.#cursor + delta + this.#rows.length) % this.#rows.length,
    );
  }

  #status(text: string): void {
    const el = this.querySelector<HTMLElement>("#palette-status");
    if (el) el.textContent = text;
  }

  #render(): void {
    const c = COPY[getPrefs().lang];
    const lang = getPrefs().lang;
    if (!this.#list || !this.#input) return;
    const terms = this.#input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    this.#list.innerHTML = "";
    this.#list.removeAttribute("aria-activedescendant");
    this.#rows = [];
    this.#cursor = 0;

    /* ---- loading: the index chunk is still in flight ---- */
    if (!this.#items) {
      this.#status(c.loading);
      this.#list.innerHTML =
        `<p class="palette__note palette__note--loading" aria-hidden="true">` +
        `<span class="palette__dots"><i></i><i></i><i></i></span>${escapeHtml(c.loading)}</p>`;
      return;
    }

    /* ---- empty: nothing typed yet ---- */
    if (!terms.length) {
      this.#status("");
      this.#list.innerHTML =
        `<p class="palette__note">${escapeHtml(c.empty)}</p>` +
        `<p class="palette__hint">${escapeHtml(c.emptyHint)}</p>`;
      return;
    }

    const hits = this.#items
      .map((item) => ({ item, s: score(item, terms, lang) }))
      .filter((h) => h.s >= 0)
      .sort((a, b) => b.s - a.s || (b.item.stars ?? 0) - (a.item.stars ?? 0));

    /* ---- no match ---- */
    if (!hits.length) {
      this.#status(c.noMatch);
      this.#list.innerHTML =
        `<p class="palette__note">${escapeHtml(c.noMatch)}</p>` +
        `<p class="palette__hint">“${escapeHtml(terms.join(" "))}”</p>`;
      return;
    }

    let n = 0;
    for (const type of GROUP_ORDER) {
      const group = hits.filter((h) => h.item.type === type).slice(0, PER_GROUP);
      if (!group.length) continue;
      const head = document.createElement("p");
      head.className = "palette__group";
      head.textContent = c[GROUP_KEY[type]];
      this.#list.appendChild(head);

      for (const { item } of group) {
        const row = document.createElement("div");
        row.className = "palette__row";
        row.setAttribute("role", "option");
        row.setAttribute("aria-selected", "false");
        row.id = `palette-row-${n}`;
        const href =
          lang === "zh" && item.urlZh ? item.urlZh : item.url;
        row.innerHTML =
          `<a href="${href}"${item.external ? ' target="_blank" rel="noreferrer"' : ""} tabindex="-1">` +
          `<span class="palette__title">${markTerms(item.title[lang], terms)}</span>` +
          `<span class="palette__side">${escapeHtml(
            [item.label?.[lang], item.date, item.stars ? `★ ${item.stars}` : ""]
              .filter(Boolean)
              .join(" · "),
          )}</span>` +
          `</a>`;
        // Internal results close the palette and let the SPA router take the
        // click; external ones just open in a new tab.
        if (!item.external) {
          row.querySelector("a")?.addEventListener("click", () => this.#dialog?.close());
        }
        this.#list.appendChild(row);
        this.#rows.push({ item, el: row });
        n++;
      }
    }
    this.#status(`${n} ${c.count}`);
    if (n) this.#setCursor(0);
    /* The list is a scrollport with its own smoothing instance; rows
       changed, so its travel did too. No-op before the port exists. */
    if (this.#list) refreshSmoothPort(this.#list);
  }
}

/** Register <site-palette>. Safe from every entry; idempotent. */
export function definePalette(): void {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("site-palette")) {
    customElements.define("site-palette", SitePalette);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "site-palette": SitePalette;
  }
}
