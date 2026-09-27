/* Case-insensitive term highlighter for the blog search results. Splits the
   text on the query terms and wraps the matched substrings in <mark>, so the
   hits are scannable without changing the underlying text. */

interface HighlightProps {
  text: string;
  terms: string[];
}

export default function Highlight({ text, terms }: HighlightProps) {
  const active = terms.filter((t) => t.trim().length > 0);
  if (active.length === 0) return <>{text}</>;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${active.map(esc).join("|")})`, "ig");
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        active.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
          <mark
            key={i}
            className="bg-[var(--accent)] px-[1px] text-[var(--bg)]"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
