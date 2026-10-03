import type { JournalPost } from "../../data/journal";
import { usePrefs } from "../../shared/prefs-react";
import { articlePath, isPlainClick } from "../urls";
import Highlight from "./Highlight";
import PixelSigil from "./PixelSigil";

/* The plain chronological essay list — rows, not cards — shared by the
   blog index (tag-filtered views, search results) and every 专题 topic
   page (/blog/topic/<id>). One row: date / Fraunces title / one-line
   excerpt / reading time + arrow, separated by hairlines, with a quiet
   accent wash on hover. Newest first — callers sort.

   The href carries the reader's language so a row points at the same
   language page they were looking at, not always English. */

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
  const { lang } = usePrefs();
  return (
    <ul className={className}>
      {posts.map((post, i) => (
        <li
          key={post.slug}
          className={
            i === posts.length - 1
              ? ""
              : "border-b border-[var(--border-soft)]"
          }
        >
          {/* A real href keeps every row crawlable (crawlers discover pages
              through <a>, never button onClick) and makes middle-click /
              ctrl+click "open in new tab" work; the click handler preserves
              the in-app SPA swap. */}
          <a
            href={articlePath(post.slug, lang)}
            onClick={(e) => {
              if (!isPlainClick(e)) return;
              e.preventDefault();
              onOpen(post.slug);
            }}
            className="group block w-full py-[clamp(16px,2.4vh,26px)] text-left transition-[background-color,transform] duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--accent)_3.5%,transparent)] focus-visible:outline-2 focus-visible:outline-[var(--ink)] focus-visible:outline-offset-[-3px]"
          >
            <div className="sm:grid sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-start sm:gap-x-5">
              {/* cover — the post's own pixel sigil, then the date under
                  it. Hidden on a phone, where the row needs the width for
                  the title and the meta moves into the line above it. */}
              <span className="hidden flex-col items-start gap-2 sm:flex">
                <PixelSigil seed={post.slug} className="h-10 w-10" />
                <span className="text-[10px] font-medium tracking-[0.22em] tabular-nums text-[var(--faint)]">
                  {post.date}
                </span>
              </span>

              <span className="block min-w-0">
                {/* mobile meta — date · read on one quiet line */}
                <span className="mb-1 flex items-baseline gap-2 text-[9.5px] tracking-[0.2em] text-[var(--faint)] sm:hidden">
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
                <span className="mt-1 block max-w-[62ch] text-[13px] leading-[1.6] text-[var(--muted)] line-clamp-1">
                  <Highlight text={post.excerpt} terms={terms} />
                </span>
                {/* Tags, as a ruled line of small caps under the excerpt.
                    Not chips: a row of boxes here would turn the list
                    into a wall of buttons. */}
                {post.tagLabels.length > 0 && (
                  <span className="mt-[7px] hidden flex-wrap items-center gap-x-3 sm:flex">
                    {post.tagLabels.slice(0, 3).map((label, k) => (
                      <span
                        key={post.tags[k] ?? label}
                        className="text-[9.5px] tracking-[0.18em] text-[var(--faintest)]"
                      >
                        {label.toUpperCase()}
                      </span>
                    ))}
                  </span>
                )}
              </span>

              {/* read time + arrow — right column on desktop. The arrow
                  slides a whole cell (not a hair) and only on a device
                  that can hover: it is a pointer affordance, and a
                  sticky :hover on touch would leave it hanging out. */}
              <span className="hidden items-center gap-3 sm:flex sm:justify-end">
                <span className="text-[10px] tracking-[0.2em] text-[var(--faint)]">
                  {post.read}
                </span>
                <span
                  aria-hidden
                  className="text-[13px] text-[var(--fainter)] transition-transform duration-[320ms] [transition-timing-function:var(--ease-out)] motion-safe:group-hover:translate-x-1"
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
