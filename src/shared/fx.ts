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
const PX_SIZES = [4, 8, 16, 32];

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

/* ---------- cross-document pixel wipe ----------
   The CapCut/Jimeng curtain. Cross-document view transitions have a
   hard flaw: the new document's load time is unbounded, and once the
   old page's out-animation ends the screen shows whatever the new
   document has painted — often nothing (white). So inter-entry jumps
   use a deterministic curtain instead:

     click → blocks flood the frozen page (240ms) → navigate while
     fully covered → the new page boots under a solid cover (inline
     head script + html.px-boot, before first paint) → the blocks
     dissolve away (320ms).

   No white is ever possible: the cover exists from the click to the
   reveal, across the navigation. SPA scene switches keep the true
   snapshot pixelation (same-document view transitions, below). */
const PXNAV_KEY = "px-nav";
const PX_CELL = 24;

/* The curtain's resting pattern: a 2×2 checker of the field's dark
   tones. It must match the CSS tile in the shared head exactly —
   the wall the canvas ends on IS the wall the boot cover shows. */
const CHECKER = ["#060608", "#0b0b10", "#0e0e13", "#090910"];
const checkerColor = (col: number, row: number): string =>
  CHECKER[((row & 1) << 1) | (col & 1)];

/** A full-screen canvas mosaic. `dir "in"` floods the screen block by
 * block; `dir "out"` dissolves it away. Steps are discrete — seven
 * visible frames, like reference frames dropped on purpose. */
function runCurtain(dir: "in" | "out", done: () => void): void {
  const canvas = document.createElement("canvas");
  canvas.id = "px-curtain";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;z-index:3000;pointer-events:none";
  document.documentElement.appendChild(canvas);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  /* Without an explicit CSS size the canvas renders at its bitmap
     size — on any display scaling ≠ 100% (dpr 1.25/1.5) that is
     LARGER than the viewport, and the curtain then covers only the
     top-left corner while the rest of the screen flashes bare. */
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    done();
    return;
  }
  ctx.scale(dpr, dpr);

  const cols = Math.ceil(w / PX_CELL);
  const rows = Math.ceil(h / PX_CELL);
  const total = cols * rows;
  const order = new Array(total);
  for (let i = 0; i < total; i++) order[i] = i;
  /* Fisher–Yates with Math.random: decoration timing, not secrets. */
  for (let i = total - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = order[i];
    order[i] = order[j];
    order[j] = t;
  }
  const colorOf = (rank: number): string => {
    const col = rank % cols;
    const row = Math.floor(rank / cols);
    return checkerColor(col, row);
  };

  const STEPS = 7;
  let step = dir === "in" ? 1 : STEPS;
  const draw = () => {
    /* Stateless redraw: `shown` is how many of the shuffled blocks are
       on screen. "in" floods from the front; "out" empties from the
       front, so the reveal order mirrors the cover order. */
    ctx.clearRect(0, 0, w, h);
    const shown = Math.ceil((step / STEPS) * total);
    const from = dir === "in" ? 0 : total - shown;
    const to = dir === "in" ? shown : total;
    for (let k = from; k < to; k++) {
      const rank = order[k];
      const x = (rank % cols) * PX_CELL;
      const y = Math.floor(rank / cols) * PX_CELL;
      ctx.fillStyle = colorOf(rank);
      ctx.fillRect(x, y, PX_CELL, PX_CELL);
    }
  };

  const start = performance.now();
  const tick = () => {
    const dur = dir === "in" ? 240 : 320;
    const p = Math.min((performance.now() - start) / dur, 1);
    const next =
      dir === "in"
        ? Math.max(1, Math.floor(p * STEPS))
        : STEPS - Math.floor(p * STEPS);
    if (next !== step) {
      step = next;
      draw();
    }
    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      step = dir === "in" ? STEPS : 0;
      draw(); /* exact final frame: full cover / fully gone */
      done();
    }
  };
  draw(); /* first frame: a scattering in, full cover out */
  requestAnimationFrame(tick);
}

function pxNavGo(href: string): void {
  if (document.documentElement.classList.contains("px-boot")) return;
  try {
    sessionStorage.setItem(PXNAV_KEY, "1");
  } catch {
    /* private mode: still run the curtain; the boot cover just won't
       be pre-applied on the next page */
  }
  runCurtain("in", () => {
    location.href = href;
  });
}

function pxNavReveal(): void {
  try {
    sessionStorage.removeItem(PXNAV_KEY);
  } catch {
    /* nothing to clear */
  }
  if (document.hidden) {
    document.documentElement.classList.remove("px-boot");
    return;
  }
  /* The reveal must show CONTENT, not the empty pre-mount shell —
     wait until the framework has actually mounted (root/app gains
     children), with a hard timeout so a slow or failed mount can
     never trap the reader behind the curtain. */
  const start = performance.now();
  const mounted = () =>
    !!document.querySelector("#root > *, #app > *") ||
    document.readyState === "complete" ||
    performance.now() - start > 1500;
  const wait = () => {
    if (!mounted()) {
      requestAnimationFrame(wait);
      return;
    }
    /* Order matters: runCurtain paints the full checker synchronously
       BEFORE the CSS cover class is dropped, so there is no paint
       between the two walls — the dissolve uncovers the live page
       directly. The px-arrived marker keeps the boot fade (which
       would otherwise start the moment px-boot is dropped) out of
       the dissolve's way. */
    runCurtain("out", () => {
      document.documentElement.classList.remove("px-boot");
      document.getElementById("px-curtain")?.remove();
    });
    document.documentElement.classList.add("px-arrived");
    document.documentElement.classList.remove("px-boot");
  };
  wait();
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
      document.documentElement.classList.remove("px-boot");
      document.getElementById("px-curtain")?.remove();
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
      if (
        url.pathname === location.pathname &&
        url.search === location.search &&
        url.hash === location.hash
      )
        return;
      /* The blog/photos SPAs handle their own internal links through
         pushState (defaultPrevented); native navigations get the
         curtain. */
      e.preventDefault();
      pxNavGo(url.href);
    },
    false,
  );
}

/* ---------- entry point ---------- */

/** Wire every decoration. Safe to call more than once (guarded by the
 * fx-on class) and safe to skip entirely under reduced motion. The
 * reveal scan starts on the next two frames so React's first commit is
 * already in the DOM when the hooks are collected. */
export function initFx(): void {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (reducedMotion() || root.classList.contains("fx-on")) return;

  /* The transition keyframes reference these filters by id — they must
     exist before html.fx-on turns the animations on. */
  injectPixelFilters();
  root.classList.add("fx-on");
  patchHistoryTransitions();
  initPixelNav();

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
