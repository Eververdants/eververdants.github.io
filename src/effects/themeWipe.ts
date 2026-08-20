/* themeWipe.ts — the blog's light↔dark transition.
 *
 * Uses the View Transitions API (document.startViewTransition): the browser
 * snapshots the current page, we flip `data-theme` synchronously, and the
 * NEW snapshot reveals over the old with a circular clip-path that blooms
 * from the toggle button's position — the ::view-transition-new(root)
 * animation lives in global.css, keyed off --wipe-x/--wipe-y (set on
 * <html> here). The REAL page animates, so grid, text and colors stay in
 * perfect registration: no fake discs, no seams, no flash.
 *
 * Falls back to an instant flip when the API is unavailable or the user
 * prefers reduced motion. */

export type Theme = "light" | "dark";

interface ViewTransitionLike {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}

declare global {
  interface Document {
    startViewTransition?: (update: () => void) => ViewTransitionLike;
  }
}

let transitioning = false;

/** True while a reveal is animating — used to ignore rapid repeat clicks. */
export function isThemeWipeActive(): boolean {
  return transitioning;
}

/** Reveal `to` out of `origin` (a viewport point, usually the theme
 *  button's center). The attribute flip happens synchronously INSIDE the
 *  transition callback so the new snapshot definitely captures it. */
export function runThemeWipe(
  to: Theme,
  origin: { x: number; y: number },
): void {
  if (transitioning) return;

  const root = document.documentElement;
  const apply = () => {
    root.dataset.theme = to;
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof document.startViewTransition !== "function") {
    apply();
    return;
  }

  transitioning = true;
  root.style.setProperty("--wipe-x", `${Math.round(origin.x)}px`);
  root.style.setProperty("--wipe-y", `${Math.round(origin.y)}px`);

  const vt = document.startViewTransition(apply);
  vt.finished
    .catch(() => {
      /* interrupted (navigation etc.) — nothing to clean beyond the flag */
    })
    .finally(() => {
      root.style.removeProperty("--wipe-x");
      root.style.removeProperty("--wipe-y");
      transitioning = false;
    });
}
