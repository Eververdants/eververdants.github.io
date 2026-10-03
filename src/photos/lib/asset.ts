// Resolve a public-relative path against the site root so the same build
// works under any deployment (GitHub Pages root, preview server, …). The
// photos sub-site always lives at /photos/ (vite base "/"), so assets are
// root-absolute — matching how the blog and projects sub-sites reference
// shared /fonts, /works, … paths.
export const asset = (rel: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${base}${rel.replace(/^\/+/, "")}`;
};
