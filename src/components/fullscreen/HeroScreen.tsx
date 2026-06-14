import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import HeroBackground from './HeroBackground';

const HeroScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
      })
        .from(
          '.hero-line',
          {
            opacity: 0,
            y: '100%',
            duration: 1,
            ease: 'power3.out',
            stagger: 0.15,
          },
          '-=0.4'
        )
        .from(
          descRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.5'
        )
        .from(
          '.hero-tag',
          {
            opacity: 0,
            y: 12,
            duration: 0.5,
            ease: 'power3.out',
            stagger: 0.08,
          },
          '-=0.3'
        )
        .from(
          scrollRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.3'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="w-full h-full flex flex-col justify-center px-5 sm:px-8 md:px-16 relative overflow-hidden"
    >
      {/* Interactive canvas background */}
      <HeroBackground />

      <div className="max-w-[1080px] mx-auto w-full relative z-10">
        {/* Subtitle */}
        <div
          ref={subtitleRef}
          className="font-mono text-[0.65rem] md:text-[0.72rem] tracking-[0.15em] md:tracking-[0.3em] uppercase text-warm-400 mb-6 md:mb-8"
        >
          Creative Developer & Digital Craftsman
        </div>

        {/* Name */}
        <h1
          ref={titleRef}
          className="font-display font-normal text-[clamp(2.5rem,10vw,9rem)] leading-[0.95] tracking-[-0.04em] text-ink dark:text-warm-50 mb-6 sm:mb-8 md:mb-12 overflow-hidden"
        >
          <span className="hero-line block">Ever</span>
          <span className="hero-line block">verdants</span>
        </h1>

        {/* Description */}
        <p
          ref={descRef}
          className="hero-desc text-[0.95rem] sm:text-[1.05rem] md:text-[1.15rem] leading-7 sm:leading-8 text-ink/60 dark:text-warm-50/60 max-w-[520px] mb-6 sm:mb-8 md:mb-12 transition-colors duration-700 hover:text-ink/75 dark:hover:text-warm-50/75"
        >
          什么语言都能写，跟着感觉造东西。
          <br />
          Vibe Coder，代码即表达。
        </p>

        {/* Tags */}
        <div ref={tagsRef} className="flex flex-wrap gap-2">
          {['Full-Stack', 'UI / UX', 'Creative Coding', 'Motion Design', 'Digital Art'].map(
            (tag) => (
              <span
                key={tag}
                className="hero-tag group/tag relative font-mono text-[0.65rem] tracking-[0.12em] uppercase px-3.5 py-2 md:py-1.5 border border-warm-300 dark:border-warm-400/30 text-warm-400 dark:text-warm-400/70 hover:border-amber-500/40 dark:hover:border-amber-400/40 hover:text-ink dark:hover:text-warm-50 hover:shadow-[0_0_12px_-3px_rgba(217,161,48,0.15)] transition-all duration-400 cursor-default select-none"
                style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <span className="relative z-10">{tag}</span>
                <span className="hero-tag-shine absolute inset-0 opacity-0 group-hover/tag:opacity-100 transition-opacity duration-500 pointer-events-none rounded" />
              </span>
            )
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-4 left-5 sm:bottom-6 sm:left-8 md:bottom-12 md:left-16 flex flex-col items-start gap-2 sm:gap-2.5 text-warm-400 font-mono text-[0.55rem] sm:text-[0.6rem] tracking-[0.2em] sm:tracking-[0.3em] uppercase"
      >
        <span>Scroll</span>
        <div className="w-px h-12 bg-warm-300 dark:bg-warm-400/30 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-ink dark:bg-warm-50"
            style={{
              animation: 'scrollPulse 2s ease-in-out infinite',
            }}
          />
        </div>
        <div className="absolute top-6 -left-1 w-3 h-3 rounded-full bg-amber-400/0 group-hover:bg-amber-400/5 transition-colors duration-700" />
      </div>

      <style>{`
        @keyframes scrollPulse {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        @keyframes heroTagShine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Tag hover shine */
        .hero-tag-shine {
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(217,161,48,0.04) 45%,
            rgba(217,161,48,0.08) 50%,
            rgba(217,161,48,0.04) 55%,
            transparent 60%
          );
          background-size: 250% 100%;
          animation: heroTagShine 2s ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default HeroScreen;
