/* Smooth scrolling — one implementation, shared by all five entries.
 *
 * Lenis, on a short leash. It is a *decoration of the wheel*, not a
 * scroll hijack: Lenis drives the real `window.scrollY` (it does not
 * transform a wrapper), so everything that already works keeps working
 * — position:fixed chrome, IntersectionObserver, scroll-spy, the
 * browser's own scroll restoration, and any assistive technology that
 * moves the viewport itself.
 *
 * What it is deliberately NOT allowed to do:
 *
 *   · Run on touch. `syncTouch: false` — a finger already has physics,
 *     and smoothing a finger's own momentum reads as lag. Phones and
 *     tablets get the platform's native scrolling.
 *   · Run for reduced-motion readers. The whole module returns early;
 *     `scroll-behavior: smooth` in tokens.css covers their plain
 *     anchor jumps.
 *   · Take over nested scrollports. Anything the reader scrolls inside
 *     a box (the article's TOC rail, the palette's result list) carries
 *     `data-lenis-prevent`, which Lenis honours natively.
 *
 * The one thing that needs care is *programmatic* scrolling. Code that
 * calls `window.scrollTo` while Lenis holds an animated position and a
 * `targetScroll` of its own fights it — Lenis's next frame snaps back
 * to where it thought it was. So every "go somewhere" in the app goes
 * through this module's helpers, which speak to Lenis when it is live
 * and fall through to the platform when it is not. */

/** Lenis is imported lazily, so its type cannot be a value import. */
type LenisInstance = {
  scrollTo: (
    target: number | HTMLElement,
    opts?: Record<string, unknown>,
  ) => void;
  resize: () => void;
  stop: () => void;
  start: () => void;
  destroy: () => void;
};

let lenis: LenisInstance | null = null;
/** Distinguishes "never started" from "started and torn down" so a
 *  second init (React StrictMode, a hot reload) is a no-op, not a
 *  second rAF loop. */
let started = false;
/** Depth counter for scroll locks — two stacked dialogs must not
 *  unlock on the first one's close. */
let locks = 0;

function reducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return true;
  }
}

function coarsePointer(): boolean {
  try {
    return matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
}

/** Room the fixed top bar needs, so a programmatic scroll to an
 *  element lands it below the bar rather than under it. */
function clearance(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--header-clearance",
  );
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 96;
}

/** Scroll the window to an absolute document Y. */
export function scrollToY(y: number, immediate = false): void {
  const top = Math.max(0, y);
  if (lenis) {
    lenis.scrollTo(top, { immediate, force: true });
    return;
  }
  window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
}

/** Scroll an element just clear of the fixed top bar. */
export function scrollToEl(
  el: Element | string,
  opts: { immediate?: boolean } = {},
): void {
  const target = typeof el === "string" ? document.getElementById(el) : el;
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target as HTMLElement, {
      immediate: opts.immediate === true,
      duration: 0.62,
      /* Negative: land the heading *under* the bar's bottom edge. */
      offset: -clearance(),
      force: true,
    });
    return;
  }
  const y =
    target.getBoundingClientRect().top + window.scrollY - clearance() - 12;
  window.scrollTo({ top: y, behavior: opts.immediate ? "auto" : "smooth" });
}

/** Route change / view swap: start the new scene at the top, with no
 *  travel animation — the old scene is gone, there is nothing to
 *  scroll *past*. */
export function scrollToTop(): void {
  if (lenis) {
    /* `immediate` rather than a tween: a scene swap already has its own
       transition (the pixel dissolve), and a 700ms scroll on top of it
       reads as the page being slow rather than as motion. */
    lenis.scrollTo(0, { immediate: true, force: true });
    /* Lenis keeps its own scroll value; a DOM height change underneath
       it (the new scene is a different length) has to be re-measured
       or the next wheel event starts from a stale limit. */
    lenis.resize();
    return;
  }
  window.scrollTo({ top: 0, behavior: "auto" });
}

/** Freeze the page under a modal. Counted, because the search palette
 *  and an image lightbox can be open at once. */
export function lockScroll(on: boolean): void {
  locks = Math.max(0, locks + (on ? 1 : -1));
  if (!lenis) {
    /* No Lenis: fall back to the platform's own lock. `overflow:hidden`
       on the root is what the browser's <dialog> inertness does not do
       for us on every engine. */
    document.documentElement.style.overflow = locks > 0 ? "hidden" : "";
    return;
  }
  if (locks > 0) lenis.stop();
  else lenis.start();
}

/** True when Lenis is actually driving — call sites that need to know
 *  whether a scroll will be animated (rather than instant) ask here. */
export function isSmooth(): boolean {
  return lenis !== null;
}

/** Re-measure. Called after a scene swap changes document height, and
 *  on a resize Lenis does not see (a dialog opening, an image loading
 *  late). Cheap enough to call liberally; it is a few cached reads. */
export function refreshScroll(): void {
  lenis?.resize();
}

/**
 * Wire Lenis. Safe to call from every entry and safe to call twice.
 *
 * Returns nothing and never blocks: the library is imported dynamically,
 * after the entry's own bundle has run, so ~10 kB of scroll machinery is
 * never on the critical path to the first paint. Until it lands — and for
 * every reader it deliberately skips — all the helpers above fall
 * through to the platform, so the page is usable from frame one and the
 * scroll simply *becomes* smooth a moment later.
 */
export function initSmoothScroll(): void {
  if (typeof window === "undefined" || started) return;

  /* Touch: no. Reduced motion: no. Both are the "give me the platform"
     answers, and in both cases the helpers above keep working through
     the window.scrollTo branch. */
  if (reducedMotion() || coarsePointer()) return;

  started = true;
  void startLenis();
}

async function startLenis(): Promise<void> {
  let Ctor: new (opts: Record<string, unknown>) => LenisInstance;
  try {
    Ctor = (await import("lenis")).default as unknown as new (
      opts: Record<string, unknown>,
    ) => LenisInstance;
  } catch {
    /* Offline, or the chunk was purged from the CDN. The page keeps its
       native scroll; nothing else in this module cares. */
    started = false;
    return;
  }
  if (lenis) return;

  lenis = new Ctor({
    /* Mass, not duration. 0.11 is the point where a wheel notch still
       feels like it moved the page a hand's width but the tail is long
       enough to read as momentum rather than as a jump. */
    lerp: 0.11,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    /* The two deliberate exclusions: the wheel is smoothed, the finger
       is not. */
    smoothWheel: true,
    syncTouch: false,
    /* Let Lenis own in-page #hash links: it reads the target and eases
       there, and `scroll-padding-top` still applies because it is the
       browser doing the final positioning. */
    anchors: { offset: -clearance() },
    autoRaf: true,
  });

  /* A scene swap changes the document height without a window resize.
     Lenis watches with a ResizeObserver, but a React swap that replaces
     the whole subtree can land between its debounced reads; one manual
     resize on a history move keeps the limit honest. (pushState fires
     no native event — route changes that move the viewport call
     scrollToTop(), which resizes for them.)

     `load` may already have fired by the time the chunk arrives — the
     resize is harmless either way. */
  const resize = () => lenis?.resize();
  addEventListener("popstate", resize);
  addEventListener("load", resize);
  resize();

  /* The reader may have already scrolled between paint and this chunk
     landing. Adopt the real position instead of animating from a stale
     zero, or the first wheel notch yanks the page back to the top. */
  if (window.scrollY > 0) lenis.scrollTo(window.scrollY, { immediate: true });
}

/** Tear down (used by tests / hot reload). */
export function destroySmoothScroll(): void {
  lenis?.destroy();
  lenis = null;
  started = false;
  locks = 0;
}
