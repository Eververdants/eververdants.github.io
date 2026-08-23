import type { JournalPost } from "../../data/journal";
import Highlight from "./Highlight";

/* The plain chronological essay list — rows, not cards — shared by the
   blog index (tag-filtered views, search results) and every 专题 topic
   page (/blog/topic/<id>). One row: date / Fraunces title / one-line
   excerpt / reading time + arrow, separated by hairlines, with a quiet
   accent wash on hover. Newest first — callers sort. */

export default function PostList({
  posts,
  terms,
  onOpen,
  className,
}: {
  posts: JournalPost[];
  terms: string[];
  onOpen: (slug: string) => void;
  className?: string;
}) {
  return (
    <ul className={className}>
      {posts.map((post, i) => (
        <li
          key={post.slug}
          className={
            i === posts.length - 1
              ? ""
              : "border-b border-[var(--border-faint)]"
          }
        >
          {/* A real href keeps every row crawlable (crawlers discover pages
              through <a>, never button onClick) and makes middle-click /
              ctrl+click "open in new tab" work; the click handler preserves
              the in-app SPA swap. */}
          <a
            href={`/blog/${post.slug}/`}
            onClick={(e) => {
              e.preventDefault();
              onOpen(post.slug);
            }}
            className="group block w-full py-[clamp(16px,2.4vh,26px)] text-left transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_3.5%,transparent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[-2px]"
          >
            <div className="sm:grid sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-baseline sm:gap-x-5">
              {/* date — left column on desktop, meta line on mobile */}
              <span className="hidden text-[10px] font-medium tracking-[0.22em] tabular-nums text-[var(--fainter)] sm:block">
                {post.date}
              </span>

              <span className="block min-w-0">
                {/* mobile meta — date · read on one quiet line */}
                <span className="mb-1 flex items-baseline gap-2 text-[9.5px] tracking-[0.2em] text-[var(--fainter)] sm:hidden">
                  <span>{post.date}</span>
                  <span aria-hidden className="text-[var(--faintest)]">
                    ·
                  </span>
                  <span>{post.read}</span>
                </span>

                <span className="block font-fraunces text-[clamp(17px,1.8vw,22px)] font-medium leading-snug tracking-[-0.01em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                  <Highlight
                    text={post.title.split("\n").join(" ")}
                    terms={terms}
                  />
                </span>
                <span className="mt-1 block max-w-[62ch] text-[13px] leading-[1.6] text-[var(--muted-2)] line-clamp-1">
                  <Highlight text={post.excerpt} terms={terms} />
                </span>
              </span>

              {/* read time + arrow — right column on desktop */}
              <span className="hidden items-center gap-3 sm:flex sm:justify-end">
                <span className="text-[10px] tracking-[0.2em] text-[var(--faintest)]">
                  {post.read}
                </span>
                <span
                  aria-hidden
                  className="text-[13px] text-[var(--fainter)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                >
                  →
                </span>
              </span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
