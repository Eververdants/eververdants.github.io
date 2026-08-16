import { resume } from "../data/resume";
import Marquee from "./Marquee";

/* Scroll-cinema resume. Height is free — each act is a tall chapter with
   sticky giant type that the body scrolls up over. All motion is pure CSS
   scroll-timeline (view()) + position:sticky; no JS frame loop. Reduced
   motion opts out in global.css. Copy lives in data/resume.ts. */

/* Shared giant chapter-label styling. Weight added per use (AWARDS uses
   font-light italic instead of medium). */
const giant = "text-stroke font-fraunces leading-[0.85] tracking-[-0.02em]";

export default function ResumeScene() {
  // Age derived from birth year at runtime so it never goes stale.
  const age = new Date().getFullYear() - resume.birthYear;

  // NOTE: no overflow-x: clip anywhere in this subtree. In Chrome, an
  // overflow-x: clip ancestor becomes the scroll container for view()
  // timelines, freezing every reveal inside it. Horizontal bleed (giant
  // numerals, marquees) is clipped by <html class="overflow-x-hidden">.
  return (
    <section className="relative z-[1] px-[clamp(16px,4vw,48px)]" data-resume>
      <Masthead />
      <Education age={age} />
      <Awards />
      <FocusMarquee />
      <Contact />
    </section>
  );
}

/* ---- Act 0 — masthead: giant RESUME, unveils as the hero fades ---- */

function Masthead() {
  return (
    <div className="relative flex h-[120vh] items-center justify-center text-center" data-masthead>
      <span
        aria-hidden
        className="text-stroke-faint absolute left-1/2 top-[6%] -translate-x-1/2 font-fraunces italic leading-none text-[clamp(120px,26vw,360px)]"
        data-parallax
      >
        {resume.birthYear}
      </span>
      <div className="relative z-[1]">
        {/* Letters stagger in as the masthead rises, then fly apart as it
            leaves (gsap.ts animates [data-mast-letter] on a scrub timeline). */}
        <h2 className="no-rv whitespace-nowrap font-fraunces font-medium leading-[0.82] tracking-[-0.02em] text-white text-[clamp(72px,18vw,300px)]">
          {"RESUME".split("").map((ch, i) => (
            <span key={i} className="inline-block" data-mast-letter>
              {ch}
            </span>
          ))}
        </h2>
        <p className="mt-[clamp(16px,3vh,30px)] font-fraunces text-[clamp(15px,1.8vw,24px)] tracking-[0.08em] text-white/55">
          EST. {resume.birthYear} — Student. Builder. Creator.
        </p>
      </div>
    </div>
  );
}

/* ---- Act 1 — EDUCATION: sticky stroke label, school scrolls over it ---- */

function Education({ age }: { age: number }) {
  return (
    <div className="relative pt-[clamp(120px,20vh,240px)]" data-act>
      {/* Sticky heading is static (no-rv): a view() reveal on a sticky
         element freezes at whatever progress it was at when pinned —
         leaving it invisible or half-translated. The scroll-over effect
         is the drama; the label needs no entrance animation. */}
      <div className="sticky top-[10vh] z-[1]">
        <h3
          className={`${giant} no-rv font-medium text-[clamp(60px,15vw,250px)]`}
          data-wipe
        >
          EDUCATION
        </h3>
      </div>

      <div className="relative z-[2] mt-[clamp(80px,16vh,200px)] pb-[clamp(160px,26vh,320px)]">
        <div className="relative">
          <span
            aria-hidden
            className="text-stroke-accent absolute right-0 top-[-24%] font-fraunces italic leading-none text-[clamp(150px,30vw,440px)]"
            data-parallax
          >
            {age}
          </span>
          {/* \n in the data splits into designed lines; each slides up in
              sequence (gsap.ts staggers siblings in a .line-mask). */}
          <div className="line-mask relative z-[1]">
            {resume.education.school.split("\n").map((line) => (
              <span
                key={line}
                className="block font-fraunces font-medium leading-[1.06] tracking-[-0.01em] text-white text-[clamp(38px,7.5vw,104px)]"
              >
                {line}
              </span>
            ))}
          </div>
          <p className="relative z-[1] mt-[clamp(36px,7vh,72px)] max-w-[520px] text-[clamp(14px,1.5vw,17px)] leading-[1.7] text-[#8e8e8e]">
            {resume.education.role} · {resume.education.location}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---- Act 2 — AWARDS: ceremony title card + giant ranking list ----
   The sticky italic 01 is the background curtain the content scrolls over.
   Two acts: the contest name as a giant title card, then each prize as a
   full-width trophy row led by a ghost number — an award-ceremony moment,
   airy rather than list-y. */

function Awards() {
  const award = resume.awards[0];
  return (
    <div className="relative pt-[clamp(120px,20vh,240px)]" data-act>
      <div className="sticky top-[10vh] z-[1]">
        <h3 className="sr-only">Awards</h3>
        <p
          className={`${giant} no-rv font-light italic text-[clamp(90px,20vw,320px)]`}
          data-wipe
        >
          01
        </p>
        <p className="no-rv mt-1 text-[11px] tracking-[0.42em] text-white/30">
          AWARDS
        </p>
      </div>

      <div className="relative z-[2] mt-[clamp(80px,16vh,200px)] pb-[clamp(180px,28vh,380px)]">
        {/* act 1 — title card: contest name, three giant lines (2/2/2).
            Min is 28px not 38px so "Communication Technology" holds its
            line down to ~390px; below that the long lines wrap into a
            dense wall, which is exactly the stuffiness this redesign
            removes. Optical sizing keeps desktop narrow and clean. */}
        <div className="line-mask">
          {award.contest.split("\n").map((line) => (
            <span
              key={line}
              className="block font-fraunces font-medium leading-[1.06] tracking-[-0.01em] text-white text-[clamp(25px,6.9vw,104px)]"
            >
              {line}
            </span>
          ))}
        </div>

        {/* ceremony subtitle */}
        <p className="mt-[clamp(36px,7vh,72px)] max-w-[52ch] text-[13px] leading-[1.7] text-[#6f6f6f]">
          {award.event}
        </p>

        {/* act 2 — giant ranking list. .no-rv keeps rows out of the
            universal reveal: the GSAP curtain wipe owns their entrance. */}
        <ul className="mt-[clamp(96px,18vh,240px)]">
          {award.results.map((result, i) => (
            <li
              key={result.tier}
              className="no-rv border-t border-white/10 py-[clamp(48px,9vh,88px)]"
              data-row-wipe
            >
              <div className="flex items-baseline gap-[clamp(20px,3vw,44px)]">
                <span
                  aria-hidden
                  className="font-fraunces italic leading-none text-white/20 text-[clamp(40px,6vw,96px)]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-fraunces font-medium leading-[0.95] tracking-[-0.01em] text-white text-[clamp(32px,6.5vw,96px)]">
                  {result.tier}
                </span>
              </div>
              {/* scope aligns under the tier, past the ghost number */}
              <p className="no-rv mt-[clamp(12px,2vh,20px)] pl-[calc(clamp(40px,6vw,96px)+clamp(20px,3vw,44px))] text-[13px] leading-[1.6] text-[#6f6f6f]">
                {result.scope}
              </p>
            </li>
          ))}
          <li className="border-t border-white/10" aria-hidden />
        </ul>
      </div>
    </div>
  );
}

/* ---- Act 3 — FOCUS: two counter-rotating marquee bands of giant type ---- */

function FocusMarquee() {
  const words = resume.focus.map((w) => w.toUpperCase());
  return (
    <div className="relative py-[clamp(80px,14vh,180px)]">
      <h3 className="sr-only">Focus</h3>
      <div className="flex flex-col gap-[clamp(20px,4vh,48px)]">
        <Marquee
          words={words}
          className="text-stroke-faint text-[clamp(60px,12vw,200px)]"
          dataMarquee="fast"
        />
        <Marquee
          words={words}
          className="text-grad-warm text-[clamp(60px,12vw,200px)]"
          dataMarquee="slow"
          dataMarqueeReverse
        />
      </div>
    </div>
  );
}

/* ---- Act 4 — CONTACT: giant gradient handle as the close ---- */

function Contact() {
  return (
    <div className="relative flex min-h-[100vh] flex-col items-center justify-center pb-[clamp(120px,20vh,240px)] pt-[clamp(60px,10vh,120px)] text-center">
      <p className="text-[11px] tracking-[0.45em] text-white/30">CONTACT</p>
      <p className="mt-[clamp(24px,5vh,56px)] max-w-[660px] font-fraunces text-[clamp(20px,3vw,40px)] leading-[1.3] text-white/75">
        {resume.about}
      </p>
      <a
        href={resume.contact.href}
        target="_blank"
        rel="noreferrer"
        className="text-grad mt-[clamp(40px,8vh,96px)] font-fraunces font-medium leading-none tracking-[-0.02em] transition-opacity hover:opacity-75 text-[clamp(44px,9vw,132px)]"
      >
        @{resume.contact.handle}
      </a>
      <p className="mt-[clamp(22px,4vh,44px)] text-[13px] text-[#8e8e8e]">
        {resume.contact.label} <span aria-hidden>↗</span>
      </p>
    </div>
  );
}
