// Resolve a public-relative path against the site root so the same build
// works under any deployment (GitHub Pages root, preview server, …). The
// photos sub-site always lives at /photos/ (vite base "/"), so assets are
// root-absolute — matching how the blog and projects sub-sites reference
// shared /fonts, /works, … paths.
export const asset = (rel: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${base}${rel.replace(/^\/+/, "")}`;
};

const PHOTOS = "/photos";

/** Relative href back to the main site root from the current page. Fully
 *  relative (no hardcoded domain) so it works on any host: gallery at
 *  /photos/ → "../", a work at /photos/work/<slug>/ → "../../". */
export const mainSiteHref = (): string => {
  const p = location.pathname;
  if (p.startsWith(PHOTOS + "/work/")) return "../../";
  return "../";
};
