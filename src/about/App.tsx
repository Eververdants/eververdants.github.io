/* /about — the résumé page.
 *
 * This content used to exist only as scroll scenes on the old main site,
 * which meant it was invisible to any crawler that did not run JavaScript and
 * unreachable except by scrolling. It is a page now.
 *
 * All facts come from src/data/resume.ts so the hub's About portal and this
 * page cannot state different things about the same school or award. */

import { useEffect, useState } from "react";
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

  return (
    <>
      <site-topbar active="about" />

      <main id="main" className="about">
        <header className="about__hero rise">
          <span className="ring-mark" aria-hidden="true" />
          <h1 className="display about__title">{c.title}</h1>
          <p className="about__subtitle">{c.subtitle}</p>
          <p className="lede about__lede">{c.lede}</p>
        </header>

        {/* ---------- at a glance ---------- */}
        <section className="card glass sq-xl rise rise-1" aria-labelledby="glance">
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
            <div>
              <dt>{c.glance.contact}</dt>
              <dd>
                <code className="mono">{resume.contact.wechat}</code> ·{" "}
                <a href={resume.contact.href} rel="noreferrer">
                  GitHub
                </a>
              </dd>
            </div>
          </dl>
        </section>

        {/* ---------- bio ---------- */}
        <section className="card glass sq-xl rise rise-2" aria-labelledby="bio">
          <h2 id="bio" className="kicker card__title">
            {c.sections.bio}
          </h2>
          <p className="about__prose">{L(resume.about)}</p>
        </section>

        {/* ---------- education ---------- */}
        <section className="card glass sq-xl rise rise-3" aria-labelledby="education">
          <h2 id="education" className="kicker card__title">
            {c.sections.education}
          </h2>
          <div className="edu">
            <h3 className="display edu__school">
              {L(resume.education.school)}
            </h3>
            <dl className="edu__meta">
              <div>
                <dt>{c.education.role}</dt>
                <dd>{L(resume.education.role)}</dd>
              </div>
              <div>
                <dt>{c.education.location}</dt>
                <dd>{L(resume.education.location)}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ---------- awards ---------- */}
        {award && (
          <section className="card glass sq-xl rise rise-4" aria-labelledby="awards">
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
                <li key={r.tier.en} className="result glass sq-md">
                  <span className="result__tier display">{L(r.tier)}</span>
                  <span className="result__scope">{L(r.scope)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------- focus ---------- */}
        <section className="card glass sq-xl rise rise-4" aria-labelledby="focus">
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
        <section className="card glass sq-xl rise rise-5" aria-labelledby="work">
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
          <div className="work__contact">
            <div className="work__wechat">
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
            </div>
          </div>
        </section>

        {/* ---------- elsewhere ---------- */}
        <section className="card glass sq-xl rise rise-5" aria-labelledby="elsewhere">
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
          <p className="about__back">
            <a href="/">← {c.back}</a>
          </p>
        </section>
      </main>

      <footer className="about__foot">
        <hr className="ring-rule" />
        <p>{c.footer.replace("{year}", String(new Date().getFullYear()))}</p>
      </footer>
    </>
  );
}
