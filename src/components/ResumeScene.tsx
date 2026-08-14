import { resume } from "../data/resume";

/* Editorial big-type resume. Height is free — no viewport lock. Giant
   Fraunces labels as the spine, small body text beside, hairline dividers.
   Reveal is handled globally in global.css (rvIn, now with blur). */

export default function ResumeScene() {
  // Age derived from birth year at runtime so it never goes stale.
  const age = new Date().getFullYear() - resume.birthYear;

  const giantLabel =
    "font-fraunces text-[clamp(32px,5.5vw,88px)] font-medium leading-none tracking-[-0.01em] text-transparent bg-gradient-to-b from-white to-white/25 bg-clip-text";

  return (
    <section className="relative z-[1] px-[clamp(16px,4vw,48px)] py-[clamp(48px,9vh,130px)]">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* Cover headline: leads the sheet as it slides up over the hero */}
        <div className="text-left">
          <h2 className="font-fraunces text-[clamp(56px,15vw,220px)] font-medium leading-[0.9] tracking-[-0.01em] text-white">
            RESUME
          </h2>
          <p className="mt-[clamp(12px,2vh,20px)] font-fraunces text-[clamp(16px,1.8vw,22px)] text-white/70">
            Student. Builder. Creator.
          </p>
        </div>

        {/* Sections */}
        <div className="mt-[clamp(48px,9vh,120px)] border-t border-white/10">
          {/* Education */}
          <div className="grid gap-[clamp(16px,3vh,28px)] border-b border-white/10 py-[clamp(32px,6vh,64px)] md:grid-cols-[1fr_1.25fr] md:gap-x-16">
            <h3 className={giantLabel}>EDUCATION</h3>
            <div className="md:pt-[clamp(4px,0.8vh,10px)]">
              <p className="font-fraunces text-[clamp(16px,1.6vw,20px)] leading-snug text-white">
                {resume.education.role} — {resume.education.school}
              </p>
              <p className="mt-2 text-[13px] leading-[1.8] text-[#8e8e8e]">
                {resume.education.location} · Age {age} (b. {resume.birthYear})
              </p>
            </div>
          </div>

          {/* Awards */}
          <div className="grid gap-[clamp(16px,3vh,28px)] border-b border-white/10 py-[clamp(32px,6vh,64px)] md:grid-cols-[1fr_1.25fr] md:gap-x-16">
            <h3 className={giantLabel}>AWARDS</h3>
            <div className="md:pt-[clamp(4px,0.8vh,10px)]">
              <p className="font-fraunces text-[clamp(16px,1.6vw,20px)] leading-snug text-white">
                {resume.awards[0].contest}
              </p>
              <p className="mt-1.5 text-[13px] leading-[1.7] text-[#8e8e8e]">
                {resume.awards[0].event}
              </p>
              <ul className="mt-3 space-y-1.5">
                {resume.awards[0].results.map((result) => (
                  <li
                    key={result}
                    className="flex items-center gap-2 text-[13px] leading-snug text-[#c9c9c9]"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#f9a633]" />
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Focus */}
          <div className="grid gap-[clamp(16px,3vh,28px)] py-[clamp(32px,6vh,64px)] md:grid-cols-[1fr_1.25fr] md:gap-x-16">
            <h3 className={giantLabel}>FOCUS</h3>
            <div className="md:pt-[clamp(4px,0.8vh,10px)]">
              <ul className="flex flex-wrap gap-2">
                {resume.focus.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-white/15 px-3.5 py-1.5 text-[13px] text-[#c9c9c9] transition-colors hover:border-[#10aec2]/60 hover:text-white"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-[clamp(40px,7vh,80px)] flex items-center gap-3 border-t border-white/10 pt-[clamp(24px,4vh,40px)] text-[14px]">
          <span className="text-[#8e8e8e]">{resume.contact.label}</span>
          <a
            href={resume.contact.href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-white underline decoration-[#10aec2] underline-offset-4 transition-colors hover:text-[#10aec2]"
          >
            {resume.contact.handle}
          </a>
        </div>
      </div>
    </section>
  );
}
