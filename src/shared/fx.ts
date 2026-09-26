/* Shared motion engine — one implementation for all five entries.
 *
 * Framework-free on purpose (the /projects entry is vanilla TS and the
 * React entries just call this once from their bootstrap). It wires four
 * decorations, all of them no-ops when the reader asks for less motion:
 *
 *   1. scroll reveals   — [data-fx] dissolves in once, on a stepped
 *                         timing; [data-reveal] (the projects entry's
 *                         existing hooks) gets the same treatment under
 *                         its own .is-in class.
 *   2. character reveal — [data-fx="chars"] splits its text into cells
 *                         that fade up one after another. The original
 *                         string is preserved on aria-label so the
 *                         accessible name never changes.
 *   3. ambient glitch   — [data-fx-glitch] targets slip once every
 *                         7–12 seconds for a fraction of a second.
 *   4. ghost cursor     — a hollow square trailing the pointer, fine
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

/* ---------- ambient glitch ---------- */

function initAmbientGlitch(): void {
  /* Re-queried on every pass: the top bar re-renders on language/theme
     changes, so a cached list would go stale after the first one. */
  const slip = () => {
    const targets = document.querySelectorAll<HTMLElement>(
      "[data-fx-glitch]",
    );
    if (targets.length > 0) {
      targets.forEach((el) => {
        el.classList.add("fx-glitching");
        setTimeout(() => el.classList.remove("fx-glitching"), 240);
      });
    }
    schedule();
  };

  function schedule() {
    /* Decoration timing only — nothing here keys off randomness for
       security, so Math.random is the honest tool. */
    const wait = 7000 + Math.random() * 5000;
    setTimeout(() => {
      if (document.hidden) {
        schedule();
        return;
      }
      slip();
    }, wait);
  }

  schedule();
}

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

/* ---------- entry point ---------- */

/** Wire every decoration. Safe to call more than once (guarded by the
 * fx-on class) and safe to skip entirely under reduced motion. The
 * reveal scan starts on the next two frames so React's first commit is
 * already in the DOM when the hooks are collected. */
export function initFx(): void {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (reducedMotion() || root.classList.contains("fx-on")) return;

  root.classList.add("fx-on");

  const start = () =>
    /* Two frames: React's first commit lands between them, so the
       initial scan sees the mounted hooks. */
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        initReveals();
        initAmbientGlitch();
        initGhostCursor();
      }),
    );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}
