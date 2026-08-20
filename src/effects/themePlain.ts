/* themePlain.ts — the sub-sites' light↔dark transition.
 *
 * No View Transitions, no circular wipe: just a short-lived colour
 * transition. We add .theme-anim to <html> (the stylesheets give
 * html.theme-anim * a brief background/color/border transition), flip the
 * attribute synchronously, then drop the class. Reduced-motion users get an
 * instant flip. This is the single theme-switch behaviour shared by the
 * blog, projects and photos sub-sites. */

export type Theme = "light" | "dark";

const DURATION = 360;

/** Run `apply` (the attribute flip) with a plain colour transition. */
export function themeFlip(apply: () => void): void {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    apply();
    return;
  }
  root.classList.add("theme-anim");
  apply();
  window.setTimeout(() => root.classList.remove("theme-anim"), DURATION);
}
