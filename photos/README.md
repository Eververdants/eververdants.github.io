# Photographs — a sub-site of eververdants.github.io

The photo journal lives **inside the main repo**, integrated exactly like the
`/blog/` and `/projects/` sub-sites: an SPA entry in the same Vite build,
deployed together in one `dist/`.

- **URL:** `https://eververdants.github.io/photos/`
- **Entry shell:** `photos/index.html`
- **Source:** `src/photos/` (own components, data, styles, and works)
- **Bilingual:** EN/中文 — language & theme share the same localStorage keys
  as the blog/projects sub-sites (`blog-lang` / `blog-theme`); toggling any
  one sub-site follows everywhere (`?lang=zh` / `?theme=dark` URL overrides
  work too).
- **Design:** warm paper / deep ink, Fraunces italic + Inter, CSS-columns
  masonry with rounded cards, category filter, hero with live counters, and a
  plain colour transition on theme switch (no reveal animation — the same
  behaviour all three sub-sites share).
- **Scroll:** Lenis smooth scroll + an embedded custom scrollbar (desktop
  only; reduced-motion and touch users get the native behaviour).
- **SEO/GEO:** `scripts/prerender.mjs` CDP-prerenders the gallery AND every
  `/photos/work/<slug>/` detail page (Photograph JSON-LD per page) into
  `dist/photos/`, so crawlers and AI engines read full content without JS.
  `sitemap.xml` lists the gallery + every work; `llms.txt` points at the
  collection.

## Add a new work

```bash
npm run new-work -- --slug my-work --title "A Morning" --category LANDSCAPE
```

Interactive in a terminal (no flags → prompts). It creates
`src/photos/works/<slug>.md` and ensures `public/works/<slug>/`. Drop the cover
image at `public/works/<slug>/cover.webp` (any extra images in the same folder
are auto-detected as gallery), then run `npm run build` (or `npm run dev`).
The work appears at `https://eververdants.github.io/photos/work/<slug>/`.

See the HTML comment at the bottom of any generated `.md` for the optional
frontmatter fields (EXIF, `featured`, `order`, and the Chinese fields
`titleZh` / `descriptionZh` / `locationZh`).

## Data & conventions

- Works metadata: `src/photos/works/*.md` (frontmatter), scanned at build time
  by `src/photos/build/worksIndexPlugin.ts` → `virtual:works-index`.
- Categories: `src/photos/data/categories.ts` (single source of truth,
  bilingual `label` / `labelZh`; the script above reads it to validate
  `--category`).
- Images: `public/works/<slug>/…`, referenced public-relative
  (`works/<slug>/cover.webp`) and resolved against the root base at runtime.
- Routing: **path-based** `/photos/` ↔ `/photos/work/<slug>/` (matching the
  prerendered statics). All internal links are BASE-relative (`/photos/…`);
  nothing hardcodes a domain. The back-to-main-site links are fully relative
  (`../` on the gallery, `../../` on a work page).
- UI copy: `src/photos/lib/i18n.ts`; per-route SEO lives in
  `src/photos/lib/seo.ts` (title, canonical, OG, JSON-LD).

## Structure

```
photos/index.html              entry shell (SEO meta + FOUC-safe lang/theme boot)
src/photos/
├─ main.tsx                    entry
├─ App.tsx                     path router, prefs provider, Lenis + scrollbar boot
├─ build/worksIndexPlugin.ts   virtual:works-index (build-time)
├─ data/  (types, categories, parseWork, works)
├─ lib/   (i18n, prefs, seo, asset, format)
├─ components/ (Header, LangToggle, ThemeToggle, Gallery, WorkCard, WorkDetail, Footer)
├─ styles/global.css           design tokens (light + dark) + all rules
└─ works/*.md                  one file per work
scripts/new-work.mjs           `npm run new-work`
```
