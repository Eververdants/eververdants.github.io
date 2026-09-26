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
