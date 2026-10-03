/* Shared motion engine — one implementation for all five entries.
 *
 * Framework-free on purpose (the /projects entry is vanilla TS and the
 * React entries just call this once from their bootstrap). It wires three
 * decorations, all of them no-ops when the reader asks for less motion:
 *
 *   1. scroll reveals   — [data-fx] dissolves in once, on a stepped
 *                         timing; [data-reveal] (the projects entry's
 *                         existing hooks) gets the same treatment under
 *                         its own .is-in class.
 *   2. character reveal — [data-fx="chars"] splits its text into cells
 *                         that dissolve in one after another. The
 *                         original string is preserved on aria-label so
 *                         the accessible name never changes.
 *   3. ghost cursor     — a hollow square trailing the pointer, fine
 *                         pointers only.
 *
 * Everything the CSS keys off lives behind `html.fx-on`, added here —
 * without this module the page renders fully visible, as before.
 *
 * The entries are SPAs: React mounts after this module runs and re-renders
 * scenes (blog index ↔ article, language switches) long after. So the
 * reveal set is not read once — a MutationObserver keeps adopting new
 * [data-fx] / [data-reveal] elements as they appear. */

import { endProgress, startProgress } from "./progress";

const REDUCE = "(prefers-reduced-motion: reduce)";
const COARSE = "(pointer: coarse)";

/** True when the visitor asked the system for less motion. */
function reducedMotion(): boolean {
  try {
    return matchMedia(REDUCE).matches;
  } catch {
    return true; /* no matchMedia — assume the safe case */
  }
}

function finePointer(): boolean {
  try {
    return !matchMedia(COARSE).matches;
  } catch {
    return false;
  }
}

/* ---------- character reveal ---------- */

/** Wrap every character of the element's direct text in a .fx-ch span
 * with its grid index. Runs once per element, before it is revealed.
 * The element must hold plain text only — apply data-fx="chars" to
 * short, static names. */
function splitChars(el: HTMLElement): void {
  if (el.dataset.fxSplit === "done") return;
  el.dataset.fxSplit = "done";
  const text = el.textContent ?? "";
  if (!text || text.length > 42) return;
  el.setAttribute("aria-label", text);
  el.textContent = "";
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "fx-ch";
    span.style.setProperty("--fx-i", String(i));
    span.setAttribute("aria-hidden", "true");
    span.textContent = ch;
    el.appendChild(span);
  });
}

/* ---------- scroll reveal ---------- */

function initReveals(): void {
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        show(en.target as HTMLElement);
        io.unobserve(en.target);
      }
    },
    { threshold: 0.06, rootMargin: "0px 0px -4% 0px" },
  );

  const show = (el: HTMLElement) => {
    if (el.getAttribute("data-fx") === "chars") splitChars(el);
    /* Both class vocabularies, so the projects entry's own observer
       and this one can coexist on the same page. */
    el.classList.add("fx-in", "is-in");
    el.style.transitionDelay = "";
  };

  /* Adopt an element: already on screen → dissolve in on the next
     frame (so the hidden state gets a chance to paint); otherwise
     wait for it to scroll into view. */
  const consider = (el: HTMLElement) => {
    if (el.classList.contains("fx-in") || el.classList.contains("is-in"))
      return;
    const r = el.getBoundingClientRect();
    if (r.top < (window.innerHeight || 800) && r.bottom > 0) {
      el.style.transitionDelay = "0ms";
      requestAnimationFrame(() => show(el));
    } else {
      io.observe(el);
    }
  };

  const scan = (root: ParentNode) => {
    if (root instanceof HTMLElement) consider(root);
    root
      .querySelectorAll<HTMLElement>("[data-fx], [data-reveal]")
      .forEach(consider);
  };

  scan(document.body);

  /* SPA re-renders mount new hooks after this module has run — keep
     watching. Char targets re-adopt cleanly (splitChars is idempotent). */
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((n) => {
        if (n instanceof HTMLElement) scan(n);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

/* ---------- ambient glitch ----------
   Retired with the terminal direction. The surge's atmosphere is the
   dissolve, not the glitch; the hook ([data-fx-glitch]) is simply
   ignored now. */

/* ---------- ghost cursor ---------- */

function initGhostCursor(): void {
  if (!finePointer()) return;

  const ghost = document.createElement("div");
  ghost.id = "fx-cursor";
  ghost.setAttribute("aria-hidden", "true");
  document.body.appendChild(ghost);

  let x = -100;
  let y = -100;
  let gx = x;
  let gy = y;
  let raf = 0;
  let seen = false;

  const hotSelectors =
    "a, button, [role='button'], input, textarea, select, label, summary";

  /* The trail loop runs only while the ghost is actually catching up;
     once it settles the frame stops, so an idle page costs nothing
     (and headless capture can find a quiet frame). The next
     pointermove restarts it. */
  let pendingMove = false;
  const tick = () => {
    gx += (x - gx) * 0.22;
    gy += (y - gy) * 0.22;
    ghost.style.transform = `translate(${gx}px, ${gy}px)`;
    const el = document.elementFromPoint(gx, gy);
    ghost.classList.toggle("fx-cursor-hot", !!el?.closest?.(hotSelectors));
    const settled =
      Math.abs(x - gx) < 0.5 && Math.abs(y - gy) < 0.5 && !pendingMove;
    if (settled) {
      raf = 0;
      return;
    }
    pendingMove = false;
    raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (raf === 0) raf = requestAnimationFrame(tick);
  };

  addEventListener(
    "pointermove",
    (e) => {
      x = e.clientX;
      y = e.clientY;
      pendingMove = true;
      if (!seen) {
        seen = true;
        gx = x;
        gy = y;
        ghost.classList.add("fx-cursor-on");
      }
      wake();
    },
    { passive: true },
  );

  /* The trailing square is a decoration of the mouse, so it goes away
     with the mouse: leaving the window parks it off-screen. */
  document.documentElement.addEventListener("pointerleave", () => {
    ghost.classList.remove("fx-cursor-on");
    seen = false;
    if (raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    ghost.style.transform = "translate(-100px, -100px)";
  });
}

type VTDocument = Document & {
  startViewTransition?: (change: () => void | Promise<void>) => unknown;
};

/* pagereveal's event object — typed locally, lib.dom lags the spec. */
type RevealEvent = Event & {
  viewTransition?: { finished: Promise<unknown>; ready: Promise<unknown> };
};

/* SPA scene switches (blog index ↔ article, photo detail) run through
   history.pushState / popstate and hand their DOM change to React's
   async commit. Wrap both in a view transition whose callback waits
   two frames — enough for the framework to have painted the new
   scene — so the old snapshot is taken before, the new after. */
function patchHistoryTransitions(): void {
  const doc = document as VTDocument;
  if (typeof doc.startViewTransition !== "function") return;
  const startTransition = doc.startViewTransition.bind(doc);

  const waitCommit = () =>
    new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );

  const transition = (change: () => void) => {
    if (document.hidden) {
      change();
      return;
    }
    /* Aim the iris at the pointer that started this swap — the SPA
       path has no navigation event to carry it. A keyboard activation
       (no pointer in the last 2s) leaves the ring at the centre. */
    if (lastClick.t > 0 && performance.now() - lastClick.t < 2000) {
      setVTOrigin(lastClick.x, lastClick.y);
    }
    try {
      startTransition(() => {
        change();
        return waitCommit();
      });
    } catch {
      change(); /* a running transition refused ours — just switch */
    }
  };

  const origPush = history.pushState.bind(history);
  history.pushState = function pushStateWithTransition(
    data: unknown,
    unused: string,
    url?: string | URL | null,
  ) {
    let sameUrl = true;
    try {
      if (url != null) {
        sameUrl = new URL(String(url), location.href).href === location.href;
      }
    } catch {
      sameUrl = false;
    }
    if (sameUrl) {
      /* URL fixes and filter-state rewrites change nothing visible. */
      return origPush(data, unused, url ?? null);
    }
    transition(() => origPush(data, unused, url ?? null));
  } as typeof history.pushState;

  /* Registered before the apps mount, so this runs ahead of their own
     popstate handlers and captures the old scene first. */
  addEventListener(
    "popstate",
    () => {
      transition(() => {
        /* The URL already changed; the apps' own popstate listeners
           commit the DOM swap inside the two-frame wait. */
      });
    },
    { capture: true },
  );
}

/* ---------- cross-document navigation curtain ----------
   The dither curtain. Cross-document view transitions were built and
   removed: they coordinate the two documents beautifully, but their
   animations only start once the next page is ready — clicked from a
   cold page, the reader saw nothing happen on the page they were on,
   and the ring they asked for plays on the wrong side of the swap.
   The canvas keeps the exit where the click is.

     click → the target starts downloading (high-priority fetch) and
     the exit bloom leaves the click point: cells print onto the old
     page in Bayer order, a pixel ring eating the page as it grows →
     the print snaps down to the field wall → navigate while fully
     covered → the new page's first frame is that same flat cover
     (inline head style, html.px-boot) → once the framework has
     mounted, the page develops: the wall breaks into the same mesh
     from the SAME point and the mesh opens cell by cell onto the
     content.

   Both halves are the same ring — the exit is the reveal mirrored:
   identical Bayer order, identical ink tones, identical origin — so
   the navigation reads as one ring passing through the swap, not as
   two effects stapled together.

   One colour beat, on the way out, and even that is only a few cells
   printing in the site's own accent. The way in is achromatic: a
   second colour beat on arrival would read as the transition catching
   and repeating itself instead of as one movement across the
   navigation.

   The blocks are drawn, not sampled. A version that sampled a real
   snapshot of the page was built and measured: the field is #060608,
   so almost every block samples near-black and the pattern has nothing
   to work with. Printing the pattern means every cell is deliberate.

   What the origin costs: the wave that closes the old page and the one
   that opens the new page must share a centre, and the origin would
   otherwise die with the old document. It travels in sessionStorage as
   a fraction of the viewport, so a landing on a differently sized
   window still opens on the right spot. */
const PXNAV_KEY = "px-nav";
const PX_ORIGIN_KEY = "px-origin";
const PX_CELL = 10; /* CSS px per block — dense on purpose */
const PX_MAX_CELLS = 26000; /* per-frame budget guard */
/* Short and hot: the two beats have to fit inside a transition short
   enough that it never reads as waiting for the page. */
const PX_COVER_MS = 400;
const PX_REVEAL_MS = 420;
/* The cold-boot develop gets a little longer than the curtain reveal:
   it starts before the framework has committed anything, so the mesh
   opens onto a page that is still painting underneath. */
const PX_BOOT_MS = 520;
const PX_MOUNT_CAP = 1200; /* give up waiting for React and reveal */
const PX_FAILSAFE_MS = 4000; /* never trap the reader behind a wall */

/* The ordered-dither threshold matrix — 4×4 Bayer, normalised. Within a
   wavefront the cells print in this order, so the front reads as a
   checkerboard opening up rather than as noise. It tiles every 4 cells,
   i.e. every 40 CSS px at the default block size: visible regularity is
   the point — this is a print, not static. */
const BAYER = [
  0, 8, 2, 10, //
  12, 4, 14, 6, //
  3, 11, 1, 9, //
  15, 7, 13, 5,
].map((v) => (v + 0.5) / 16);

/* ---------- the origin travels with the navigation ----------
   Stored as fractions of the viewport, so a navigation that lands on
   a window of a slightly different size still opens on the right
   spot. Cleared once the arriving page has used it. */
/** Warm the target document through a prefetch link — the same
 *  mechanism the hover path uses, fired at the click instead so the
 *  download overlaps the transition. Same-origin only: callers
 *  pre-filter, but the guard lives at the sink. */
function warmTarget(href: string): void {
  try {
    const target = new URL(href, location.href);
    if (target.origin !== location.origin) return;
    const warm = document.createElement("link");
    warm.rel = "prefetch";
    warm.href = target.href;
    warm.fetchPriority = "high";
    document.head.appendChild(warm);
  } catch {
    /* no warmup — the navigation itself still warms what it needs */
  }
}

function pxSaveOrigin(x: number, y: number): void {
  try {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    sessionStorage.setItem(
      PX_ORIGIN_KEY,
      `${(x / w).toFixed(4)} ${(y / h).toFixed(4)}`,
    );
  } catch {
    /* private mode: the new page just opens from the centre */
  }
}

function pxLoadOrigin(): { x: number; y: number } {
  const fallback = {
    x: Math.max(1, window.innerWidth) / 2,
    y: Math.max(1, window.innerHeight) / 2,
  };
  /* The head script consumed the stored origin and set the CSS custom
     properties before first paint — read them back off the element. */
  try {
    const cs = getComputedStyle(document.documentElement);
    const ox = Number.parseFloat(cs.getPropertyValue("--vt-ox"));
    const oy = Number.parseFloat(cs.getPropertyValue("--vt-oy"));
    if (Number.isFinite(ox) && Number.isFinite(oy)) {
      return {
        x: (ox / 100) * Math.max(1, window.innerWidth),
        y: (oy / 100) * Math.max(1, window.innerHeight),
      };
    }
  } catch {
    /* fall through to the stored fraction */
  }
  try {
    const raw = sessionStorage.getItem(PX_ORIGIN_KEY);
    if (!raw) return fallback;
    const [sx, sy] = raw.split(" ");
    const fx = Number.parseFloat(sx);
    const fy = Number.parseFloat(sy);
    if (!Number.isFinite(fx) || !Number.isFinite(fy)) return fallback;
    return {
      x: fx * Math.max(1, window.innerWidth),
      y: fy * Math.max(1, window.innerHeight),
    };
  } catch {
    return fallback;
  }
}

/** True once a covered navigation is underway — a second click must
 * not start a second curtain. */
let pxNavigating = false;

type RGB = readonly [number, number, number];

/* One scheme per theme. The wall the curtain ends on is the page's own
   background, so the handoff to the next page's cover (and out of it)
   is invisible; the print tone is the page's own ink; the spark cells
   print in the page's own accent. Keep these in step with --bg, --ink
   and --accent in tokens.css and with the inline head cover in
   vite.config.ts. */
interface Scheme {
  field: RGB; /* the wall: --bg, and the head cover's colour */
  ink: RGB; /* the print tone: --ink */
  accent: RGB; /* a few cells print in --accent instead */
  /* What the wall breathes towards while the framework mounts. Picked
     per theme because "alive" means opposite things on a #060608 page
     and a #f2f3ee one: the dark wall lifts, the light one brightens. */
  hold: RGB;
}

const SCHEMES: Record<"dark" | "light", Scheme> = {
  dark: {
    field: [6, 6, 8],
    ink: [244, 246, 251],
    accent: [198, 255, 77],
    hold: [58, 61, 72],
  },
  light: {
    field: [242, 243, 238],
    ink: [23, 24, 29],
    accent: [68, 112, 14],
    hold: [252, 252, 250],
  },
};

function schemeFor(): Scheme {
  return document.documentElement.dataset.theme === "light"
    ? SCHEMES.light
    : SCHEMES.dark;
}

/* The curtain is drawn as one ImageData of cols×rows — a single pixel
   per block — then blitted up with smoothing off. Nearest-neighbour
   upscaling is what makes the blocks crisp, and it means the frame
   costs one drawImage instead of tens of thousands of fillRects.
   Because the upscale does the work, the bitmap needs no devicePixel-
   Ratio scaling at all: blocks stay exact on every display. */
interface Curtain {
  el: HTMLCanvasElement;
  /** Cover: the mesh prints over the page, then cools to the wall. */
  cover: (p: number) => void;
  /** Develop: the wall breaks into the mesh and the mesh opens onto
   * the page. Deliberately achromatic — the accent already happened on
   * the way out, and repeating it here breaks the movement in half. */
  reveal: (p: number) => void;
  /** Full opaque wall, breathing — the wait for the new page. */
  hold: (t: number) => void;
}

/** Deterministic per-cell hash, 0…1. The wake mesh must be pixel-
 * identical in this document and the next one — a Math.random() mesh
 * would jump at the swap — so every per-cell constant is derived from
 * the cell index, not from a live RNG. */
function cellHash(i: number): number {
  let h = (i + 1) * 2654435761;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* The quiet print: the tone the ring's wake settles to and the wall
   between the documents breathes on. Not the flat field — the mesh IS
   the bridge, so the transition never collapses to a blank. */
const PX_MESH_K = 0.28;

function createCurtain(origin?: { x: number; y: number }): Curtain | null {
  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);
  let cell = PX_CELL;
  while (Math.ceil(w / cell) * Math.ceil(h / cell) > PX_MAX_CELLS) cell += 2;
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const total = cols * rows;

  const canvas = document.createElement("canvas");
  canvas.id = "px-curtain";
  canvas.setAttribute("aria-hidden", "true");
  /* 3001, above the head script's CSS wall (3000): while both are up
     the canvas must win, or the handoff would show the CSS wall
     instead of the curtain.
     · 100vw/100vh rather than inset:0 — viewport units don't subtract
       the classic scrollbar, and `inset:0` does, which left a bare
       10–15px gutter of live page down the right edge (the bitmap is
       sized from innerWidth, so the two must agree).
     · Explicit width/height rather than the bitmap size, so a display
       scale ≠ 100% can't render the curtain larger than the screen.
     · image-rendering: pixelated because the bitmap is one pixel per
       block and the compositor then upscales it — without this the
       blocks would come out smooth on a HiDPI panel. */
  canvas.style.cssText =
    "position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:3001;pointer-events:none;image-rendering:pixelated";
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const buf = document.createElement("canvas");
  buf.width = cols;
  buf.height = rows;
  const bctx = buf.getContext("2d");
  if (!bctx) return null;
  const img = bctx.createImageData(cols, rows);
  const data = img.data;

  /* Per-cell constants, computed once. order is *when the cell is
     reached*: distance from the origin, with the Bayer threshold
     folded in, so cells inside a wavefront print in checkerboard order
     instead of all at once — that interleave is the whole difference
     between a print and a ripple. toneLvl is which of the three print
     densities the cell carries; spark flags the few accent cells. */
  const ox = origin ? origin.x : w / 2;
  const oy = origin ? origin.y : h / 2;
  const far =
    Math.max(
      Math.hypot(ox, oy),
      Math.hypot(w - ox, oy),
      Math.hypot(ox, h - oy),
      Math.hypot(w - ox, h - oy),
    ) || 1;
  const order = new Float32Array(total);
  const toneLvl = new Uint8Array(total);
  const spark = new Uint8Array(total);
  const seed = new Float32Array(total);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const d =
        Math.hypot((c + 0.5) * cell - ox, (r + 0.5) * cell - oy) / far;
      const b = BAYER[(r & 3) * 4 + (c & 3)];
      order[i] = clamp01(d * 0.88 + b * 0.12 + (cellHash(i) - 0.5) * 0.04);
      toneLvl[i] = (cellHash(i + total * 7) * 3) | 0;
      /* ~1% of cells print in the accent. Enough to spot, not enough
         to read as confetti — the print is ink; the accent is a spark
         in it. */
      spark[i] = cellHash(i + total * 13) < 0.012 ? 1 : 0;
      seed[i] = cellHash(i + total * 29);
    }
  }

  const blit = () => {
    bctx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(buf, 0, 0, cols * cell, rows * cell);
  };

  const cover = (p: number) => {
    const { field, ink, accent } = schemeFor();
    for (let i = 0; i < total; i++) {
      /* The exit half of the ring — the reveal mirrored cell for cell.
         The reveal waits as mesh, flashes ink at the front, and opens
         onto the page; the cover waits as the page, flashes ink at the
         front, and settles into the mesh. What the ring passes over is
         erased — text included — but the wake is a quiet PRINT, never
         a blank: the mesh is the bridge between the documents, so the
         load wait lives inside the animation instead of as a dead
         field. Deterministic per-cell constants keep the mesh
         pixel-identical across the swap. */
      const at = 0.04 + order[i] * 0.8;
      const f = span(p, at, 0.05);
      const close = span(p, at + 0.05, 0.09);
      const on = f > 0;
      const t = spark[i] ? accent : ink;
      const k = on
        ? mix(PX_MESH_K, 0.45 + 0.275 * toneLvl[i], 1 - quant(close, 3))
        : 0;
      const o = i * 4;
      data[o] = mix(field[0], t[0], k);
      data[o + 1] = mix(field[1], t[1], k);
      data[o + 2] = mix(field[2], t[2], k);
      data[o + 3] = (on ? 1 : 0) * 255;
    }
    blit();
  };

  const reveal = (p: number) => {
    const { field, ink } = schemeFor();
    for (let i = 0; i < total; i++) {
      /* The develop: the cell waits as the quiet mesh, flashes to its
         print tone the moment the wave reaches it — a hard pixel edge
         at the front, never a haze — and then opens in three quantised
         alpha steps. A cell that merely faded would make the whole
         thing a dissolve again. */
      const at = 0.04 + order[i] * 0.8;
      const f = span(p, at, 0.05);
      const drop = span(p, at + 0.05, 0.09);
      const on = f > 0;
      const k = on ? mix(PX_MESH_K, 0.45 + 0.275 * toneLvl[i], f) : PX_MESH_K;
      const a = on ? 1 - quant(drop, 3) : 0;
      const o = i * 4;
      data[o] = mix(field[0], ink[0], k);
      data[o + 1] = mix(field[1], ink[1], k);
      data[o + 2] = mix(field[2], ink[2], k);
      data[o + 3] = (on ? a : 1) * 255;
    }
    blit();
  };

  const hold = (t: number) => {
    const { ink, hold: hc } = schemeFor();
    /* The bridge between the documents is the mesh itself, not a flat
       field: base = the quiet print, a slow band of lift crossing it,
       plus a very sparse scatter of cells printing briefly in ink —
       proof that the page is alive while the framework mounts under
       it. Never transparent — the wall must stay opaque until there is
       something behind it. */
    const br = mix(schemeFor().field[0], ink[0], PX_MESH_K);
    const bg = mix(schemeFor().field[1], ink[1], PX_MESH_K);
    const bb = mix(schemeFor().field[2], ink[2], PX_MESH_K);
    const band = ((t / 1400) % 1) * (rows + 30) - 15;
    for (let r = 0; r < rows; r++) {
      const k = Math.max(0, 1 - Math.abs(r - band) / 5);
      const bandLift = k * 0.3;
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const flick = ((t / 900 + seed[i]) % 1) < 0.015 ? 0.14 : 0;
        const o = i * 4;
        data[o] = mix(mix(br, hc[0], bandLift), ink[0], flick);
        data[o + 1] = mix(mix(bg, hc[1], bandLift), ink[1], flick);
        data[o + 2] = mix(mix(bb, hc[2], bandLift), ink[2], flick);
        data[o + 3] = 255;
      }
    }
    blit();
  };

  return { el: canvas, cover, reveal, hold };
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Where `p` sits inside the window [start, start+len], as 0…1. */
const span = (p: number, start: number, len: number): number =>
  clamp01((p - start) / len);
/** Snap to `steps` levels — the stepped look the effect is after. */
const quant = (v: number, steps: number): number =>
  Math.ceil(v * steps) / steps;
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Drive a 0→1 render over `dur` ms. Returns a cancel handle. */
function animate(
  render: (p: number) => void,
  dur: number,
  done: () => void,
): () => void {
  const start = performance.now();
  let raf = 0;
  const step = () => {
    const p = Math.min((performance.now() - start) / dur, 1);
    render(p);
    if (p < 1) {
      raf = requestAnimationFrame(step);
    } else {
      raf = 0;
      done();
    }
  };
  render(0);
  raf = requestAnimationFrame(step);
  return () => {
    if (raf !== 0) cancelAnimationFrame(raf);
    raf = 0;
  };
}

/* ---------- leaving: the canvas curtain ---------- */

function pxNavGo(href: string, origin: { x: number; y: number }): void {
  if (document.documentElement.classList.contains("px-boot")) return;
  if (pxNavigating) {
    /* A navigation is already underway — but the caller has already
       preventDefaulted this click, so returning without acting swallows
       it. If the wall is still up (the browser refused the first
       navigation and the failsafe window has not elapsed), the second
       click must actually go through, re-aimed at the link it hit. */
    if (document.getElementById("px-curtain")) {
      pxSaveOrigin(origin.x, origin.y);
      location.href = href;
    }
    return;
  }
  pxNavigating = true;
  /* The load starts at the click, not when the bloom finishes: the
     exit ring plays while the target document is already downloading. */
  warmTarget(href);
  try {
    sessionStorage.setItem(PXNAV_KEY, "1");
  } catch {
    /* private mode: still run the curtain; the boot cover just won't
       be pre-applied on the next page */
  }
  pxSaveOrigin(origin.x, origin.y);
  /* A wall is already up — an arrival reveal is still playing. Never tear
     that wall down to build another one (the page would show through for a
     frame); just go. */
  if (document.getElementById("px-curtain")) {
    location.href = href;
    return;
  }
  const curtain = createCurtain(origin);
  if (!curtain) {
    /* No canvas — no curtain, but never a swallowed click. */
    location.href = href;
    return;
  }
  document.documentElement.appendChild(curtain.el);
  animate(
    (p) => curtain.cover(p),
    PX_COVER_MS,
    () => {
      location.href = href;
    },
  );
  /* If the browser refuses the navigation (blocked, a scheme it won't
     follow) the page is still here behind the wall. Give the flag back
     so the reader can click again — but leave the wall standing:
     Chrome keeps the old document on screen until the new one
     commits, and clearing it here would flash the old page back
     mid-navigation. */
  window.setTimeout(() => {
    pxNavigating = false;
  }, PX_COVER_MS + 2200);
}

/** Drop every trace of a curtain: the CSS cover and the canvas. */
function pxClear(): void {
  document.documentElement.classList.remove("px-boot");
  document.getElementById("px-curtain")?.remove();
}

/** Arriving under a curtain: open it, from the point that was clicked. */
function pxNavReveal(): void {
  try {
    sessionStorage.removeItem(PXNAV_KEY);
  } catch {
    /* nothing to clear */
  }
  const origin = pxLoadOrigin();
  try {
    sessionStorage.removeItem(PX_ORIGIN_KEY);
  } catch {
    /* nothing to clear */
  }
  pxOpenCurtain(origin);
}

function pxOpenCurtain(origin: { x: number; y: number }): void {
  const root = document.documentElement;
  /* A background tab gets no animation and no wall — the reader isn't
     looking, and a rAF-driven reveal would never run anyway. */
  if (document.hidden) {
    pxClear();
    return;
  }

  const curtain = createCurtain(origin);
  if (!curtain) {
    pxClear();
    return;
  }
  /* Order matters: the canvas paints a full opaque wall BEFORE the CSS
     cover is dropped, and it sits above it, so there is never a frame
     where the un-mounted page shows through. */
  root.appendChild(curtain.el);
  curtain.cover(1);
  root.classList.remove("px-boot");
  /* Keeps the one-time boot fade out of the reveal's way. */
  root.classList.add("px-arrived");

  let stopHold = () => {};
  let stopReveal: (() => void) | null = null;
  /* If anything at all goes wrong — mount never happens, a frame
     throws — the wall comes down rather than trapping the reader. */
  const failsafe = window.setTimeout(() => {
    stopHold();
    stopReveal?.();
    pxClear();
  }, PX_FAILSAFE_MS);

  let last = 0;
  const t0 = performance.now();
  const holdStep = (t: number) => {
    /* Throttled: this can run for a second on a cold load. */
    if (t - last >= 40) {
      last = t;
      curtain.hold(t - t0);
    }
    rafHold = requestAnimationFrame(holdStep);
  };
  let rafHold = requestAnimationFrame(holdStep);
  stopHold = () => {
    if (rafHold !== 0) cancelAnimationFrame(rafHold);
    rafHold = 0;
  };

  const start = performance.now();
  const mounted = () =>
    !!document.querySelector("#root > *, #app > *") ||
    performance.now() - start > PX_MOUNT_CAP;
  const wait = () => {
    if (!mounted()) {
      requestAnimationFrame(wait);
      return;
    }
    stopHold();
    stopReveal = animate(
      (p) => curtain.reveal(p),
      PX_REVEAL_MS,
      () => {
        window.clearTimeout(failsafe);
        stopReveal = null;
        pxClear();
      },
    );
  };
  wait();
}

/* ---------- the iris path (cross-document view transitions) ----------
   On engines that parse @view-transition, the browser coordinates the
   old and new documents in ONE transition: navigation starts the
   instant of the click, the old page stays frozen on screen while the
   next one loads, and the ring masks in fx.css play across both sides
   once both really exist. fx's only jobs there are to aim the ring and
   then get out of the click's way — no interception, no curtain.

   Feature-detected by parsing the at-rule itself (an engine without it
   drops the rule), with the pagereveal event — which ships as part of
   the same feature — as the second key. */
let _crossDocVT: boolean | null = null;
function crossDocVT(): boolean {
  if (_crossDocVT === null) {
    const probe = document.createElement("style");
    probe.textContent = "@view-transition{navigation:auto}";
    document.head.appendChild(probe);
    const parsed = (probe.sheet?.cssRules?.length ?? 0) > 0;
    probe.remove();
    _crossDocVT = parsed && "onpagereveal" in window;
  }
  return _crossDocVT;
}

/* Where the iris leaves from. Tracked globally so the SPA path (a
   pushState wrapped after the fact) can still aim at the pointer that
   started it; keyboard activations have no pointer and fall back to
   the centre. */
const lastClick = { x: 0, y: 0, t: 0 };
addEventListener(
  "pointerdown",
  (e) => {
    lastClick.x = e.clientX;
    lastClick.y = e.clientY;
    lastClick.t = performance.now();
  },
  { capture: true, passive: true },
);

/** Aim the iris masks at a viewport point, as fractions so a ring that
 * started here still lands right if the window is resized mid-flight. */
function setVTOrigin(x: number, y: number): void {
  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);
  const root = document.documentElement;
  root.style.setProperty("--vt-ox", `${((x / w) * 100).toFixed(2)}%`);
  root.style.setProperty("--vt-oy", `${((y / h) * 100).toFixed(2)}%`);
}

/* ---------- cold boot: the develop ----------
   A direct load (no navigation flag) gets the same entrance the
   curtain gives a cross-entry jump, minus the wait: the page develops
   out of an ordered-dither print over ~half a second, from the centre.

   The wall goes up synchronously, before the framework's first commit
   — it is flat field colour, which is exactly what the reader is
   looking at on an unmounted page, so there is no flash — and the
   develop starts at once rather than waiting for React: the mesh
   opens onto a page that paints itself underneath it. Waiting for
   mount here would push the first content back by the whole mount
   time, and a cold load has no old page to hide.

   Skipped when a curtain arrival owns the entrance (px-boot), when a
   cross-document view transition is arriving (the iris ring owns the
   reveal — pagereveal decides), when the tab is hidden or still
   prerendering, and under the build's prerender pass — the snapshot
   grabs the live DOM the moment content renders, and a canvas that
   exists for half a second must never be baked into static HTML (the
   script marks the page with window.__PRERENDER__). Speculation-rules
   prerendering needs no flag: the document is `prerendering` until
   activation, and initFx only boots after that. */
function pxBootDevelop(): void {
  if (reducedMotion()) return;
  const root = document.documentElement;
  if (root.classList.contains("px-boot")) return;
  const w = window as Window & { __PRERENDER__?: number };
  const doc = document as Document & { prerendering?: boolean };
  if (w.__PRERENDER__ || document.hidden || doc.prerendering) return;

  const curtain = createCurtain();
  if (!curtain) return;
  root.appendChild(curtain.el);
  curtain.cover(1);
  root.classList.add("px-arrived");
  const failsafe = window.setTimeout(() => pxClear(), PX_FAILSAFE_MS);
  animate(
    (p) => curtain.reveal(p),
    PX_BOOT_MS,
    () => {
      window.clearTimeout(failsafe);
      pxClear();
    },
  );
}

/* The cold boot is owed only when no cross-document view transition is
   arriving — under one, the iris ring owns the reveal and raising the
   wall here would cover the incoming snapshot. pagereveal carries that
   answer (viewTransition is non-null exactly when a transition is
   pending), and it fires before the first visible frame, so the wall —
   when it is owed — still goes up before anything is shown. Registered
   at module scope, ahead of initFx: on a slow connection the event can
   fire while this file is still downloading, and a page whose reveal
   was missed has been seen anyway — no entrance is owed. */
let bootPlayed = false;
function playBoot(): void {
  if (bootPlayed) return;
  bootPlayed = true;
  pxBootDevelop();
}
if ("onpagereveal" in window) {
  addEventListener(
    "pagereveal",
    (e) => {
      if (!(e as RevealEvent).viewTransition) playBoot();
    },
    { once: true },
  );
} else {
  playBoot();
}

/* ---------- hover prefetch (engines without speculation rules) ----------
   Firefox/Safari ignore the rules; a <link rel=prefetch> on
   pointerover still warms the target HTML so their navigation gap
   shrinks to a parse. Once per href per page. */
function initHoverPrefetch(): void {
  const seen = new Set<string>();
  let timer = 0;
  let pending: string | null = null;
  const prefetch = (href: string) => {
    if (seen.has(href)) return;
    seen.add(href);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  };
  document.addEventListener(
    "pointerover",
    (e) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      let url: URL;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      pending = url.href;
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        if (pending) prefetch(pending);
        pending = null;
      }, 120);
    },
    { passive: true },
  );
}

function initPixelNav(): void {
  /* Boot after a covered navigation: the head script has already put
     the solid cover up (html.px-boot); dissolve it. */
  if (document.documentElement.classList.contains("px-boot")) {
    requestAnimationFrame(() => pxNavReveal());
  }

  addEventListener("pageshow", (e) => {
    /* bfcache restore: the page may come back frozen mid-curtain. */
    if ((e as PageTransitionEvent).persisted) {
      pxNavigating = false;
      pxClear();
    }
  });

  document.addEventListener(
    "click",
    (e) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      if (a.relList?.contains("external")) return;
      let url: URL;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      /* Same document, different fragment: that's an in-page jump, not
         a page change — let the browser scroll instead of reloading
         the whole entry behind a curtain. */
      if (url.pathname === location.pathname && url.search === location.search)
        return;
      /* The blog/photos SPAs handle their own internal links through
         pushState (defaultPrevented); native navigations get the
         transition below. */
      const box = a.getBoundingClientRect();
      const origin = {
        x: e.clientX || box.left + box.width / 2,
        y: e.clientY || box.top + box.height / 2,
      };
      if (crossDocVT()) {
        /* The browser owns this navigation: both documents meet in one
           view transition and the iris masks in fx.css play across
           them. fx aims the ring, starts the download here, and lets
           the click through untouched. The pixel bar is the click's
           receipt while the old page sits frozen waiting for the next
           one — on a warm swap it never shows (the bar waits 90ms). */
        warmTarget(url.href);
        pxSaveOrigin(origin.x, origin.y);
        setVTOrigin(origin.x, origin.y);
        startProgress();
        window.setTimeout(() => endProgress(), 4000);
        return;
      }
      /* The curtain is born where the click landed. A keyboard
         activation reports 0,0 — fall back to the link itself so the
         wave doesn't start in the corner. */
      e.preventDefault();
      pxNavGo(url.href, origin);
    },
    false,
  );
}

/* ---------- entry point ---------- */

/* Dev-only tuning handle: render a single frozen frame of any curtain
   beat against the live page — __px.frame("cover", 0.4) etc. The
   production bundle strips it with the DEV flag. */
if (import.meta.env.DEV) {
  (window as Window & { __px?: unknown }).__px = {
    frame: (beat: "cover" | "reveal", p: number, origin?: {
      x: number;
      y: number;
    }): HTMLCanvasElement | null => {
      const c = createCurtain(origin);
      if (!c) return null;
      c[beat](p);
      document.documentElement.appendChild(c.el);
      return c.el;
    },
    hold: (t: number): HTMLCanvasElement | null => {
      const c = createCurtain();
      if (!c) return null;
      c.hold(t);
      document.documentElement.appendChild(c.el);
      return c.el;
    },
    clear: (): void => {
      document.getElementById("px-curtain")?.remove();
    },
  };
}

/** Wire every decoration. Safe to call more than once (guarded by the
 * wired flag) and safe to skip entirely under reduced motion. The
 * reveal scan starts on the next two frames so React's first commit is
 * already in the DOM when the hooks are collected.
 *
 * Prerendering: while this page renders hidden (speculation rules),
 * nothing is wired — history APIs and paint-dependent logic don't
 * belong in a prerendering context, and the navigation flag that a
 * covering page wrote isn't visible yet anyway. The full boot runs on
 * activation; if the reader is arriving under the curtain, the cover
 * goes up synchronously here, before the first visible frame.
 *
 * The guard is a module flag rather than the html.fx-on class on
 * purpose: a page prerendered by the build (scripts/prerender.mjs)
 * snapshots the DOM after this module has run, so its static HTML can
 * still carry fx-on on the root. That state must boot the engine here
 * all the same — keying the guard off the class would skip initReveals
 * and leave every [data-fx] section at opacity 0 for good. */
let wired = false;

export function initFx(): void {
  if (typeof window === "undefined" || wired) return;
  const root = document.documentElement;
  if (reducedMotion()) return;

  const prerendering = document as Document & { prerendering?: boolean };
  if (prerendering.prerendering) {
    document.addEventListener(
      "prerenderingchange",
      () => {
        try {
          if (sessionStorage.getItem(PXNAV_KEY) === "1")
            root.classList.add("px-boot");
        } catch {
          /* storage unavailable — the reveal simply won't run */
        }
        initFx();
      },
      { once: true },
    );
    return;
  }

  /* The transition CSS carries no filter references and the iris ring
     is drawn by the browser's view-transition layer — nothing needs
     injecting ahead of them. */
  wired = true;
  root.classList.add("fx-on");
  patchHistoryTransitions();
  initPixelNav();
  initHoverPrefetch();
  /* The cold-boot develop is owned by the pagereveal listener at
     module scope: it fires before the first visible frame and knows
     whether a cross-document view transition is arriving (the iris
     owns the entrance then). */

  const start = () =>
    /* Two frames: React's first commit lands between them, so the
       initial scan sees the mounted hooks. */
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        initReveals();
        initGhostCursor();
      }),
    );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}
