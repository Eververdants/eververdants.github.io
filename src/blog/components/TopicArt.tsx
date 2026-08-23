import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { BlogTopic } from "../../data/journal";

/* 专题手账拼贴 — the scrapbook strip under each topic hero band. Three
   polaroids tilted and stacked with washi tape, captions, dots and a
   star sticker. Read left → right like a journal spread. A polaroid with
   an `img` shows the real photo over its tinted block (the block stays
   as the loading wash); one without keeps the pure color block.

   Lazy gating: the strip mounts only when it approaches the viewport
   (IntersectionObserver with a ~half-viewport margin) — so the photos'
   `loading="lazy"` fetches happen exactly when the strip scrolls near,
   never on first paint. */

/* IO gate — mounts once, disconnects after the first intersection. */
function useNearViewport<T extends HTMLElement>(marginPx = 480) {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: `${marginPx}px 0px ${marginPx}px 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [marginPx]);
  return { ref, near };
}

/* One polaroid — a paper frame, a photo (or the tinted color block
   while it loads / when there is none), a tape strip and a caption.
   `style` carries size; `rotate` tilts the tile. */
function ScrapPhoto({
  caption,
  img,
  rotate,
  delay,
  className,
  style,
}: {
  caption: string;
  img?: string;
  rotate: number;
  delay: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`scrap-photo scrap-in ${className ?? ""}`}
      style={{
        ...style,
        transform: `rotate(${rotate}deg)`,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* the tape goes on top of the frame's top edge */}
      <span className="scrap-tape" aria-hidden />
      {/* the tinted block doubles as the photo's loading wash; the img
          is fetched only when this strip scrolls near (lazy + gated) */}
      <span className="scrap-block" aria-hidden>
        {img && (
          <img src={img} alt="" loading="lazy" decoding="async" />
        )}
      </span>
      <span className="scrap-caption">{caption}</span>
    </div>
  );
}

/* A little star sticker — hand-drawn vibe, scattered over the collage. */
function StarSticker({
  className,
  delay,
}: {
  className?: string;
  delay: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`scrap-in absolute ${className ?? ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <path
        d="M12 2.5l2.5 5.9 6.4.5-4.9 4.2 1.5 6.3-5.5-3.2-5.5 3.2 1.5-6.3-4.9-4.2 6.4-.5z"
        fill="color-mix(in srgb, var(--topic, var(--accent)) 62%, var(--bg))"
        stroke="color-mix(in srgb, var(--topic, var(--accent)) 72%, var(--bg))"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* The three-tile strip: main / mid / small, bottom-aligned with heights
   stepping down and rotations alternating. `h` is set by the caller so the
   strip never jumps when the art mounts. */
export default function TopicArt({
  topic,
  lang,
}: {
  topic: BlogTopic;
  lang: "en" | "zh";
}) {
  const { ref, near } = useNearViewport<HTMLDivElement>();
  const cap = (i: number) =>
    `fig. ${String(i + 1).padStart(2, "0")} — ${topic.photos[i]?.[lang] ?? ""}`;

  return (
    <div
      ref={ref}
      aria-hidden
      data-topic-art
      className="relative flex h-[clamp(150px,24vh,210px)] w-full items-end justify-end gap-[clamp(12px,2.5vw,28px)]"
    >
      {near && (
        <>
          {/* main polaroid — tallest, tilted left */}
          <ScrapPhoto
            caption={cap(0)}
            img={topic.photos[0]?.img}
            rotate={-2.6}
            delay={0}
            className="h-[92%] w-[36%] max-w-[260px]"
          />
          {/* mid — steps down, tilted the other way */}
          <ScrapPhoto
            caption={cap(1)}
            img={topic.photos[1]?.img}
            rotate={3.4}
            delay={120}
            className="h-[72%] w-[28%] max-w-[200px]"
          />
          {/* small — tucked low */}
          <ScrapPhoto
            caption={cap(2)}
            img={topic.photos[2]?.img}
            rotate={-1.6}
            delay={240}
            className="h-[56%] w-[23%] max-w-[160px]"
          />

          {/* stickers */}
          <span
            className="scrap-dot scrap-in absolute left-[26%] top-[6%] h-3.5 w-3.5"
            style={{ animationDelay: "180ms" }}
          />
          <span
            className="scrap-dot scrap-in absolute right-[22%] top-[0%] h-2 w-2"
            style={{ animationDelay: "260ms" }}
          />
          <span
            className="scrap-dot scrap-in absolute left-[4%] bottom-[6%] h-2.5 w-2.5"
            style={{ animationDelay: "220ms" }}
          />
          <StarSticker
            className="left-[44%] bottom-[10%] h-6 w-6"
            delay={300}
          />
        </>
      )}
    </div>
  );
}
