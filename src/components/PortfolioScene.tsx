import { works } from "../data/works";

/* Third screen — SELECTED WORKS, a handscroll (手卷): vertical page scroll
   unrolls the scroll horizontally. A CSS-sticky viewport holds the track
   while gsap slides [data-hscroll-track] (gsap.ts) — the section gets JS-set
   scroll room. Panels carry web-optimized rounded-corner screenshots.
   English-only site.

   NOTE: this screen's background will later become 国风流沙 (Chinese flowing
   sand). The warm type is chosen to survive a sand-toned bg without rework. */

export default function PortfolioScene() {
  return (
    <section className="relative z-[1]" data-works data-hscroll>
      {/* Sticky viewport: holds the track while the section's JS-set height
          scrolls past. Sticky (not gsap pin) keeps the section in normal
          flow, so the horizontal scrub's measurements stay stable. */}
      <div className="sticky top-0 h-dvh overflow-hidden [contain:paint]">
        <div className="flex h-dvh w-max" data-hscroll-track>
          <TitlePanel />
          <ChapterPanel
            num="01"
            label="GITHUB PROJECTS"
            accent="text-[#10aec2]/80"
          />
          {works.projects.map((p, i) => (
            <ProjectPanel key={p.name} project={p} index={i} />
          ))}
          <ChapterPanel
            num="02"
            label="PHOTOGRAPHY"
            accent="text-[#f9a633]/80"
            warm
            notice={works.photography.notice}
          />
          {works.photos.map((ph, i) => (
            <PhotoPanel key={ph.title} photo={ph} index={i} />
          ))}
          <EndPanel />
        </div>
      </div>
    </section>
  );
}

/* ---- Panel 0 — 卷首 title card: SELECTED / WORKS ---- */

function TitlePanel() {
  return (
    <div className="relative flex h-dvh w-screen flex-shrink-0 items-center justify-center text-center">
      <div className="relative">
        <div className="line-mask">
          <span className="block font-fraunces font-medium leading-[0.82] tracking-[-0.02em] text-white text-[clamp(52px,11vw,190px)]">
            SELECTED
          </span>
          <span className="block font-fraunces font-medium leading-[0.82] tracking-[-0.02em] text-grad text-[clamp(64px,13.5vw,230px)]">
            WORKS
          </span>
        </div>
        <p className="mt-[clamp(28px,5vh,56px)] text-[11px] tracking-[0.42em] text-white/40">
          PORTFOLIO — {works.masthead.year}
        </p>
      </div>
    </div>
  );
}

/* ---- 章节页: full-screen divider between the two parts of the scroll ----
   A deliberate beat, not a background label — nothing scrolls over it, so
   the giant numeral never fights the reading text (unlike the old sticky
   version). Readable section name + numeral. */

function ChapterPanel({
  num,
  label,
  accent,
  warm,
  notice,
}: {
  num: string;
  label: string;
  accent: string;
  warm?: boolean;
  notice?: string;
}) {
  return (
    <div className="relative flex h-dvh w-screen flex-shrink-0 items-center justify-center text-center">
      <div className="relative">
        <p
          className={`font-fraunces font-light tracking-[0.26em] text-[clamp(16px,2.4vw,32px)] ${accent}`}
        >
          {label}
        </p>
        {/* Italic glyphs overhang their box; for gradient text the fill is
            clipped to the box, shaving the overhang. Padding extends the
            gradient, -mx keeps the layout centered. */}
        <p
          className={`mt-[clamp(16px,3vh,36px)] px-[0.12em] -mx-[0.12em] font-fraunces font-light italic leading-[0.85] tracking-[-0.02em] text-[clamp(140px,30vw,480px)] ${
            warm ? "text-grad-warm" : "text-stroke"
          }`}
        >
          {num}
        </p>
        {notice && (
          <p className="mx-auto mt-[clamp(20px,3.5vh,40px)] max-w-[56ch] text-[11px] leading-[1.8] tracking-[0.16em] text-white/35">
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---- work image: plain rounded-corner shot (web-optimized WebP) ---- */

function Mount({
  src,
  alt,
  ratio,
  fallback,
  natural,
}: {
  src?: string;
  alt: string;
  ratio: string;
  fallback: string;
  /* natural: keep the photo's own framing — scale to fit, never crop */
  natural?: boolean;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={
          natural
            ? "max-h-[78vh] max-w-[min(42vw,620px)] h-auto w-auto rounded-[clamp(14px,1.6vw,24px)] object-contain shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
            : `${ratio} w-full rounded-[clamp(14px,1.6vw,24px)] object-cover shadow-[0_24px_60px_rgba(0,0,0,0.45)]`
        }
      />
    );
  }
  return (
    <div
      className={`${ratio} flex w-full flex-col items-center justify-center gap-3 rounded-[clamp(14px,1.6vw,24px)] bg-[#161618] text-[#6f6f6f]`}
    >
      <span className="text-[clamp(15px,1.7vw,20px)] tracking-[0.3em]">
        {fallback}
      </span>
      <span className="text-[9px] tracking-[0.34em] opacity-70">
        IMAGE PENDING
      </span>
    </div>
  );
}

/* ---- Project panels: mounted screenshot + giant name ---- */

function ProjectPanel({
  project,
  index,
}: {
  project: (typeof works.projects)[number];
  index: number;
}) {
  return (
    <div className="relative flex h-dvh w-screen flex-shrink-0 items-center px-[clamp(24px,6vw,100px)]">
      <span
        aria-hidden
        className="text-stroke-faint absolute right-[clamp(20px,4vw,72px)] top-[6vh] font-fraunces italic leading-none text-[clamp(56px,9vw,150px)]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <figure className="relative w-[min(52vw,720px)] shrink-0">
        <Mount
          src={project.image}
          alt={project.name}
          ratio="aspect-[4/3]"
          fallback="SCREENSHOT"
        />
      </figure>
      <div className="ml-[clamp(32px,5vw,96px)] max-w-[min(36vw,540px)]">
        <p className="text-[11px] tracking-[0.36em] text-[#10aec2]/70">
          GITHUB PROJECT
        </p>
        <h4 className="mt-[clamp(16px,2.5vh,28px)] font-fraunces font-medium leading-[0.9] tracking-[-0.01em] text-white text-[clamp(30px,5.6vw,88px)]">
          {project.name}
        </h4>
        <p className="mt-[clamp(20px,3.5vh,40px)] max-w-[44ch] text-[13px] leading-[1.7] text-[#8e8e8e]">
          {project.description}
        </p>
        <p className="mt-[clamp(16px,2.5vh,28px)] text-[11px] tracking-[0.28em] text-[#10aec2]/70">
          {project.tags.join("  ·  ")}
        </p>
      </div>
    </div>
  );
}

/* ---- Photo panels: portrait mount, warm accents ---- */

function PhotoPanel({
  photo,
  index,
}: {
  photo: (typeof works.photos)[number];
  index: number;
}) {
  return (
    <div className="relative flex h-dvh w-screen flex-shrink-0 items-center px-[clamp(24px,6vw,100px)]">
      <span
        aria-hidden
        className="text-stroke-faint absolute right-[clamp(20px,4vw,72px)] top-[6vh] font-fraunces italic leading-none text-[clamp(56px,9vw,150px)]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <figure className="relative flex shrink-0 items-center justify-center">
        <Mount
          src={photo.image}
          alt={photo.title}
          ratio="aspect-[3/4]"
          fallback="PHOTO"
          natural
        />
      </figure>
      <div className="ml-[clamp(32px,5vw,96px)] max-w-[min(36vw,540px)]">
        <p className="text-[11px] tracking-[0.36em] text-[#f9a633]/70">
          PHOTOGRAPHY
        </p>
        <h4 className="mt-[clamp(16px,2.5vh,28px)] font-fraunces font-light italic leading-[0.95] tracking-[-0.01em] text-white text-[clamp(30px,5.6vw,88px)]">
          {photo.title}
        </h4>
        <p className="mt-[clamp(20px,3.5vh,40px)] max-w-[44ch] text-[13px] leading-[1.7] text-[#8e8e8e]">
          {photo.description}
        </p>
        <p className="mt-[clamp(16px,2.5vh,28px)] text-[11px] tracking-[0.28em] text-[#f9a633]/70">
          {photo.params}
        </p>
        <p className="mt-[clamp(12px,2vh,20px)] text-[11px] tracking-[0.3em] text-[#f9a633]/70">
          {photo.meta}
        </p>
      </div>
    </div>
  );
}

/* ---- 卷尾 colophon: ghost title + END ---- */

function EndPanel() {
  return (
    <div className="relative flex h-dvh w-screen flex-shrink-0 items-center justify-center text-center">
      <div className="relative">
        <span
          aria-hidden
          className="text-stroke-faint block font-fraunces font-medium leading-[0.82] tracking-[-0.02em] text-[clamp(60px,12vw,200px)]"
        >
          SELECTED
        </span>
        <span
          aria-hidden
          className="text-stroke-faint block font-fraunces font-medium leading-[0.82] tracking-[-0.02em] text-[clamp(60px,12vw,200px)]"
        >
          WORKS
        </span>
        <span className="mt-[clamp(32px,6vh,64px)] inline-block text-[11px] tracking-[0.5em] text-white/40">
          END
        </span>
      </div>
    </div>
  );
}
