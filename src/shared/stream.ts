/* Progressive (chunked) DOM insertion for renderer-produced HTML.
 *
 * Why this exists, and — more importantly — where it is NOT allowed to
 * run:
 *
 * An essay's body is renderer output (a markdown pipeline), not React
 * children, so it lands as one innerHTML assignment. On a long essay
 * that is one parse + one layout of the whole document before the
 * reader sees a single line. Splitting the insertion gets the first
 * two screens painted immediately and fills the rest while they read.
 *
 * The rule that keeps it honest: this only runs when the body arrives
 * *after* mount — i.e. an in-app navigation from the archive. Two paths
 * deliberately never stream:
 *
 *   · A deep link / a prerendered page. There the body IS the LCP
 *     element; chunking it would push first-contentful-paint later for
 *     the sake of an animation nobody asked for, and the build's
 *     prerender pass (scripts/prerender.mjs) snapshots the live DOM —
 *     a half-streamed body would be baked into the static HTML and
 *     shipped to crawlers as a truncated article.
 *   · A language swap. The reader keeps their place; the body must
 *     change in one commit or the restore maths lands on the wrong
 *     heading.
 *
 * Chunks are cut on top-level block boundaries (never inside a paragraph
 * or a code block) and inserted on idle, so a long essay never blocks a
 * frame and never competes with input. */

/** Rough characters per batch. Tuned so a batch is worth inserting (the
 *  per-batch overhead is a parse + a layout) but never long enough to
 *  itself become a jank frame. */
const BATCH_CHARS = 2600;

const idle: (cb: () => void) => number =
  typeof requestIdleCallback === "function"
    ? (cb) => requestIdleCallback(() => cb(), { timeout: 240 })
    : (cb) => window.setTimeout(cb, 16);

const cancelIdle: (h: number) => void =
  typeof cancelIdleCallback === "function"
    ? (h) => cancelIdleCallback(h)
    : (h) => window.clearTimeout(h);

interface StreamOptions {
  /** Insert the first batch synchronously and the rest on idle. When
   *  false the whole string goes in at once (see the header). */
  progressive?: boolean;
  /** Called after each batch with (inserted, total) blocks. */
  onBatch?: (done: number, total: number) => void;
  /** Called once, after the final batch. */
  onDone?: () => void;
  /** Incremented by the caller to abandon an in-flight stream (a new
   *  article arrived before the old one finished). */
  token?: { current: number };
}

/** Replace `el`'s contents with `html`, chunk by chunk. Returns a
 *  cancel function. */
export function streamHtml(
  el: HTMLElement,
  html: string,
  opts: StreamOptions = {},
): () => void {
  const mine = opts.token?.current ?? 0;
  const stale = () => (opts.token?.current ?? 0) !== mine;

  /* Parse off-document: a detached <template> costs no layout, so the
     whole essay is parsed once and then moved — rather than parsed in
     N pieces with N invalidations. */
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const blocks = Array.from(tpl.content.childNodes);

  const progressive = opts.progressive === true && blocks.length > 1;

  /* Below this size streaming is pure overhead: one small parse beats
     a scheduler round-trip. */
  if (!progressive || html.length < BATCH_CHARS * 1.5) {
    el.replaceChildren(...blocks.map((n) => n.cloneNode(true)));
    opts.onBatch?.(blocks.length, blocks.length);
    opts.onDone?.();
    return () => {};
  }

  /* Cut batches on node boundaries by accumulated weight. */
  const batches: (Node | null)[][] = [];
  let cur: (Node | null)[] = [];
  let weight = 0;
  for (const node of blocks) {
    cur.push(node);
    weight += (node.textContent ?? "").length;
    if (weight >= BATCH_CHARS) {
      batches.push(cur);
      cur = [];
      weight = 0;
    }
  }
  if (cur.length) batches.push(cur);

  /* First batch lands now — synchronously, in the same task as the
     caller, so the reader sees content on this frame. */
  el.replaceChildren(...(batches[0] as Node[]));
  opts.onBatch?.(1, batches.length);

  let i = 1;
  let handle = 0;
  const frag = document.createDocumentFragment();

  const step = () => {
    if (stale()) return;
    if (i >= batches.length) {
      opts.onDone?.();
      return;
    }
    const batch = batches[i++] as Node[];
    frag.append(...batch);
    el.appendChild(frag);
    opts.onBatch?.(i, batches.length);
    handle = idle(step);
  };

  handle = idle(step);

  return () => {
    cancelIdle(handle);
  };
}
