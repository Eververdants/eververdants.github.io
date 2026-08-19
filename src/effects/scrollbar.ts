/* Custom overlay scrollbar — fixed, never affects layout. */

import type Lenis from "lenis";

export function initScrollbar(
  bar: HTMLElement,
  thumb: HTMLElement,
  lenis: Lenis | null,
): { destroy: () => void; resize: () => void } | null {
  if (!bar || !thumb) return null;

  const doc = document.documentElement;
  let hidden = false;
  const go = lenis
    ? (y: number) => lenis.scrollTo(y)
    : (y: number) => window.scrollTo(0, y);

  function size() {
    const sh = doc.scrollHeight - window.innerHeight;
    if (sh <= 0) {
      bar.style.display = "none";
      hidden = true;
      return;
    }
    if (hidden) {
      bar.style.display = "";
      hidden = false;
    }
    const track = bar.clientHeight;
    thumb.style.height =
      Math.max(24, (window.innerHeight / doc.scrollHeight) * track) + "px";
  }

  function update() {
    if (hidden) return;
    const sh = doc.scrollHeight - window.innerHeight;
    const track = bar.clientHeight;
    const max = track - thumb.offsetHeight;
    thumb.style.top = (sh > 0 ? (window.scrollY / sh) * max : 0) + "px";
  }

  size();
  update();

  let fontsTimer: number | undefined;

  function onResize() {
    size();
    update();
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", onResize);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      fontsTimer = window.setTimeout(function () {
        size();
        update();
      }, 0);
    });
  }

  /* drag thumb */
  let dragging = false;
  let startY = 0;
  let startTop = 0;

  function onMove(ev: MouseEvent) {
    if (!dragging) return;
    const track = bar.clientHeight;
    const max = track - thumb.offsetHeight;
    const sh = doc.scrollHeight - window.innerHeight;
    const top = Math.max(0, Math.min(max, startTop + (ev.clientY - startY)));
    thumb.style.top = top + "px";
    if (max > 0) go(sh * (top / max));
  }

  function onUp() {
    dragging = false;
    bar.classList.remove("dragging");
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  }

  function onThumbDown(e: MouseEvent) {
    dragging = true;
    startY = e.clientY;
    startTop = thumb.offsetTop;
    e.preventDefault();
    bar.classList.add("dragging");
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
  thumb.addEventListener("mousedown", onThumbDown);

  /* click on track: jump thumb to click point */
  function onBarDown(e: MouseEvent) {
    if (e.target === thumb) return;
    const track = bar.clientHeight;
    const max = track - thumb.offsetHeight;
    const sh = doc.scrollHeight - window.innerHeight;
    const top =
      e.clientY - bar.getBoundingClientRect().top - thumb.offsetHeight / 2;
    const clamped = Math.max(0, Math.min(max, top));
    thumb.style.top = clamped + "px";
    if (max > 0) go(sh * (clamped / max));
  }
  bar.addEventListener("mousedown", onBarDown);

  /* Re-measure thumb height + position. Exposed so the app can call it after
     the document height changes without a window resize — e.g. the sub-site
     hides/reveals the main site and the scrollbar would otherwise keep the
     old page's thumb size. */
  const resize = () => {
    size();
    update();
  };

  /* General catch-all: the sub-site ↔ main-site ↔ article swaps change the
     body height without a window resize, so no resize event fires. Watch the
     body and re-measure on any height change — covers every transition. */
  let bodyObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== "undefined" && document.body) {
    bodyObserver = new ResizeObserver(resize);
    bodyObserver.observe(document.body);
  }

  return {
    destroy: function () {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      thumb.removeEventListener("mousedown", onThumbDown);
      bar.removeEventListener("mousedown", onBarDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (fontsTimer !== undefined) clearTimeout(fontsTimer);
      if (bodyObserver) bodyObserver.disconnect();
    },
    resize,
  };
}
