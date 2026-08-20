// Resolve a public-relative path against Vite's base URL so the same build
// works under any base (default "/photos/" for GitHub Pages, or "/" for
// standalone previews). Trailing slashes are normalized.
export const asset = (rel: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${base}${rel.replace(/^\/+/, "")}`;
};
