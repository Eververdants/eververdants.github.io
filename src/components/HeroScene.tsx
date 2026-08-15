export default function HeroScene() {
  return (
    <section
      className="sticky top-0 z-0 flex h-dvh items-center justify-center p-[clamp(16px,2.4vh,28px)_clamp(14px,3vw,32px)] text-center"
      data-hero-scroll
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-0 bg-gradient-to-b from-[#08080a]/60 via-[#08080a]/30 to-[#08080a]/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        style={{
          // Inline: Lightning CSS dedups -webkit-backdrop-filter to one alias,
          // and Chrome needs the standard property for the blur to render.
          backdropFilter: "blur(26px) saturate(1.25)",
          WebkitBackdropFilter: "blur(26px) saturate(1.25)"
        }}
        aria-hidden="true"
        data-hero-glass
      />
      <div className="hero-content flex flex-col items-center" data-hero-fade>
        <div
          className="motion-reduce:[filter:none] [filter:drop-shadow(0_14px_44px_rgba(0,0,0,0.55))]"
          data-hero-avatar
        >
          <img
            className="h-[clamp(120px,22vw,168px)] w-[clamp(120px,22vw,168px)] object-cover"
            src="/assets/avatar.webp"
            alt="Eververdants"
            width="1024"
            height="1024"
            data-hero-in
          />
        </div>
        <h1
          className="mt-[clamp(20px,3vh,32px)] whitespace-nowrap font-fraunces text-[clamp(36px,6vw,68px)] font-medium leading-[1.08] tracking-[-0.01em] text-white"
          data-hero-in
        >
          Eververdants
        </h1>
        <p
          className="mt-[clamp(12px,2vh,20px)] max-w-[min(520px,90%)] font-normal leading-[1.6] text-[#8e8e8e] text-[clamp(14px,1.7vw,17px)]"
          data-hero-in
        >
          I would rather leave something behind than simply pass through.
        </p>
      </div>
      {/* No entrance animation: the hero cover scrub owns the hint's opacity
          (fades it out on scroll). An entrance fill would fight gsap's inline
          styles — gsap captured that animated value as the tween start. */}
      <div
        className="scroll-hint absolute bottom-[clamp(22px,4.5vh,40px)] left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-3"
        aria-hidden="true"
        data-hero-hint
      >
        <span className="text-[10px] tracking-[0.42em] indent-[0.42em] text-white/40">
          SCROLL
        </span>
        <span className="relative h-[46px] w-px overflow-hidden bg-white/10">
          <span className="absolute left-0 top-0 h-0 w-full animate-scroll-fill bg-gradient-to-b from-[#10aec2] to-[#f9a633]" />
        </span>
      </div>
    </section>
  );
}
