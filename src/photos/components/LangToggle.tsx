import { usePhotosPrefs } from "../lib/prefs";

/* EN/中 typographic pair — the active script sits in full ink with a thin
   accent underline that glides between the two; the inactive one is faint.
   Persists to blog-lang so the blog/projects sub-sites follow. */
export function LangToggle() {
  const { lang, setLang } = usePhotosPrefs();
  return (
    <div className="lang-pair" role="group" aria-label="Language">
      <span
        aria-hidden
        className="lang-underline"
        style={{ transform: `translateX(${lang === "zh" ? "100%" : "0"})` }}
      />
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`lang-btn ${lang === "en" ? "is-active" : ""}`}
        title="English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
        className={`lang-btn ${lang === "zh" ? "is-active" : ""}`}
        title="中文"
      >
        中
      </button>
    </div>
  );
}
