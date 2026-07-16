import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import HeroBackground from './HeroBackground';
import { useTransition } from '../../contexts/TransitionContext';

const HeroScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rippleContainerRef = useRef<HTMLDivElement>(null);
  const { containerOffset } = useTransition();

  // ── GSAP entrance ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.from(subtitleRef.current, {
        opacity: 0,
        y: 25,
        duration: 0.8,
        ease: 'power3.out',
      })
        .from(
          '.hero-line',
          {
            opacity: 0,
            y: '120%',
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
            y: 25,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.5'
        )
        .from(
          '.hero-tag',
          {
            opacity: 0,
            y: 15,
            scale: 0.85,
            duration: 0.6,
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

  // ── Parallax on scroll (responds to screen transition) ──
  useEffect(() => {
    if (!containerRef.current) return;
    const offset = containerOffset + 0; // hero is screen 0
    const factor = 0.08;
    containerRef.current.style.setProperty('--parallax-y', `${offset * factor * 100}px`);
  }, [containerOffset]);

  // ── Magnetic tag effect ──
  const handleTagMouseMove = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
      const tag = tagRefs.current[index];
      if (!tag) return;
      const rect = tag.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const dist = Math.sqrt(x * x + y * y);
      const maxDist = 60;
      const strength = Math.max(0, 1 - dist / maxDist);
      gsap.to(tag, {
        x: x * strength * 0.3,
        y: y * strength * 0.3,
        scale: 1 + strength * 0.04,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    []
  );

  const handleTagMouseLeave = useCallback(
    (_e: React.MouseEvent<HTMLSpanElement>, index: number) => {
      const tag = tagRefs.current[index];
      if (!tag) return;
      gsap.to(tag, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto',
      });
    },
    []
  );

  // ── Ripple effect ──
  const createRipple = useCallback((e: React.MouseEvent) => {
    const container = rippleContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 0.6;

    const ripple = document.createElement('div');
    ripple.className = 'pointer-events-none absolute rounded-full';
    ripple.style.cssText = `
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, rgba(45,106,79,0.08) 0%, transparent 70%);
      transform: scale(0);
    `;
    container.appendChild(ripple);

    gsap.to(ripple, {
      scale: 2,
      opacity: 0,
      duration: 1.2,
      ease: 'power2.out',
      onComplete: () => ripple.remove(),
    });
  }, []);

  // ── Auto-rotation for scroll indicator ──
  useEffect(() => {
    const el = scrollRef.current?.querySelector('.scroll-indicator-arrow');
    if (!el) return;
    const tl = gsap.to(el, {
      y: 4,
      duration: 1.2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });
    return () => tl.kill();
  }, []);

  return (
    <section
      ref={containerRef}
      onClick={createRipple}
      className="w-full h-full flex flex-col justify-center px-5 sm:px-8 md:px-16 relative overflow-hidden cursor-default"
      style={{ '--parallax-y': '0px' } as React.CSSProperties}
    >
      {/* Ripple container */}
      <div ref={rippleContainerRef} className="absolute inset-0 z-20 pointer-events-none overflow-hidden" />

      {/* Interactive canvas background */}
      <HeroBackground />

      <div
        className="max-w-[1080px] mx-auto w-full relative z-10"
        style={{ transform: 'translateY(var(--parallax-y))' }}
      >
        {/* Subtitle */}
        <motion.div
          ref={subtitleRef}
          className="font-mono text-[0.65rem] md:text-[0.72rem] tracking-[0.15em] md:tracking-[0.3em] uppercase text-warm-400 mb-6 md:mb-8"
          whileHover={{ letterSpacing: '0.15em' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          Creative Developer & Digital Craftsman
        </motion.div>

        {/* Name */}
        <h1
          ref={titleRef}
          className="font-display font-normal text-[clamp(2.5rem,10vw,9rem)] leading-[0.95] tracking-[-0.04em] text-ink dark:text-warm-50 mb-6 sm:mb-8 md:mb-12 overflow-hidden"
        >
          <span className="hero-line block">Ever</span>
          <span className="hero-line block">verdants</span>
        </h1>

        {/* Description */}
        <motion.p
          ref={descRef}
          className="hero-desc text-[0.95rem] sm:text-[1.05rem] md:text-[1.15rem] leading-7 sm:leading-8 text-ink/60 dark:text-warm-50/60 max-w-[520px] mb-6 sm:mb-8 md:mb-12 transition-all duration-700"
          whileHover={{ color: 'rgba(45,106,79,0.8)', x: 4 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          什么语言都能写，跟着感觉造东西。
          <br />
          <span className="inline-block">Vibe Coder</span>，<span className="inline-block">代码即表达。</span>
        </motion.p>

        {/* Tags — magnetic */}
        <div ref={tagsRef} className="flex flex-wrap gap-2">
          {['Full-Stack', 'UI / UX', 'Creative Coding', 'Motion Design', 'Digital Art'].map(
            (tag, i) => (
              <motion.span
                key={tag}
                ref={(el) => { tagRefs.current[i] = el; }}
                className="hero-tag group/tag relative font-mono text-[0.65rem] tracking-[0.12em] uppercase px-3.5 py-2 md:py-1.5 border border-warm-300 dark:border-warm-400/30 text-warm-400 dark:text-warm-400/70 hover:border-amber-500/40 dark:hover:border-amber-400/40 hover:text-ink dark:hover:text-warm-50 hover:shadow-[0_0_16px_-3px_rgba(217,161,48,0.2)] transition-colors duration-400 cursor-default select-none"
                style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                onMouseMove={(e) => handleTagMouseMove(e, i)}
                onMouseLeave={(e) => handleTagMouseLeave(e, i)}
                whileTap={{ scale: 0.92 }}
              >
                <span className="relative z-10">{tag}</span>
                <span className="hero-tag-shine absolute inset-0 opacity-0 group-hover/tag:opacity-100 transition-opacity duration-500 pointer-events-none rounded" />
              </motion.span>
            )
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-4 left-5 sm:bottom-6 sm:left-8 md:bottom-12 md:left-16 flex flex-col items-start gap-2 sm:gap-2.5 text-warm-400 font-mono text-[0.55rem] sm:text-[0.6rem] tracking-[0.2em] sm:tracking-[0.3em] uppercase"
      >
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5], y: [0, 2, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          Scroll
        </motion.span>
        <div className="w-px h-12 bg-warm-300 dark:bg-warm-400/30 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-ink dark:bg-warm-50"
            style={{
              animation: 'scrollPulse 2s ease-in-out infinite',
            }}
          />
        </div>
        <motion.div
          className="scroll-indicator-arrow text-[0.65rem] mt-0.5"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          ↓
        </motion.div>
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
