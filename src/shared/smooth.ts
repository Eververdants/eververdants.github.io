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
 *   · Fight the boxes inside the page. A nested scrollport (the
 *     article's TOC rail, the palette's result list) gets its own
 *     instance from attachSmoothPort() and owns its wheel events; the
 *     page instance steps aside for it (`allowNestedScroll`) and takes
 *     the wheel back only once the box has reached its end.
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

/** The element a nested instance is driving, keyed by that element. */
const ports = new Map<HTMLElement, LenisInstance>();

/* The wheel direction of the event currently being dispatched. Lenis asks
   the page's `prevent(node)` during its own handler of the same event, and
   the capture listener each port installs on its box has already seen it —
   so this is never stale by the time it is read. */
let wheelDeltaY = 0;

/* Does this box still have somewhere to go in the wheel's direction? The
   page instances asks this to decide whether the wheel belongs to the box
   or to the page: while the box can move it keeps the gesture, and at
   either end the page takes over, so a short rail never traps the reader. */
function portConsumesWheel(el: HTMLElement, deltaY: number): boolean {
  const travel = el.scrollHeight - el.clientHeight;
  if (travel <= 0) return false;
  if (deltaY > 0) return el.scrollTop < travel - 1;
  if (deltaY < 0) return el.scrollTop > 1;
  return true;
}

/** The constructor, imported once. ~10 kB of scroll machinery that must
 *  never sit on the route to the first paint, so the first caller pays
 *  for it and everyone else — the page and every port — waits on the
 *  same promise. A failed load caches `null` rather than retrying on
 *  every scrollport that mounts. */
type LenisCtor = new (opts: Record<string, unknown>) => LenisInstance;
let ctorPromise: Promise<LenisCtor | null> | null = null;

function loadLenis(): Promise<LenisCtor | null> {
  ctorPromise ??= import("lenis")
    .then((m) => m.default as unknown as LenisCtor)
    .catch(() => null);
  return ctorPromise;
}

/* Give one scroll box the same treatment the page gets: its own instance,
 * its own rAF, its own momentum. Returns the teardown its owner must call
 * on unmount (a detached element would keep animating a scroll nothing can
 * see). Reduced-motion and touch readers get the platform's own box scroll,
 * exactly as they do for the page. */
export function attachSmoothPort(el: HTMLElement): () => void {
  if (reducedMotion() || coarsePointer()) return () => {};
  let released = false;
  /* Passive and capture-phase: it only records which way the gesture is
     going, for the page instance's prevent() — see wheelDeltaY. */
  const onWheel = (e: WheelEvent) => {
    wheelDeltaY = e.deltaY;
  };
  el.addEventListener("wheel", onWheel, { passive: true, capture: true });
  void loadLenis().then((Ctor) => {
    if (!Ctor || released || ports.has(el)) return;
    ports.set(
      el,
      new Ctor({
        /* wrapper === content: the box scrolls its own children, so its
           own scrollHeight is the travel. */
        wrapper: el,
        content: el,
        /* Only wheel events inside the box. The page instance hears the
           same events as they bubble and bows out — see allowNestedScroll
           on the page options. */
        eventsTarget: el,
        lerp: 0.11,
        wheelMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: true,
        /* Hand the wheel back to the page once the box is at its end,
           instead of trapping the reader inside a short list. */
        overscroll: true,
      }),
    );
  });
  return () => {
    released = true;
    el.removeEventListener("wheel", onWheel, { capture: true });
    const port = ports.get(el);
    if (!port) return;
    port.destroy();
    ports.delete(el);
  };
}

/** Scroll a port to an absolute offset inside its own box — the nested
 *  version of scrollToY(). Always go through this rather than assigning
 *  scrollTop: an instance holding an animated position snaps back to its
 *  own idea of where the box is. */
export function scrollPortTo(
  el: HTMLElement,
  y: number,
  immediate = false,
): void {
  const top = Math.max(0, y);
  const port = ports.get(el);
  if (port) {
    port.scrollTo(top, { immediate, force: true });
    return;
  }
  el.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
}

/** Re-measure one port. Called when the box was hidden while an instance
 *  was attached (a dialog that just opened) — its limit was 0 then. */
export function refreshSmoothPort(el: HTMLElement): void {
  ports.get(el)?.resize();
}

/** Re-measure the page. Called after a scene swap changes document height,
 *  and on a resize Lenis does not see (a dialog opening, an image loading
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
  const Ctor = await loadLenis();
  if (!Ctor) {
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
    /* A wheel event inside a nested scrollport (the TOC rail, the
       palette's list) belongs to that box's own instance while the box
       can still move in that direction; at either end the page takes the
       wheel back, so a short rail never traps the reader.

       Deliberately NOT Lenis's own allowNestedScroll: it walks every
       element in the event path, and this document's <body> is itself a
       scrollport (overflow-y: auto, ~10k px of content) — the page
       instance would conclude the wheel belonged to <body> and refuse to
       move at all. Only registered ports are consulted here. */
    prevent: (node: HTMLElement) =>
      ports.has(node) && portConsumesWheel(node, wheelDeltaY),
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
