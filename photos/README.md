# Photographs — a sub-site of eververdants.github.io

The photo journal lives **inside the main repo**, integrated exactly like the
`/blog/` sub-site: a third SPA entry in the same Vite build, deployed together
in one `dist/`.

- **URL:** `https://eververdants.github.io/photos/`
- **Entry shell:** `photos/index.html`
- **Source:** `src/photos/` (own components, data, styles, and works)
- **Design:** warm paper / deep ink, Fraunces italic + Inter, CSS-columns
  masonry, category filter, light/dark theme (shares `blog-theme` key with the
  blog, so one toggle syncs every sub-site).
- **SEO/GEO:** the gallery is CDP-prerendered into `dist/photos/index.html` by
  `scripts/prerender.mjs` (same mechanism as `/blog/` and `/projects/`), so
  crawlers and AI engines read the full work list without JS.

## Add a new work

```bash
npm run new-work -- --slug my-work --title "A Morning" --category LANDSCAPE
```

Interactive in a terminal (no flags → prompts). It creates
`src/photos/works/<slug>.md` and ensures `public/works/<slug>/`. Drop the cover
image at `public/works/<slug>/cover.webp` (any extra images in the same folder
are auto-detected as gallery), then run `npm run build` (or `npm run dev`).

See the HTML comment at the bottom of any generated `.md` for the optional
frontmatter fields (EXIF, `featured`, `order`).

## Data & conventions

- Works metadata: `src/photos/works/*.md` (frontmatter), scanned at build time
  by `src/photos/build/worksIndexPlugin.ts` → `virtual:works-index`.
- Categories: `src/photos/data/categories.ts` (single source of truth; the
  script above reads it to validate `--category`).
- Images: `public/works/<slug>/…`, referenced public-relative
  (`works/<slug>/cover.webp`) and resolved against the root base at runtime.
- Routing: hash-based (`/#/work/<slug>`), so deep links survive GitHub Pages'
  static hosting without server rewrites.

## Structure

```
photos/index.html              entry shell (SEO meta + FOUC-safe theme boot)
src/photos/
├─ main.tsx                    entry
├─ App.tsx                     hash router, theme, scroll-to-top
├─ build/worksIndexPlugin.ts   virtual:works-index (build-time)
├─ data/  (types, categories, parseWork, works)
├─ lib/   (asset, format)
├─ components/ (Header, ThemeToggle, Gallery, WorkCard, WorkDetail, Footer)
├─ styles/global.css           design tokens (light + dark) + all rules
└─ works/*.md                  one file per work
scripts/new-work.mjs           `npm run new-work`
```
