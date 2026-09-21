/* The navigation hub.
 *
 * This page does one job: orient a visitor and hand them off. It is not a
 * portfolio in miniature — the writing, the works and the photographs each
 * live in their own sub-site. What stays here is the minimum that saves a
 * click: who this is, whether I am available, and the three most recent
 * things in each column, with counts so you know how deep a section goes
 * before opening it.
 *
 * No scroll library, no canvas, no intro. Everything below is present in the
 * prerendered HTML, which is the point: a crawler or a language model reading
 * this page gets the whole navigation graph in one pass. */

import { useEffect, useMemo, useState } from "react";
import { getDeck } from "../data/articles";
import { resume } from "../data/resume";
import { getWorks } from "../photos/data/works";
import reposFile from "../projects/data/repos.json";
import { applyHead, breadcrumbLd, websiteLd, SITE } from "../shared/seo";
import { usePrefs } from "../shared/prefs-react";
import { COPY } from "./copy";
import type { HubCopy } from "./copy";

interface Repo {
  name: string;
  url: string;
  description: string;
  language: string | null;
  stars: number;
  pushedAt: string;
  featured: boolean;
  archived: boolean;
  tag?: string;
  blurbEn?: string;
  blurbZh?: string;
}

const REPOS = (reposFile.repos ?? []) as unknown as Repo[];

/* \n is an editorial line break in the display copy; the hub wants one line. */
const inline = (s: string) => s.replace(/\n/g, " ");

/* Trim to one preview line without cutting a word in half. */
function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[,.;:—-]$/, "")}…`;
}

function pickRepoBlurb(repo: Repo, lang: "en" | "zh"): string {
  const blurb = lang === "zh" ? repo.blurbZh : repo.blurbEn;
  return (blurb || repo.description || "").trim();
}

function shortDate(iso: string): string {
  return iso.slice(0, 10);
}

export default function Hub() {
  const { lang } = usePrefs();
  const c: HubCopy = COPY[lang];

  const posts = useMemo(() => getDeck(lang), [lang]);
  const works = useMemo(() => getWorks(), []);
  const repos = useMemo(
    () =>
      [...REPOS]
        .filter((r) => !r.archived)
        .sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) || b.stars - a.stars,
        ),
    [],
  );

  useEffect(() => {
    applyHead({
      title: c.docTitle,
      description: c.docDescription,
      path: "/",
      ogType: "website",
      locale: lang === "zh" ? "zh_CN" : "en_US",
      localeAlternate: lang === "zh" ? ["en_US"] : ["zh_CN"],
      lang,
      alternates: [
        { hreflang: "en", href: "/?lang=en" },
        { hreflang: "zh-Hans", href: "/?lang=zh" },
        { hreflang: "x-default", href: "/" },
      ],
      jsonLd: [
        websiteLd(),
        breadcrumbLd([{ name: "Eververdants", path: "/" }]),
      ],
    });
  }, [c, lang]);

  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  async function copyWechat() {
    const handle = resume.contact.wechat ?? "";
    try {
      await navigator.clipboard.writeText(handle);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied("idle"), 2400);
  }

  const award = resume.awards[0];
  const awardLine = award
    ? `${award.results.map((r) => `${r.tier} (${r.scope})`).join(" · ")} — ${inline(award.contest)}`
    : "";

  return (
    <>
      <site-topbar active="home" />

      <main id="main" className="hub">
        {/* ---------- identity ---------- */}
        <section className="identity rise" aria-labelledby="hub-name">
          <div className="identity__mark">
            <span className="ring-field" aria-hidden="true" />
            <img
              src="/assets/avatar.webp"
              alt="Eververdants"
              width={72}
              height={72}
              fetchPriority="high"
            />
          </div>

          <div className="identity__text">
            <h1 id="hub-name" className="display identity__name">
              {c.name}
            </h1>
            <p className="identity__role">
              {c.chineseName} · {c.role}
            </p>
            <p className="lede identity__tagline">{c.tagline}</p>

            <dl className="facts">
              <div>
                <dt>{c.facts.based}</dt>
                <dd>{c.facts.basedValue}</dd>
              </div>
              <div>
                <dt>{c.facts.at}</dt>
                <dd>{c.facts.atValue}</dd>
              </div>
              <div>
                <dt>{c.facts.since}</dt>
                <dd className="num">{c.facts.sinceValue}</dd>
              </div>
            </dl>

            <p className="availability">
              <span className="availability__dot" aria-hidden="true" />
              {c.availability}
              <span className="availability__note">{c.availabilityNote}</span>
            </p>
          </div>
        </section>

        {/* ---------- portals ---------- */}
        <div className="portals">
          <article className="portal portal--wide glass sq-xl glass-sheen rise rise-1">
            <header className="portal__head">
              <span className="ring-mark" aria-hidden="true" />
              <h2 className="display portal__title">{c.portals.writing.label}</h2>
              <span className="portal__count num">
                {posts.length} {c.meta.essays}
              </span>
              <a className="portal__cta" href="/blog/">
                {c.portals.writing.cta} <span aria-hidden="true">→</span>
              </a>
            </header>
            <p className="portal__blurb">{c.portals.writing.blurb}</p>
            <ul className="feed">
              {posts.slice(0, 3).map((p) => (
                <li key={p.slug}>
                  <a className="feed__row" href={`/blog/${p.slug}/`}>
                    <span className="feed__meta num">
                      {shortDate(p.date)} · {p.read}
                    </span>
                    <span className="feed__title">{inline(p.title)}</span>
                    <span className="feed__tag">{p.category}</span>
                  </a>
                </li>
              ))}
              {posts.length === 0 && (
                <li className="feed__empty">{c.portals.writing.empty}</li>
              )}
            </ul>
          </article>

          <article className="portal glass sq-xl glass-sheen rise rise-2">
            <header className="portal__head">
              <span className="ring-mark" aria-hidden="true" />
              <h2 className="display portal__title">{c.portals.works.label}</h2>
              <span className="portal__count num">
                {repos.length} {c.meta.repos}
              </span>
              <a className="portal__cta" href="/projects/">
                {c.portals.works.cta} <span aria-hidden="true">→</span>
              </a>
            </header>
            <p className="portal__blurb">{c.portals.works.blurb}</p>
            <ul className="feed">
              {repos.slice(0, 3).map((r) => (
                <li key={r.name}>
                  <a
                    className="feed__row"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="feed__meta num">
                      ★ {r.stars} · {r.language ?? "—"}
                    </span>
                    <span className="feed__title">{r.name}</span>
                    <span className="feed__tag">
                      {clip(pickRepoBlurb(r, lang), 120)}
                    </span>
                  </a>
                </li>
              ))}
              {repos.length === 0 && (
                <li className="feed__empty">{c.portals.works.empty}</li>
              )}
            </ul>
          </article>

          <article className="portal glass sq-xl glass-sheen rise rise-3">
            <header className="portal__head">
              <span className="ring-mark" aria-hidden="true" />
              <h2 className="display portal__title">{c.portals.about.label}</h2>
              <a className="portal__cta" href="/about/">
                {c.portals.about.cta} <span aria-hidden="true">→</span>
              </a>
            </header>
            <p className="portal__blurb">{c.portals.about.blurb}</p>
            {awardLine && (
              <p className="portal__line">
                <span className="kicker">{c.portals.about.award}</span>
                {awardLine}
              </p>
            )}
            <ul className="chips">
              {resume.focus.slice(0, 6).map((f) => (
                <li key={f} className="chip sq-sm">
                  {f}
                </li>
              ))}
            </ul>
          </article>

          <article className="portal portal--wide glass sq-xl glass-sheen rise rise-4">
            <header className="portal__head">
              <span className="ring-mark" aria-hidden="true" />
              <h2 className="display portal__title">
                {c.portals.photos.label}
              </h2>
              <span className="portal__count num">
                {works.length} {c.meta.series}
              </span>
              <a className="portal__cta" href="/photos/">
                {c.portals.photos.cta} <span aria-hidden="true">→</span>
              </a>
            </header>
            <p className="portal__blurb">{c.portals.photos.blurb}</p>
            <ul className="strip">
              {works.slice(0, 3).map((w) => (
                <li key={w.slug}>
                  <a className="strip__cell" href={`/photos/work/${w.slug}/`}>
                    <img
                      src={`/${w.cover}`}
                      alt={lang === "zh" ? (w.titleZh ?? w.title) : w.title}
                      loading="lazy"
                      decoding="async"
                      width={320}
                      height={213}
                    />
                    <span className="strip__label">
                      {lang === "zh" ? (w.titleZh ?? w.title) : w.title}
                    </span>
                  </a>
                </li>
              ))}
              {works.length === 0 && (
                <li className="feed__empty">{c.portals.photos.empty}</li>
              )}
            </ul>
          </article>
        </div>

        {/* ---------- contact ---------- */}
        <section className="contact glass-panel sq-xl rise rise-5" aria-labelledby="hub-contact">
          <div>
            <h2 id="hub-contact" className="display contact__title">
              {c.contact.heading}
            </h2>
            <p className="lede contact__pitch">{c.contact.pitch}</p>
          </div>
          <div className="contact__actions">
            <div className="contact__wechat">
              <span className="kicker">{c.contact.wechat}</span>
              <code className="contact__handle">{resume.contact.wechat}</code>
              <button
                type="button"
                className="btn sq-md"
                onClick={copyWechat}
                aria-live="polite"
              >
                {copied === "done"
                  ? c.contact.copied
                  : copied === "failed"
                    ? c.contact.copyFailed
                    : c.contact.copy}
              </button>
            </div>
            <a
              className="btn btn--ghost sq-md"
              href={resume.contact.href}
              target="_blank"
              rel="noreferrer"
            >
              {c.contact.github} · {resume.contact.handle}
            </a>
          </div>
        </section>
      </main>

      <footer className="foot shell">
        <hr className="ring-rule" />
        <div className="foot__row">
          <p className="foot__line">
            © {new Date().getFullYear()} {c.name} — {c.footer.line}
          </p>
          <nav className="foot__links" aria-label="Footer">
            <a href="/LICENSE">
              {c.footer.code}
            </a>
            <a href="/rss.xml">{c.footer.rss}</a>
            <a href="/sitemap.xml">{c.footer.sitemap}</a>
            <a href="/llms.txt">{c.footer.llms}</a>
            <a href={`${SITE}/`}>Eververdants</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
