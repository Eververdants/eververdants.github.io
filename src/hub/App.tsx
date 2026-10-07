/* The navigation hub.
 *
 * This page does one job: orient a visitor and hand them off. It is not a
 * portfolio in miniature — the writing, the works and the photographs each
 * live in their own sub-site. What stays here is the minimum that saves a
 * click: who this is, whether I am available, and the three most recent
 * things in each column, with counts so you know how deep a section goes
 * before opening it.
 *
 * It is laid out as one sheet: a masthead, then a numbered plate per
 * destination, each held in the left margin by its index numeral. No scroll
 * library, no canvas, no intro. Everything below is present in the
 * prerendered HTML, which is the point: a crawler or a language model
 * reading this page gets the whole navigation graph in one pass. */

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { getLatest } from "../data/articles";
import { articlePath } from "../blog/urls";
import { resume } from "../data/resume";
import { getWorks } from "../photos/data/works";
import reposFile from "../projects/data/repos.json";
import { applyHead, breadcrumbLd, websiteLd, SITE } from "../shared/seo";
import { usePrefs } from "../shared/prefs-react";
import { pick } from "../shared/prefs";
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

  const posts = useMemo(() => getLatest(lang), [lang]);
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
    ? `${award.results
        .map((r) => `${pick(lang, r.tier.en, r.tier.zh)} (${pick(lang, r.scope.en, r.scope.zh)})`)
        .join(" · ")} — ${inline(pick(lang, award.contest.en, award.contest.zh))}`
    : "";

  return (
    <>
      <site-topbar active="home" search />
      <site-palette />

      {/* One sheet, trimmed with crop marks at two corners. */}
      <div className="sheet marks">
        <main id="main" className="hub">
          {/* ---------- masthead ---------- */}
          <section className="masthead rise" data-fx aria-labelledby="hub-name">
            {/* A guide box left on the screen: the arc motif as
                construction geometry rather than scenery. */}
            <span className="arc masthead__arc" aria-hidden="true" />

            <div className="masthead__lead">
              <div className="identity__mark">
                <img
                  src="/assets/avatar.webp"
                  alt="Eververdants"
                  width={72}
                  height={72}
                  fetchPriority="high"
                />
              </div>

              <div className="masthead__text">
                <h1
                  id="hub-name"
                  className="display masthead__name"
                  data-fx="chars"
                >
                  {c.name}
                </h1>
                <p className="masthead__role">
                  {c.chineseName}
                  <span className="masthead__sep" aria-hidden="true" />
                  {c.role}
                </p>
              </div>
            </div>

            <p className="lede masthead__tagline">{c.tagline}</p>

            <dl className="facts">
              <div>
                <dt>{c.facts.based}</dt>
                <dd>{pick(lang, resume.education.location.en, resume.education.location.zh)}</dd>
              </div>
              <div>
                <dt>{c.facts.at}</dt>
                <dd>{inline(pick(lang, resume.education.school.en, resume.education.school.zh))}</dd>
              </div>
              <div>
                <dt>{c.facts.since}</dt>
                <dd className="num">{c.facts.sinceValue}</dd>
              </div>
            </dl>

            {/* Availability is the one line that changes, so it is set
                below the standing data rather than squeezed into a fourth
                column of a table that otherwise never moves. */}
            <p className="availability">
              <span className="availability__flag" aria-hidden="true" />
              <span className="availability__state">{c.availability}</span>
              <span className="availability__note">{c.availabilityNote}</span>
            </p>
          </section>

          {/* ---------- writing ---------- */}
          <section
            className="plate rise rise-1"
            data-fx
            aria-labelledby="plate-writing"
          >
            <div className="plate__no index" aria-hidden="true">
              01
            </div>
            <div className="plate__body">
              <header className="plate__head">
                <h2 id="plate-writing" className="display plate__title">
                  {c.portals.writing.label}
                </h2>
                <span className="plate__count num">
                  {posts.length} {c.meta.essays}
                </span>
                <a className="plate__cta" href="/blog/">
                  {c.portals.writing.cta}
                </a>
              </header>
              <hr className="rule plate__rule" />
              <p className="plate__blurb">{c.portals.writing.blurb}</p>
              <ul className="feed">
                {posts.slice(0, 3).map((p) => (
                  <li key={p.slug}>
                    <a className="feed__row" href={articlePath(p.slug, lang)}>
                      <span className="feed__title">{inline(p.title)}</span>
                      <span className="feed__meta num">
                        {shortDate(p.date)}
                        <span aria-hidden="true"> · </span>
                        {p.read}
                      </span>
                      <span className="feed__tag">{p.category}</span>
                    </a>
                  </li>
                ))}
                {posts.length === 0 && (
                  <li className="feed__empty">{c.portals.writing.empty}</li>
                )}
              </ul>
            </div>
          </section>

          {/* ---------- works ---------- */}
          <section
            className="plate rise rise-2"
            data-fx
            style={{ "--fx-delay": "60ms" } as CSSProperties}
            aria-labelledby="plate-works"
          >
            <div className="plate__no index" aria-hidden="true">
              02
            </div>
            <div className="plate__body">
              <header className="plate__head">
                <h2 id="plate-works" className="display plate__title">
                  {c.portals.works.label}
                </h2>
                <span className="plate__count num">
                  {repos.length} {c.meta.repos}
                </span>
                <a className="plate__cta" href="/projects/">
                  {c.portals.works.cta}
                </a>
              </header>
              <hr className="rule plate__rule" />
              <p className="plate__blurb">{c.portals.works.blurb}</p>
              <ul className="ledger">
                {repos.slice(0, 4).map((r) => (
                  <li key={r.name}>
                    <a
                      className="ledger__row"
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="ledger__name">{r.name}</span>
                      <span className="ledger__stat num">
                        {r.language ?? "—"}
                        <span aria-hidden="true"> · </span>
                        {r.stars}
                      </span>
                      <span className="ledger__blurb">
                        {clip(pickRepoBlurb(r, lang), 150)}
                      </span>
                    </a>
                  </li>
                ))}
                {repos.length === 0 && (
                  <li className="feed__empty">{c.portals.works.empty}</li>
                )}
              </ul>
            </div>
          </section>

          {/* ---------- photographs ---------- */}
          <section
            className="plate rise rise-3"
            data-fx
            style={{ "--fx-delay": "120ms" } as CSSProperties}
            aria-labelledby="plate-photos"
          >
            <div className="plate__no index" aria-hidden="true">
              03
            </div>
            <div className="plate__body">
              <header className="plate__head">
                <h2 id="plate-photos" className="display plate__title">
                  {c.portals.photos.label}
                </h2>
                <span className="plate__count num">
                  {works.length} {c.meta.series}
                </span>
                <a className="plate__cta" href="/photos/">
                  {c.portals.photos.cta}
                </a>
              </header>
              <hr className="rule plate__rule" />
              <p className="plate__blurb">{c.portals.photos.blurb}</p>
              <ul className="strip">
                {works.slice(0, 3).map((w) => (
                  <li key={w.slug}>
                    <a className="strip__cell" href={`/photos/work/${w.slug}/`}>
                      <span className="strip__frame">
                        <img
                          src={`/${w.cover}`}
                          alt={lang === "zh" ? (w.titleZh ?? w.title) : w.title}
                          loading="lazy"
                          decoding="async"
                          width={320}
                          height={213}
                        />
                      </span>
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
            </div>
          </section>

          {/* ---------- about ---------- */}
          <section
            className="plate rise rise-4"
            data-fx
            style={{ "--fx-delay": "180ms" } as CSSProperties}
            aria-labelledby="plate-about"
          >
            <div className="plate__no index" aria-hidden="true">
              04
            </div>
            <div className="plate__body">
              <header className="plate__head">
                <h2 id="plate-about" className="display plate__title">
                  {c.portals.about.label}
                </h2>
                <a className="plate__cta" href="/about/">
                  {c.portals.about.cta}
                </a>
              </header>
              <hr className="rule plate__rule" />
              <p className="plate__blurb">{c.portals.about.blurb}</p>
              {awardLine && (
                <p className="plate__note">
                  <span className="kicker">{c.portals.about.award}</span>
                  {awardLine}
                </p>
              )}
              <ul className="chips">
                {resume.focus.slice(0, 6).map((f) => (
                  <li key={f.en} className="chip">
                    {pick(lang, f.en, f.zh)}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ---------- contact ---------- */}
          <section
            className="contact rise rise-5"
            data-fx
            aria-labelledby="hub-contact"
          >
            <div className="plate__no index" aria-hidden="true">
              05
            </div>
            <div className="plate__body">
              <h2 id="hub-contact" className="display contact__title">
                {c.contact.heading}
              </h2>
              <p className="lede contact__pitch">{c.contact.pitch}</p>
              <div className="contact__actions">
                <div className="contact__wechat">
                  <span className="kicker">{c.contact.wechat}</span>
                  <code className="contact__handle">{resume.contact.wechat}</code>
                  <button
                    type="button"
                    className="btn"
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
                  className="btn btn--ghost"
                  href={resume.contact.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.contact.github} · {resume.contact.handle}
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>

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
