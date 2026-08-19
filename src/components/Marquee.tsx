import { Fragment } from "react";

/* One marquee band: two identical groups inside a track, animated -50% so
   the loop is seamless. -mx cancels the parent section's side padding for a
   full-bleed band. Shared by ResumeScene (FOCUS) and BlogScene (JOURNAL).
   Direction/speed come from data attributes read by gsap.ts. */
export default function Marquee({
  words,
  className,
  dataMarquee,
  dataMarqueeReverse,
}: {
  words: string[];
  className?: string;
  dataMarquee?: string;
  dataMarqueeReverse?: boolean;
}) {
  const group = (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="whitespace-nowrap px-[0.5em] font-fraunces leading-none">
            {word}
          </span>
          <span
            aria-hidden
            className="text-[0.5em] leading-none text-[#10aec2]"
          >
            ●
          </span>
        </Fragment>
      ))}
    </>
  );

  // 20px side inset (not full-bleed): the tilt rotate + skew scrub grow
  // the band's bounding box, and a full-bleed band would overflow the
  // viewport. The mask gradient already fades the edges, so the inset is
  // invisible.
  return (
    <div
      className={`marquee-mask -mx-[calc(clamp(16px,4vw,48px)-20px)] overflow-hidden ${
        dataMarquee === "slow" ? "rotate-[1.2deg]" : "rotate-[-1.6deg]"
      }`}
      data-marquee-parallax
    >
      <div
        className={`marquee-track ${className ?? ""}`}
        data-marquee={dataMarquee}
        data-marquee-reverse={dataMarqueeReverse ? "" : undefined}
      >
        <div className="flex items-center whitespace-nowrap">{group}</div>
        <div aria-hidden className="flex items-center whitespace-nowrap">
          {group}
        </div>
      </div>
    </div>
  );
}
