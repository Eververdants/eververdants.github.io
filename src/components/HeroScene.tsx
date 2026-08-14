export default function HeroScene() {
  return (
    <section className="hero-scene relative flex h-dvh items-center justify-center p-[clamp(16px,2.4vh,28px)_clamp(14px,3vw,32px)] text-center">
      <div className="hero-content flex flex-col items-center">
        <img
          className="h-[clamp(120px,22vw,168px)] w-[clamp(120px,22vw,168px)] animate-hero-in object-cover motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:[filter:none] [filter:drop-shadow(0_14px_44px_rgba(0,0,0,0.55))]"
          src="/assets/avatar.webp"
          alt="Eververdants"
          width="1024"
          height="1024"
        />
        <h1 className="mt-[clamp(20px,3vh,32px)] whitespace-nowrap font-fraunces text-[clamp(36px,6vw,68px)] font-medium leading-[1.08] tracking-[-0.01em] text-white animate-hero-in [animation-delay:0.12s] motion-reduce:animate-none motion-reduce:opacity-100">
          Eververdants
        </h1>
        <p className="mt-[clamp(12px,2vh,20px)] max-w-[min(520px,90%)] font-normal leading-[1.6] text-[#8e8e8e] text-[clamp(14px,1.7vw,17px)] animate-hero-in [animation-delay:0.24s] motion-reduce:animate-none motion-reduce:opacity-100">
          I would rather leave something behind than simply pass through.
        </p>
      </div>
      <div className="scroll-hint z-[60]" aria-hidden="true">
        <span className="scroll-hint-label">SCROLL</span>
        <span className="scroll-hint-track">
          <span className="scroll-hint-fill" />
        </span>
      </div>
    </section>
  );
}
