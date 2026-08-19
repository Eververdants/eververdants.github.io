/* Cross-site navigation interceptor. The two entries are separate SPAs, so a
   main site ↔ blog swap is a full page load. This catches those clicks
   (capture phase, so it runs before anything else), flags the navigation in
   sessionStorage for the incoming page, fires "site-nav-start" so the current
   page can cover itself with the LOADING overlay, then navigates once the
   overlay has faded in — instead of cutting straight from one site to the
   other.

   Only same-origin cross-site links are intercepted: from the main site any
   href starting with /blog (VISIT THE BLOG + every reading-deck spread),
   from the blog the link back to / (VISIT THE MAIN SITE). Modified clicks
   (meta/ctrl/shift, non-left button, target=_blank) pass through untouched. */
export function initSiteNavIntercept(): () => void {
  let navigating = false;

  const onClick = (e: MouseEvent) => {
    if (navigating) return;
    const el = e.target as Element | null;
    const a = el?.closest?.("a");
    const href = a?.getAttribute("href");
    if (!a || !href) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    if (a.target && a.target !== "_self") return;

    const fromBlog = location.pathname.replace(/\/+$/, "").startsWith("/blog");
    const cross = fromBlog
      ? href === "/" || href === ""
      : href.startsWith("/blog");
    if (!cross) return;

    e.preventDefault();
    navigating = true;
    sessionStorage.setItem("__siteNavFrom", fromBlog ? "blog" : "main");
    window.dispatchEvent(new CustomEvent("site-nav-start"));
    // Long enough for the 米白 cover to fade in (0.25s) and hold, short
    // enough that the swap still feels snappy. The cover stays opaque here;
    // the incoming page fades it out.
    window.setTimeout(() => {
      window.location.href = a.href;
    }, 550);
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
