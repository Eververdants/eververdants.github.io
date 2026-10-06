/* The pixel progress bar — the site's only in-page loading signal.
 *
 * It exists because an SPA scene swap (index → essay, filter → results)
 * and a lazily-imported essay chunk both take a moment that the old
 * page had no way to talk about: either the screen sat still and looked
 * broken, or it showed a blocking curtain.
 *
 * It is deliberately *not* a blocking overlay. Three pixels tall at the
 * very top of the viewport, it never covers a single line of content
 * and never eats a pointer event, so the reader can keep scrolling and
 * clicking while it runs. Compare with the cross-entry navigation
 * curtain (fx.ts), which does cover — that one is replacing the whole
 * document, this one is replacing a part of a page.
 *
 * Two states:
 *   known length  → the bar fills to a fraction (a streamed chunk whose
 *                   size we are estimating, a multi-step render).
 *   unknown       → a short run of blocks sweeps across (`.is-waiting`).
 *                   Never a bar creeping to a fake 90% and then jumping:
 *                   a progress bar that lies is worse than no bar.
 */

const ID = "px-progress";
/* Long enough to be seen, short enough that a fast swap does not flash.
   A bar that appears for 40ms reads as a glitch, not as feedback. */
const SHOW_DELAY = 90;

interface Bar {
  root: HTMLElement;
  fill: HTMLElement;
}

let bar: Bar | null = null;
let showTimer = 0;
let depth = 0;
let raf = 0;

function build(): Bar | null {
  const existing = document.getElementById(ID);
  if (existing) {
    const fill = existing.querySelector<HTMLElement>("i");
    if (fill) return { root: existing, fill };
    existing.remove();
  }
  const root = document.createElement("div");
  root.id = ID;
  root.setAttribute("aria-hidden", "true");
  const fill = document.createElement("i");
  root.appendChild(fill);
  /* Appended to <html>, not <body>: body is the element the boot
     dissolve animates, and a fixed child of an animating element gets
     promoted into its own layer for no reason. */
  document.documentElement.appendChild(root);
  return { root, fill };
}

/** Show the bar. Nested calls are counted — the outermost one owns it. */
export function startProgress(): void {
  if (typeof document === "undefined") return;
  bar ??= build();
  if (!bar) return;
  depth++;
  if (depth > 1) return;
  if (showTimer) clearTimeout(showTimer);
  /* Delay the first paint so a chunk served from cache — the common
     case on a second visit — produces no bar at all. */
  showTimer = window.setTimeout(() => {
    showTimer = 0;
    if (!bar) return;
    bar.fill.style.transform = "scaleX(0.08)";
    bar.root.classList.add("is-on", "is-waiting");
  }, SHOW_DELAY);
}

/** Fill to a fraction. Also drops the indeterminate sweep. */
export function setProgress(p: number): void {
  if (!bar || depth === 0) return;
  const v = Math.min(1, Math.max(0.04, p));
  bar.root.classList.remove("is-waiting");
  bar.fill.style.transform = `scaleX(${v})`;
}

/** Run the bar out to 100% and take it away. */
export function endProgress(): void {
  if (typeof document === "undefined") return;
  depth = Math.max(0, depth - 1);
  if (depth > 0 || !bar) return;
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = 0;
  }
  bar.root.classList.remove("is-waiting");
  bar.fill.style.transform = "scaleX(1)";
  /* Hold the full bar for one beat so the eye registers completion
     instead of seeing it vanish mid-fill. */
  window.setTimeout(() => {
    if (!bar || depth > 0) return;
    bar.root.classList.remove("is-on");
    /* Reset after the fade-out, not during — resetting immediately
       would animate the fill backwards through the fade. */
    window.setTimeout(() => {
      if (bar && depth === 0) bar.fill.style.transform = "scaleX(0)";
    }, 180);
  }, 160);
}

/** A stepped fill for progressive DOM work: n blocks rendered out of
 *  total, drawn on a rAF so a synchronous render loop still paints
 *  between chunks. Used by the article's streamed body. */
export function stepProgress(done: number, total: number): void {
  if (!bar || depth === 0) return;
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    raf = 0;
    setProgress(total > 0 ? done / total : 1);
  });
}
