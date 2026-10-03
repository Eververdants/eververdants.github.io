/* The photo journal's shell: routing and the document head, nothing else.

   Three routes, all path-addressed so each is a shareable URL that the
   prerender pass bakes (matching the statics + GitHub Pages):
     /photos/              → gallery
     /photos/work/<slug>/  → one work's detail page

   Lenis, the embedded custom scrollbar, the sub-site's own prefs context and
   its hand-rolled SEO module are all gone: the browser scrolls, the shared
   <site-topbar> navigates, ../shared/prefs remembers language and theme, and
   ../shared/seo writes the head — same helpers the hub and the blog use, so
   the baked and the live heads cannot drift apart. */

import { useEffect, useState, type MouseEvent } from "react";
import { Footer } from "./components/Footer";
import { Gallery } from "./components/Gallery";
import { WorkDetail } from "./components/WorkDetail";
import { getWork, getWorks } from "./data/works";
import type { Work } from "./data/types";
import { descOf, locOf, titleOf } from "./lib/i18n";
import { pick, type Lang } from "../shared/prefs";
import { usePrefs } from "../shared/prefs-react";
import { scrollToTop } from "../shared/smooth";
import { absUrl, applyHead, breadcrumbLd, PERSON, SITE } from "../shared/seo";

const PHOTOS = "/photos";
const GALLERY = `${PHOTOS}/`;
const WORK = `${PHOTOS}/work/`;

type Route = { name: "gallery" } | { name: "work"; slug: string };

const routeFromPath = (p: string): Route => {
  const norm = p.replace(/\/+$/, "");
  if (norm.startsWith(WORK)) {
    const slug = decodeURIComponent(norm.slice(WORK.length));
    if (slug) return { name: "work", slug };
  }
  return { name: "gallery" };
};

const parseRoute = (): Route => routeFromPath(location.pathname);

const workPath = (slug: string) => `${WORK}${slug}/`;

/* Head copy. The gallery title is the section's name, so it stays English in
   both languages — only its description localises. */
const GALLERY_TITLE = "Photographs — Eververdants";
const GALLERY_DESC: Record<Lang, string> = {
  en: "A photographic journal — landscapes, architecture, and quiet rooms.",
  zh: "Eververdants 的摄影集 —— 山川、建筑，以及其间安静的角落。",
};

/* Unlike the blog, photos carries its language in the query string
   (?lang=zh) rather than in the path, so every URL pairs with itself. */
const alternatesFor = (path: string) => [
  { hreflang: "en", href: `${path}?lang=en` },
  { hreflang: "zh-Hans", href: `${path}?lang=zh` },
  { hreflang: "x-default", href: path },
];

const localeFor = (lang: Lang) => ({
  locale: lang === "zh" ? "zh_CN" : "en_US",
  localeAlternate: lang === "zh" ? ["en_US"] : ["zh_CN"],
});

/** One work as an ItemList member of the collection. */
const listItem = (w: Work, i: number) => ({
  "@type": "ListItem",
  position: i + 1,
  item: {
    "@type": "Photograph",
    name: w.title,
    alternateName: w.titleZh,
    description: w.descriptionZh || w.description || undefined,
    contentLocation: w.locationZh || w.location,
    dateCreated: w.date,
    url: absUrl(workPath(w.slug)),
    image: absUrl(w.cover),
    author: { "@type": "Person", name: "Eververdants" },
  },
});

function applyGalleryHead(lang: Lang) {
  applyHead({
    title: GALLERY_TITLE,
    description: GALLERY_DESC[lang],
    path: GALLERY,
    ogType: "website",
    lang,
    ...localeFor(lang),
    alternates: alternatesFor(GALLERY),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: GALLERY_TITLE,
        alternateName: "摄影集",
        url: absUrl(GALLERY),
        inLanguage: ["en", "zh-Hans"],
        isPartOf: {
          "@type": "WebSite",
          name: "Eververdants",
          url: `${SITE}/`,
        },
        mainEntity: {
          "@type": "ItemList",
          name: "Photographs by Eververdants",
          itemListElement: getWorks().map(listItem),
        },
      },
      breadcrumbLd([
        { name: "Eververdants", path: "/" },
        { name: pick(lang, "Photographs", "摄影集"), path: GALLERY },
      ]),
    ],
  });
}

function applyWorkHead(work: Work, lang: Lang) {
  const title = titleOf(work, lang);
  const path = workPath(work.slug);
  const description = descOf(work, lang) || title;
  applyHead({
    title: `${title} — Photographs`,
    description,
    path,
    image: work.cover,
    ogType: "article",
    lang,
    ...localeFor(lang),
    alternates: alternatesFor(path),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Photograph",
        headline: title,
        alternateName: work.titleZh,
        description,
        dateCreated: work.date,
        contentLocation: locOf(work, lang),
        url: absUrl(path),
        image: [
          absUrl(work.cover),
          ...(work.gallery ?? []).map((g) => absUrl(g)),
        ],
        author: PERSON,
        publisher: PERSON,
      },
      breadcrumbLd([
        { name: "Eververdants", path: "/" },
        { name: pick(lang, "Photographs", "摄影集"), path: GALLERY },
        { name: title, path },
      ]),
    ],
  });
}

export function App() {
  const { lang } = usePrefs();
  const [route, setRoute] = useState<Route>(() => parseRoute());

  /* SEO per route + guard against unknown slugs (a deep link to a removed
     work falls back to the gallery without a history entry). Re-runs on
     language change so title/OG/JSON-LD follow the UI language. */
  useEffect(() => {
    if (route.name !== "work") {
      applyGalleryHead(lang);
      return;
    }
    const w = getWork(route.slug);
    if (!w) {
      history.replaceState(null, "", GALLERY);
      setRoute({ name: "gallery" });
      return;
    }
    applyWorkHead(w, lang);
  }, [route, lang]);

  /* Browser back/forward. */
  useEffect(() => {
    const onPop = () => {
      setRoute(parseRoute());
      scrollToTop();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* Delegate in-app navigation: intercept <a href="/photos/..."> clicks and
     swap routes with pushState (full page loads still work without JS).
     Every other link — the top bar above all — is left alone, so it loads
     the entry it belongs to. There is no "back to the main site" control
     on this page on purpose: the shared bar already carries Home. */
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest?.(
      "a[href]",
    ) as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (!href.startsWith(PHOTOS + "/")) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    const url = new URL(a.href, location.origin);
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    history.pushState(null, "", url.pathname + url.search + url.hash);
    setRoute(routeFromPath(url.pathname));
    scrollToTop();
  };

  /* Route changes swap the whole scene; land keyboard and screen-reader focus
     on the new content instead of leaving it on the unmounted card's ghost
     position in <body>. (Back/forward lands here too, via the same state.) */
  useEffect(() => {
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [route]);

  return (
    <>
      <site-topbar active="photos" search />
      <site-palette />
      <div className="photos" onClick={onClick}>
        <main id="main" className="shell shell--photos" tabIndex={-1}>
          {route.name === "gallery" ? (
            <Gallery />
          ) : (
            <WorkDetail slug={route.slug} />
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
