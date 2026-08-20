/* Per-route SEO/GEO — the photos app owns the document head just like the
   other sub-sites: title, canonical, OG and a JSON-LD block are written for
   the gallery (CollectionPage + ItemList of every work) and for each detail
   page (Photograph). The prerender pass (scripts/prerender.mjs) captures
   this rendered head into the static HTML, so crawlers and AI engines get
   the full picture without running JS. */
import type { Work } from "../data/types";
import type { Lang } from "./i18n";
import { titleOf, descOf, locOf } from "./i18n";

const SITE = "https://eververdants.github.io";
const GALLERY_URL = `${SITE}/photos/`;

const LD_ID = "photos-ld";

function setLd(obj: unknown) {
  let el = document.getElementById(LD_ID) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = LD_ID;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(obj);
}

function setMeta(selector: string, attr: string, value: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (el) el.setAttribute(attr, value);
}

const workUrl = (slug: string) => `${SITE}/photos/work/${slug}/`;

export function applyGallerySeo(works: Work[], lang: Lang) {
  document.title = "Photographs — Eververdants";
  setMeta('link[rel="canonical"]', "href", GALLERY_URL);
  setMeta('meta[property="og:type"]', "content", "website");
  setMeta('meta[property="og:title"]', "content", "Photographs — Eververdants");
  setMeta(
    'meta[property="og:description"]',
    "content",
    lang === "zh"
      ? "Eververdants 的摄影集 —— 山川、建筑，以及其间安静的角落。"
      : "A photographic journal — landscapes, architecture, and quiet rooms.",
  );
  setMeta('meta[property="og:url"]', "content", GALLERY_URL);
  setMeta('meta[property="og:image"]', "content", `${SITE}/og-image.png`);
  setMeta('meta[name="twitter:title"]', "content", "Photographs — Eververdants");
  setMeta('meta[name="twitter:description"]', "content",
    lang === "zh"
      ? "Eververdants 的摄影集 —— 山川、建筑，以及其间安静的角落。"
      : "A photographic journal — landscapes, architecture, and quiet rooms.",
  );
  setMeta('meta[name="twitter:image"]', "content", `${SITE}/og-image.png`);

  setLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Photographs — Eververdants",
    alternateName: "摄影集",
    url: GALLERY_URL,
    inLanguage: ["en", "zh-Hans"],
    isPartOf: {
      "@type": "WebSite",
      name: "Eververdants",
      url: `${SITE}/`,
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Photographs by Eververdants",
      itemListElement: works.map((w, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Photograph",
          name: w.title,
          alternateName: w.titleZh,
          description: w.descriptionZh || w.description || undefined,
          contentLocation: w.locationZh || w.location,
          dateCreated: w.date,
          url: workUrl(w.slug),
          image: `${SITE}/${w.cover}`,
          author: { "@type": "Person", name: "Eververdants" },
        },
      })),
    },
  });
}

export function applyWorkSeo(work: Work, lang: Lang) {
  const title = titleOf(work, lang);
  const url = workUrl(work.slug);
  const desc = descOf(work, lang) || title;
  const head = `${title} — Photographs`;
  document.title = head;
  setMeta('link[rel="canonical"]', "href", url);
  setMeta('meta[property="og:type"]', "content", "article");
  setMeta('meta[property="og:title"]', "content", head);
  setMeta('meta[property="og:description"]', "content", desc);
  setMeta('meta[property="og:url"]', "content", url);
  setMeta('meta[property="og:image"]', "content", `${SITE}/${work.cover}`);
  setMeta('meta[name="twitter:title"]', "content", head);
  setMeta('meta[name="twitter:description"]', "content", desc);
  setMeta('meta[name="twitter:image"]', "content", `${SITE}/${work.cover}`);

  setLd({
    "@context": "https://schema.org",
    "@type": "Photograph",
    headline: title,
    alternateName: work.titleZh,
    description: desc,
    dateCreated: work.date,
    contentLocation: locOf(work, lang),
    url,
    image: [`${SITE}/${work.cover}`, ...(work.gallery ?? []).map((g) => `${SITE}/${g}`)],
    author: {
      "@type": "Person",
      name: "Eververdants",
      alternateName: "万山青未阑",
      url: `${SITE}/`,
    },
    publisher: { "@type": "Person", name: "Eververdants", url: `${SITE}/` },
  });
}
