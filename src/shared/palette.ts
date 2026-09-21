/* <site-palette> — the ⌘K / Ctrl-K search across every sub-site.

   A personal site with four destinations fails a reader in one specific way:
   they know what they want but not which sub-site it lives on. This is the
   shortcut for that. It searches one flat list built at build time by
   scripts/build-search-index.mjs (essays in both languages, repositories,
   photo series, and the fixed pages), so it costs each bundle a few KB and one
   lazy fetch instead of importing three sub-sites' worth of data.

   Framework-free and light-DOM like <site-topbar>, so the vanilla-TS
   /projects entry gets the identical widget. Open it by dispatching a
   `site-search` click on the bar's search button, or just press Ctrl/Cmd-K. */

import { getPrefs, pick, subscribePrefs } from "./prefs";
import type { Lang } from "./prefs";

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
    noMatch: "Nothing matched.",
    hintUpdown: "to navigate",
    hintEnter: "to open",
    hintEsc: "to close",
    pages: "Pages",
    essays: "Writing",
    repos: "Works",
    photos: "Photographs",
  },
  zh: {
    placeholder: "搜索文章、仓库、摄影作品……",
    loading: "正在载入索引…",
    empty: "输入以搜索。",
    noMatch: "没有匹配结果。",
    hintUpdown: "切换",
    hintEnter: "打开",
    hintEsc: "关闭",
    pages: "页面",
    essays: "写作",
    repos: "作品",
    photos: "摄影",
  },
};

const GROUP_ORDER: Item["type"][] = ["page", "essay", "repo", "photo"];

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

class SitePalette extends HTMLElement {
  #dialog: HTMLDialogElement | null = null;
  #input: HTMLInputElement | null = null;
  #list: HTMLElement | null = null;
  #items: Item[] | null = null;
  #loading: Promise<void> | null = null;
  #rows: { item: Item; el: HTMLElement }[] = [];
  #cursor = 0;
  #unsub: (() => void) | null = null;

  connectedCallback(): void {
    this.innerHTML = `
      <dialog class="palette" aria-label="Search">
        <div class="palette__box">
          <div class="palette__field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>
            </svg>
            <input type="search" spellcheck="false" autocomplete="off"
              aria-controls="palette-results" />
            <kbd>Esc</kbd>
          </div>
          <div class="palette__results" id="palette-results" role="listbox"></div>
          <div class="palette__foot">
            <span><kbd>↑</kbd><kbd>↓</kbd> <i data-hint="updown"></i></span>
            <span><kbd>↵</kbd> <i data-hint="enter"></i></span>
            <span><kbd>Esc</kbd> <i data-hint="esc"></i></span>
          </div>
        </div>
      </dialog>`;

    this.#dialog = this.querySelector("dialog");
    this.#input = this.querySelector("input");
    this.#list = this.querySelector(".palette__results");

    this.#input.addEventListener("input", () => this.#render());
    this.#input.addEventListener("keydown", (e) => this.#onKey(e));
    this.#dialog.addEventListener("click", (e) => {
      if (e.target === this.#dialog) this.#dialog.close();
    });
    this.#dialog.addEventListener("close", () =>
      this.dispatchEvent(new CustomEvent("palette-close", { bubbles: true })),
    );

    this.#localise();
    this.#unsub = subscribePrefs(() => {
      this.#localise();
      this.#render();
    });

    addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.open();
      }
    });
    addEventListener("site-search", () => this.open());
  }

  disconnectedCallback(): void {
    this.#unsub?.();
    this.#unsub = null;
  }

  #localise(): void {
    const c = COPY[getPrefs().lang];
    this.#input.placeholder = c.placeholder;
    this.querySelectorAll<HTMLElement>("[data-hint]").forEach((el) => {
      el.textContent = c[`hint${el.dataset.hint}` as "hintUpdown"] ?? "";
    });
  }

  open(): void {
    if (!this.#dialog.open) this.#dialog.showModal();
    this.#input.value = "";
    this.#render();
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
      this.#dialog.close();
    }
  }

  #move(delta: number): void {
    if (!this.#rows.length) return;
    this.#cursor = (this.#cursor + delta + this.#rows.length) % this.#rows.length;
    this.#rows.forEach((r, i) =>
      r.el.classList.toggle("palette__row--on", i === this.#cursor),
    );
    this.#rows[this.#cursor].el.scrollIntoView({ block: "nearest" });
  }

  #render(): void {
    const c = COPY[getPrefs().lang];
    const lang = getPrefs().lang;
    const terms = this.#input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    this.#list.innerHTML = "";
    this.#rows = [];
    this.#cursor = 0;

    if (!this.#items) {
      this.#list.innerHTML = `<p class="palette__note">${c.loading}</p>`;
      return;
    }
    if (!terms.length) {
      this.#list.innerHTML = `<p class="palette__note">${c.empty}</p>`;
      return;
    }

    const hits = this.#items
      .map((item) => ({ item, s: score(item, terms, lang) }))
      .filter((h) => h.s >= 0)
      .sort((a, b) => b.s - a.s || (b.item.stars ?? 0) - (a.item.stars ?? 0));

    if (!hits.length) {
      this.#list.innerHTML = `<p class="palette__note">${c.noMatch}</p>`;
      return;
    }

    let n = 0;
    for (const type of GROUP_ORDER) {
      const group = hits.filter((h) => h.item.type === type).slice(0, 6);
      if (!group.length) continue;
      const head = document.createElement("p");
      head.className = "palette__group";
      head.textContent = c[type === "essay" ? "essays" : type === "repo" ? "repos" : type === "photo" ? "photos" : "pages"];
      this.#list.appendChild(head);

      for (const { item } of group) {
        const row = document.createElement("div");
        row.className = "palette__row";
        row.setAttribute("role", "option");
        const href =
          lang === "zh" && item.urlZh ? item.urlZh : item.url;
        row.innerHTML =
          `<a href="${href}"${item.external ? ' target="_blank" rel="noreferrer"' : ""}>` +
          `<span class="palette__title">${escapeHtml(item.title[lang])}</span>` +
          `<span class="palette__side">${escapeHtml(
            [item.label?.[lang], item.date, item.stars ? `★ ${item.stars}` : ""]
              .filter(Boolean)
              .join(" · "),
          )}</span>` +
          `</a>`;
        // Internal results close the palette and let the SPA router take the
        // click; external ones just open in a new tab.
        if (!item.external) {
          row.querySelector("a").addEventListener("click", () => this.#dialog.close());
        }
        this.#list.appendChild(row);
        this.#rows.push({ item, el: row });
        n++;
      }
    }
    if (n) this.#rows[0].el.classList.add("palette__row--on");
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
