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

/* ---------- view-transition pixel mosaic ---------- */

/* The pixelate filters used by the navigation transition (fx.css).
   Each one samples the frame into N-px blocks: a tiled dot grid masks
   the source, then a dilate grows every kept dot back into a full
   block — the ordered-mosaic of the CapCut/Jimeng pixel wipe. */
/* 4, 8, 16 and 32 are the rungs the SPA scene switches climb; 6 and 12
   and 22 fill in the navigation curtain's ladder, which stays fine —
   past ~22px the sampling drops so much of the page that it stops
   reading as a mosaic of it. */
const PX_SIZES = [4, 6, 8, 12, 16, 22, 32];

function injectPixelFilters(): void {
  if (document.getElementById("px-filters")) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "px-filters";
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = "position:absolute;width:0;height:0;pointer-events:none";
  svg.innerHTML = PX_SIZES.map(
    (n) =>
      `<filter id="pxf${n}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
      `<feFlood x="${n / 4}" y="${n / 4}" width="1" height="1"/>` +
      `<feComposite width="${n}" height="${n}"/>` +
      `<feTile result="a"/>` +
      `<feComposite in="SourceGraphic" in2="a" operator="in"/>` +
      `<feMorphology operator="dilate" radius="${n / 2}"/>` +
      `</filter>`,
  ).join("");
  document.documentElement.appendChild(svg);
}

type VTDocument = Document & {
  startViewTransition?: (change: () => void | Promise<void>) => unknown;
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
   The pixel ignition curtain. Cross-document view transitions have a
   hard flaw: the new document's load time is unbounded, and once the
   old page's out-animation ends the screen shows whatever the new
   document has painted — often nothing (white). So inter-entry jumps
   cover the screen and navigate while covered.

     click → a dense field of small blocks materialises out of the
     click point as grey static (无色) → a second wave ignites them
     into colour (有色) → everything cools onto the page's own field
     colour → navigate while fully covered → the new page's first
     frame is that same flat cover (inline head style, html.px-boot) →
     the wall breaks up from the SAME point: blocks lift into grey and
     thin away.

   The colour happens once, on the way out. The way in is the dissolve:
   an earlier pass flared colour again on arrival and it read as the
   transition catching and repeating itself — two surges where there
   should be one movement across the navigation.

   The blocks are drawn, not sampled. A view-transition version that
   pixelated a real snapshot of the page was built and measured, and it
   is honest to the page — but it is also nearly invisible on a dark
   site: this field is #060608, so almost every block samples
   near-black and the colour beat has nothing to work with. Colour has
   to be generated here, which means the canvas keeps the job.

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
const PX_MOUNT_CAP = 1200; /* give up waiting for React and reveal */
const PX_FAILSAFE_MS = 4000; /* never trap the reader behind a wall */

/* ---------- the origin travels with the navigation ----------
   Stored as fractions of the viewport, so a navigation that lands on
   a window of a slightly different size still opens on the right
   spot. Cleared once the arriving page has used it. */
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

/* Two schemes, keyed off html[data-theme] — the wall the curtain ends
   on is the page's own background, so the handoff to the next page's
   cover (and out of it) is invisible. Keep these in step with --bg in
   tokens.css and with the inline head cover in vite.config.ts. */
interface Scheme {
  field: RGB; /* the wall: --bg, and the head cover's colour */
  greys: RGB[]; /* the 无色 ramp: static, and what the wall breaks into */
  chroma: RGB[]; /* the 有色 ramp: the ignition */
  spark: RGB; /* a few blocks flare harder than the rest */
  /* What the wall breathes towards while the framework mounts. Picked
     per theme because "alive" means opposite things on a #060608 page
     and a #f2f3ee one: the dark wall lifts, the light one brightens. */
  hold: RGB;
}

/** Interpolate a stop list into a flat lookup table once, so the
 * per-frame hot loop only ever indexes an array. */
function ramp(stops: RGB[], n = 24): RGB[] {
  const out: RGB[] = [];
  const seg = stops.length - 1;
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * seg;
    const k = Math.min(seg - 1, Math.floor(t));
    const f = t - k;
    const a = stops[k];
    const b = stops[k + 1];
    out.push([
      Math.round(a[0] + (b[0] - a[0]) * f),
      Math.round(a[1] + (b[1] - a[1]) * f),
      Math.round(a[2] + (b[2] - a[2]) * f),
    ]);
  }
  return out;
}

const SCHEMES: Record<"dark" | "light", Scheme> = {
  dark: {
    field: [6, 6, 8],
    greys: [
      [24, 25, 31],
      [42, 44, 53],
      [62, 65, 76],
      [88, 92, 106],
    ],
    chroma: ramp([
      [89, 241, 255],
      [110, 168, 255],
      [167, 139, 250],
      [198, 255, 77],
    ]),
    spark: [236, 255, 255],
    hold: [58, 61, 72],
  },
  light: {
    field: [242, 243, 238],
    /* Squeezed off the top of the ramp. The old lightest grey sat three
       levels under the field, so a quarter of the blocks were invisible
       — for those, the static simply was not there. Every step here is
       at least ~20 levels off the field. */
    greys: [
      [132, 135, 124],
      [168, 171, 160],
      [200, 202, 193],
      [222, 223, 216],
    ],
    /* Saturated and bright rather than deep. The dark teal-and-olive
       ramp this used to use arrives on a pale page as ink washing over
       it — the colour has to get lighter, not just darker, or the
       ignition reads as a shadow. */
    chroma: ramp([
      [0, 158, 190],
      [38, 96, 214],
      [120, 168, 12],
    ]),
    /* The hottest thing on the page, not the darkest: on a pale field a
       near-black speck is dirt, a bright saturated one is a spark. */
    spark: [0, 186, 224],
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
  /** Cover: grey static appears, colour ignites, settles to field. */
  cover: (p: number) => void;
  /** Reveal: blocks lift out of the wall into grey and thin away.
   * Deliberately achromatic — the colour already happened on the way
   * out, and repeating it here breaks the movement in half. */
  reveal: (p: number) => void;
  /** Full opaque wall, breathing — the wait for the new page. */
  hold: (t: number) => void;
}

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

  /* Per-cell constants, computed once: when the cell is reached by
     the wave, which grey it starts as, which colour it ignites to. */
  const ox = origin ? origin.x : w / 2;
  const oy = origin ? origin.y : h / 2;
  const far =
    Math.max(
      Math.hypot(ox, oy),
      Math.hypot(w - ox, oy),
      Math.hypot(ox, h - oy),
      Math.hypot(w - ox, h - oy),
    ) || 1;
  const birth = new Float32Array(total);
  const tone = new Float32Array(total);
  const hue = new Float32Array(total);
  const spark = new Float32Array(total);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const d =
        Math.hypot((c + 0.5) * cell - ox, (r + 0.5) * cell - oy) / far;
      /* Noise on the wavefront: a clean circle reads as a ripple,
         a jittered one reads as a field catching fire. */
      birth[i] = clamp01(d * 0.9 + (Math.random() - 0.5) * 0.16);
      tone[i] = Math.random();
      /* The colour index tracks distance, with only a little jitter:
         a shot-silk sweep reads as designed, per-cell random hues
         would read as television snow. */
      hue[i] = clamp01(d * 0.78 + (Math.random() - 0.5) * 0.16);
      spark[i] = Math.random();
    }
  }

  const blit = () => {
    bctx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(buf, 0, 0, cols * cell, rows * cell);
  };

  const cover = (p: number) => {
    const { field, greys, chroma, spark: sc } = schemeFor();
    const gn = greys.length - 1;
    const cn = chroma.length - 1;
    for (let i = 0; i < total; i++) {
      const b = birth[i];
      /* Two beats, then the landing: grey static fills the screen by
         0.42 and sits there for a moment, the colour wave leaves the
         origin at 0.52, and from 0.84 everything cools onto the
         page's own field colour. Levels are quantised so the field
         snaps rather than fades — digital, not filmic. */
      const a = quant(span(p, b * 0.26, 0.16), 3);
      const c = quant(span(p, b * 0.26 + 0.52, 0.24), 4);
      const s = span(p, 0.84, 0.16);
      const g = greys[(tone[i] * gn) | 0];
      const t = spark[i] > 0.94 ? sc : chroma[(hue[i] * cn) | 0];
      const o = i * 4;
      data[o] = mix(mix(g[0], t[0], c), field[0], s);
      data[o + 1] = mix(mix(g[1], t[1], c), field[1], s);
      data[o + 2] = mix(mix(g[2], t[2], c), field[2], s);
      data[o + 3] = a * 255;
    }
    blit();
  };

  const reveal = (p: number) => {
    const { field, greys } = schemeFor();
    const gn = greys.length - 1;
    for (let i = 0; i < total; i++) {
      const b = birth[i];
      /* No colour on the way in. The surge belongs to the page being
         closed; playing it again here reads as the transition catching
         and repeating itself instead of as one movement across the
         navigation.
         Two things make the break-up legible rather than a plain fade:
         the block snaps to its grey in a tenth of the run and only then
         thins (so there is a hard pixel edge at the wave front, not a
         haze), and it takes the lighter half of the grey ramp — against
         the field colour the darker greys are invisible, and an
         invisible break-up is just a dissolve. */
      const g = span(p, b * 0.6, 0.34);
      const lift = span(p, b * 0.6, 0.1);
      /* The two lightest greys only. Against the field colour the
         darker half of the ramp is invisible, and an invisible
         break-up is just a fade. */
      const gc = greys[gn - (tone[i] < 0.5 ? 0 : 1)];
      const o = i * 4;
      data[o] = mix(field[0], gc[0], lift);
      data[o + 1] = mix(field[1], gc[1], lift);
      data[o + 2] = mix(field[2], gc[2], lift);
      data[o + 3] = (1 - g) * 255;
    }
    blit();
  };

  const hold = (t: number) => {
    const { field, hold: hc } = schemeFor();
    /* Achromatic for the same reason the dissolve is: colouring the
       wall up before the blocks even start to break would be the
       surge arriving twice. This is only proof that the page is alive
       while the framework mounts under it — a slow band of grey
       crossing, plus the odd block catching the light.
       Never transparent — the wall must stay opaque until there is
       something behind it. */
    const band = ((t / 1400) % 1) * (rows + 30) - 15;
    for (let r = 0; r < rows; r++) {
      const k = Math.max(0, 1 - Math.abs(r - band) / 5);
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const tw = ((t / 900 + spark[i]) % 1) < 0.1 ? 0.5 : 0;
        const m = Math.min(1, k * 0.3 + tw * 0.5);
        const o = i * 4;
        data[o] = mix(field[0], hc[0], m);
        data[o + 1] = mix(field[1], hc[1], m);
        data[o + 2] = mix(field[2], hc[2], m);
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
  if (pxNavigating) return;
  if (document.documentElement.classList.contains("px-boot")) return;
  pxNavigating = true;
  try {
    sessionStorage.setItem(PXNAV_KEY, "1");
  } catch {
    /* private mode: still run the curtain; the boot cover just won't
       be pre-applied on the next page */
  }
  pxSaveOrigin(origin.x, origin.y);
  /* A wall is already up — an earlier navigation was refused and the
     reader clicked again. Never tear that wall down to build another
     one (the page would show through for a frame); just go. */
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
         curtain. */
      e.preventDefault();
      /* The curtain is born where the click landed. A keyboard
         activation reports 0,0 — fall back to the link itself so the
         wave doesn't start in the corner. */
      const box = a.getBoundingClientRect();
      pxNavGo(url.href, {
        x: e.clientX || box.left + box.width / 2,
        y: e.clientY || box.top + box.height / 2,
      });
    },
    false,
  );
}

/* ---------- entry point ---------- */

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

  /* The transition keyframes reference these filters by id — they must
     exist before html.fx-on turns the animations on. */
  wired = true;
  injectPixelFilters();
  root.classList.add("fx-on");
  patchHistoryTransitions();
  initPixelNav();
  initHoverPrefetch();

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
