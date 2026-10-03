/* /about — the résumé page.
 *
 * This content used to exist only as scroll scenes on the old main site,
 * which meant it was invisible to any crawler that did not run JavaScript and
 * unreachable except by scrolling. It is a page now.
 *
 * All facts come from src/data/resume.ts so the hub's About portal and this
 * page cannot state different things about the same school or award.
 *
 * Layout: one hero that establishes the person, then a two-column body —
 * the long reading on the left (bio, trajectory, awards, focus, how to
 * hire), and a narrow rail on the right for the things a reader looks up
 * rather than reads (glance figures, contact, exits). The rail is sticky on
 * a desktop and stacks *after* the reading on a phone, which is the order a
 * phone reader wants: who they are first, how to reach them last.
 *
 * Everything is ruled, nothing is boxed: sections are opened by a hairline
 * that stops short of the measure, and the one floating tile on the page is
 * the portrait, which is genuinely a picture on a mount. */

import { useEffect, useState, type CSSProperties } from "react";
import { resume } from "../data/resume";
import { usePrefs } from "../shared/prefs-react";
import { pick } from "../shared/prefs";
import { applyHead, breadcrumbLd, websiteLd, PERSON } from "../shared/seo";
import { ABOUT_COPY } from "./copy";
import type { AboutCopy } from "./copy";

export default function AboutPage() {
  const { lang } = usePrefs();
  const c: AboutCopy = ABOUT_COPY[lang];
  const L = <T,>(o: { en: T; zh: T }) => pick(lang, o.en, o.zh);

  useEffect(() => {
    applyHead({
      title: c.docTitle,
      description: c.docDescription,
      path: "/about/",
      ogType: "profile",
      locale: lang === "zh" ? "zh_CN" : "en_US",
      localeAlternate: lang === "zh" ? ["en_US"] : ["zh_CN"],
      lang,
      alternates: [
        { hreflang: "en", href: "/about/?lang=en" },
        { hreflang: "zh-Hans", href: "/about/?lang=zh" },
        { hreflang: "x-default", href: "/about/" },
      ],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: { ...PERSON, description: c.docDescription },
          url: "https://eververdants.github.io/about/",
          inLanguage: lang === "zh" ? "zh-Hans" : "en",
        },
        websiteLd(),
        breadcrumbLd([
          { name: "Eververdants", path: "/" },
          { name: c.title, path: "/about/" },
        ]),
      ],
    });
  }, [c, lang]);

  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  async function copyWechat() {
    try {
      await navigator.clipboard.writeText(resume.contact.wechat ?? "");
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied("idle"), 2400);
  }

  const award = resume.awards[0];
  const fx = (delay: number) => ({ "--fx-delay": `${delay}ms` } as CSSProperties);

  return (
    <>
      <site-topbar active="about" search />
      <site-palette />

      <main id="main" className="about">
        {/* ---------- hero: the person ---------- */}
        <header className="about__hero" data-fx>
          <div className="about__identity">
            <span className="ring-mark" aria-hidden="true" />
            <h1 className="display about__title">{c.title}</h1>
            <p className="about__subtitle">{c.subtitle}</p>
            <p className="lede about__lede">{c.lede}</p>
          </div>
          {/* The portrait is the one thing on the page allowed to sit on a
              mount: a photograph, not a panel. Square, notched, one
              hairline — same frame the gallery gives a print. */}
          <figure className="about__portrait">
            <img
              src="/assets/avatar.webp"
              alt={pick(lang, "Eververdants", "Eververdants")}
              width={320}
              height={320}
            />
            <figcaption>
              <b className="num">{resume.birthYear}</b>
              <span>{L(resume.education.location)}</span>
            </figcaption>
          </figure>
        </header>

        <div className="about__grid">
          {/* ---------- the long reading ---------- */}
          <div className="about__main">
            <section className="card" data-fx aria-labelledby="bio" style={fx(0)}>
              <h2 id="bio" className="kicker card__title">
                {c.sections.bio}
              </h2>
              <p className="about__prose">{L(resume.about)}</p>
            </section>

            {/* ---------- trajectory ----------
                A timeline built only from facts that exist: no invented
                dates. Each row is a ruled line with the marker in the
                left column and the entry beside it — the shape a reader
                scans in one pass. */}
            <section
              className="card"
              data-fx
              aria-labelledby="path"
              style={fx(60)}
            >
              <h2 id="path" className="kicker card__title">
                {L({ en: "Path", zh: "轨迹" })}
              </h2>
              <ol className="timeline">
                <li>
                  <span className="timeline__when num">
                    {resume.birthYear}
                  </span>
                  <span className="timeline__what">
                    <b>{c.glance.born}</b>
                  </span>
                </li>
                <li>
                  <span className="timeline__when">
                    {L({ en: "Now", zh: "现在" })}
                  </span>
                  <span className="timeline__what">
                    <b className="display">{L(resume.education.school)}</b>
                    <span className="timeline__note">
                      {L(resume.education.role)} ·{" "}
                      {L(resume.education.location)}
                    </span>
                  </span>
                </li>
                <li>
                  <span className="timeline__when num">
                    {c.glance.sinceValue}
                  </span>
                  <span className="timeline__what">
                    <b>{c.glance.since}</b>
                  </span>
                </li>
              </ol>
            </section>

            {/* ---------- awards ---------- */}
            {award && (
              <section
                className="card"
                data-fx
                aria-labelledby="awards"
                style={fx(120)}
              >
                <h2 id="awards" className="kicker card__title">
                  {c.sections.awards}
                </h2>
                {award.campaign && (
                  <p className="about__campaign">{L(award.campaign)}</p>
                )}
                <h3 className="display about__contest">{L(award.contest)}</h3>
                <p className="about__event">{L(award.event)}</p>
                <ul className="results">
                  {award.results.map((r) => (
                    <li key={r.tier.en} className="result">
                      <span className="result__tier display">{L(r.tier)}</span>
                      <span className="result__scope">{L(r.scope)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ---------- focus ---------- */}
            <section
              className="card"
              data-fx
              aria-labelledby="focus"
              style={fx(60)}
            >
              <h2 id="focus" className="kicker card__title">
                {c.sections.focus}
              </h2>
              <ul className="chips">
                {resume.focus.map((f) => (
                  <li key={f.en} className="chip sq-sm">
                    {L(f)}
                  </li>
                ))}
              </ul>
            </section>

            {/* ---------- working with me ---------- */}
            <section
              className="card"
              data-fx
              aria-labelledby="work"
              style={fx(120)}
            >
              <h2 id="work" className="kicker card__title">
                {c.sections.work}
              </h2>
              <p className="lede">{c.work.pitch}</p>
              <ul className="items">
                {c.work.items.map((item) => (
                  <li key={item.title}>
                    <h3 className="items__title">{item.title}</h3>
                    <p className="items__note">{item.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ---------- the rail: things looked up, not read ---------- */}
          <aside className="about__aside">
            <section className="card" data-fx aria-labelledby="glance">
              <h2 id="glance" className="kicker card__title">
                {c.sections.glance}
              </h2>
              <dl className="glance">
                <div>
                  <dt>{c.glance.born}</dt>
                  <dd className="num">{resume.birthYear}</dd>
                </div>
                <div>
                  <dt>{c.glance.since}</dt>
                  <dd className="num">{c.glance.sinceValue}</dd>
                </div>
                <div>
                  <dt>{c.glance.languages}</dt>
                  <dd>{c.glance.languagesValue}</dd>
                </div>
              </dl>
            </section>

            <section className="card" data-fx aria-labelledby="contact">
              <h2 id="contact" className="kicker card__title">
                {L(resume.contact.label)}
              </h2>
              <div className="contact">
                <span className="kicker">{c.work.wechat}</span>
                <code className="mono">{resume.contact.wechat}</code>
                <button
                  type="button"
                  className="btn sq-md"
                  onClick={copyWechat}
                  aria-live="polite"
                >
                  {copied === "done"
                    ? c.work.copied
                    : copied === "failed"
                      ? c.work.copyFailed
                      : c.work.copy}
                </button>
                <span className="work__note">{c.work.wechatNote}</span>
                <a className="link-rule contact__alt" href={resume.contact.href} rel="noreferrer">
                  {resume.contact.handle} ↗
                </a>
              </div>
            </section>

            <section className="card" data-fx aria-labelledby="elsewhere">
              <h2 id="elsewhere" className="kicker card__title">
                {c.sections.elsewhere}
              </h2>
              <ul className="elsewhere">
                <li>
                  <a href="/blog/">{c.elsewhere.blog}</a>
                </li>
                <li>
                  <a href="/projects/">{c.elsewhere.works}</a>
                </li>
                <li>
                  <a href="/photos/">{c.elsewhere.photos}</a>
                </li>
                <li>
                  <a href="https://github.com/Eververdants" rel="noreferrer">
                    {c.elsewhere.github}
                  </a>
                </li>
                <li>
                  <a
                    href="https://space.bilibili.com/2019959464"
                    rel="noreferrer"
                  >
                    {c.elsewhere.bilibili}
                  </a>
                </li>
              </ul>
            </section>

            <p className="about__back">
              <a href="/">← {c.back}</a>
            </p>
          </aside>
        </div>
      </main>

      <footer className="about__foot">
        <hr className="ring-rule" />
        <p>{c.footer.replace("{year}", String(new Date().getFullYear()))}</p>
      </footer>
    </>
  );
}
