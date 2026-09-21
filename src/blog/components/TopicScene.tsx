import { useEffect, useMemo } from "react";
import { topicById, type JournalPost } from "../../data/journal";
import { getDeck } from "../../data/articles";
import { usePrefs } from "../../shared/prefs-react";
import { pick } from "../../shared/prefs";
import { applyHead, breadcrumbLd, SITE } from "../../shared/seo";
import { ui } from "../copy";
import PostList from "./PostList";

/* A 专题 page at /blog/topic/<id> — the essays filed under one theme,
   across columns. It used to open on a hero band with a scrapbook collage of
   tinted blocks; the theme's name, slogan and list carry the same
   information in a fraction of the page. */

const byDateDesc = (a: JournalPost, b: JournalPost) =>
  b.date.localeCompare(a.date);

export default function TopicScene({
  topicId,
  onClose,
  onOpen,
}: {
  topicId: string;
  onClose: () => void;
  onOpen: (slug: string) => void;
}) {
  const { lang } = usePrefs();
  const t = ui[lang];
  const topic = topicById.get(topicId);

  const posts = useMemo(() => {
    if (!topic) return [];
    return getDeck(lang)
      .filter((p) => p.topics.includes(topic.id))
      .sort(byDateDesc);
  }, [topic, lang]);

  useEffect(() => {
    if (!topic) return;
    const name = topic.name[lang];
    applyHead({
      title: `${name} — ${pick(lang, "Blog", "博客")} — Eververdants`,
      description: topic.slogan[lang],
      path: `/blog/topic/${topic.id}`,
      ogType: "website",
      locale: lang === "zh" ? "zh_CN" : "en_US",
      lang,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name,
          description: topic.slogan[lang],
          url: `${SITE}/blog/topic/${topic.id}`,
          inLanguage: lang === "zh" ? "zh-Hans" : "en",
          isPartOf: {
            "@type": "WebSite",
            name: "Eververdants",
            url: `${SITE}/`,
          },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: posts.length,
            itemListElement: posts.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE}/blog/${p.slug}/`,
              name: p.title.split("\n").join(" "),
            })),
          },
        },
        breadcrumbLd([
          { name: "Eververdants", path: "/" },
          { name: pick(lang, "Blog", "博客"), path: "/blog/" },
          { name, path: `/blog/topic/${topic.id}` },
        ]),
      ],
    });
  }, [topic, lang, posts]);

  if (!topic) return null;

  return (
    <section data-article className="blog-index">
      <header className="blog-index__head rise">
        <p className="blog-index__kicker">
          <button type="button" onClick={onClose}>
            ← {t.backToIndex}
          </button>
          <span aria-hidden style={{ color: topic.color }}>
            {topic.symbol}
          </span>
          {t.topicLabel}
        </p>
        <h1 className="display blog-index__title">{topic.name[lang]}</h1>
        <p className="lede blog-index__sub">
          {topic.slogan[lang]}
          <span className="blog-index__count num">
            {posts.length} {t.posts}
          </span>
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="blog-index__empty">{t.noSection}</p>
      ) : (
        <PostList posts={posts} terms={[]} onOpen={onOpen} />
      )}

      <footer className="blog-index__foot">
        <a href="/blog/">{t.backToIndex}</a>
        <a href="/">{t.backToHub}</a>
      </footer>
    </section>
  );
}
