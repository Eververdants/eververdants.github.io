/* Runtime document-head manager, shared by every entry.
 *
 * The site is a set of SPAs, so a crawler that only fetches HTML would see
 * one generic head no matter which article it landed on. scripts/prerender.mjs
 * bakes the correct head into each static page — and this module keeps it
 * correct while the reader navigates client-side, so the head never disagrees
 * with what is on screen. Both paths use these same helpers, which is what
 * stops the baked and live heads from drifting apart.
 *
 * Every tag it writes is upserted by selector; nothing is duplicated on
 * repeated calls. */

export const SITE = "https://eververdants.github.io";

export interface Alternate {
  hreflang: string;
  href: string;
}

export interface HeadInput {
  title: string;
  description: string;
  /** Root-relative path or absolute URL. */
  path: string;
  image?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** e.g. "en_US" / "zh_CN" */
  locale?: string;
  localeAlternate?: string[];
  /** hreflang pairs, including a self reference and x-default. */
  alternates?: Alternate[];
  /** JSON-LD graph for this view; replaces any previously applied graph. */
  jsonLd?: unknown[];
  /** <html lang> */
  lang?: "en" | "zh";
}

export function absUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return SITE + path.replace(/^(?!\/)/, "/");
}

function upsertMeta(kind: "property" | "name", key: string, content: string) {
  const selector = `meta[${kind}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(kind, key);
    document.head.appendChild(el);
  }
  if (el.getAttribute("content") !== content) el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  let sel = `link[rel="${rel}"]`;
  for (const [k, v] of Object.entries(extra ?? {})) sel += `[${k}="${v}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    for (const [k, v] of Object.entries(extra ?? {})) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Replace the managed JSON-LD blocks (keyed so prerender can find them). */
export function setJsonLd(nodes: unknown[]): void {
  document.head
    .querySelectorAll('script[type="application/ld+json"][data-managed="seo"]')
    .forEach((el) => el.remove());
  for (const node of nodes) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.managed = "seo";
    script.textContent = JSON.stringify(node);
    document.head.appendChild(script);
  }
}

export function applyHead(input: HeadInput): void {
  const url = absUrl(input.path);
  const image = absUrl(input.image ?? "/og-image.png");

  document.title = input.title;
  if (input.lang) {
    document.documentElement.lang = input.lang === "zh" ? "zh-Hans" : "en";
  }

  upsertMeta("name", "description", input.description);
  upsertLink("canonical", url);

  upsertMeta("property", "og:title", input.title);
  upsertMeta("property", "og:description", input.description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:image", image);
  if (input.ogType) upsertMeta("property", "og:type", input.ogType);
  if (input.locale) upsertMeta("property", "og:locale", input.locale);
  if (input.ogType === "article") {
    if (input.publishedTime)
      upsertMeta("property", "article:published_time", input.publishedTime);
    if (input.modifiedTime)
      upsertMeta("property", "article:modified_time", input.modifiedTime);
  }

  /* twitter:* is a separate namespace — the old prerender pass updated only
     og:*, leaving every article sharing the site default on social cards. */
  upsertMeta("name", "twitter:title", input.title);
  upsertMeta("name", "twitter:description", input.description);
  upsertMeta("name", "twitter:image", image);

  if (input.alternates?.length) {
    document.head
      .querySelectorAll('link[rel="alternate"][data-managed="seo"]')
      .forEach((el) => el.remove());
    for (const a of input.alternates) {
      upsertLink("alternate", absUrl(a.href), {
        hreflang: a.hreflang,
        "data-managed": "seo",
      });
    }
  }

  if (input.jsonLd) setJsonLd(input.jsonLd);
}

/* ---------- reusable schema.org nodes ---------- */

export const PERSON = {
  "@type": "Person",
  name: "Eververdants",
  alternateName: "万山青未阑",
  url: `${SITE}/`,
  image: `${SITE}/og-image.png`,
  jobTitle: "High-school student · Open-source developer",
  knowsLanguage: ["en", "zh-Hans"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kunshan",
    addressRegion: "Jiangsu",
    addressCountry: "CN",
  },
  sameAs: [
    "https://github.com/Eververdants",
    "https://space.bilibili.com/2019959464",
  ],
} as const;

export function websiteLd(): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Eververdants",
    alternateName: "万山青未阑",
    url: `${SITE}/`,
    inLanguage: ["en", "zh-Hans"],
    publisher: PERSON,
  };
}

export function breadcrumbLd(
  trail: { name: string; path: string }[],
): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absUrl(t.path),
    })),
  };
}
