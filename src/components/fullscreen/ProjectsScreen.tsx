import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { useProjects, ProjectCardData } from '../../hooks/use-projects';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  isActive: boolean;
}

const setCursor = (hover: boolean) => {
  (window as any).__setCursor?.(hover);
};

const ProjectsScreen: React.FC<Props> = ({ isActive }) => {
  const { t } = useLanguage();
  const projects = useProjects();
  const containerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const secRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);

  const hero: ProjectCardData | undefined = projects[0];
  const secondary: ProjectCardData[] = projects.slice(1, 5);

  // ── GSAP entrance when screen becomes active ──
  useEffect(() => {
    if (!isActive) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });

      // Meta line
      tl.from(metaRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.5,
        ease: 'power3.out',
      })
        // Hero card image
        .from('.ps-hero-card', {
          opacity: 0,
          y: 30,
          scale: 0.97,
          duration: 0.8,
          ease: 'power3.out',
        }, '-=0.2')
        // Hero image zoom in
        .from(heroImgRef.current, {
          scale: 1.15,
          duration: 1.2,
          ease: 'power3.out',
        }, '-=0.6')
        // Info card
        .from(infoRef.current, {
          opacity: 0,
          x: 30,
          duration: 0.7,
          ease: 'power3.out',
        }, '-=0.5')
        // Secondary cards stagger
        .from('.ps-sec-card', {
          opacity: 0,
          y: 25,
          scale: 0.95,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.08,
        }, '-=0.4')
        // Manifesto
        .from(manifestoRef.current, {
          opacity: 0,
          y: 15,
          duration: 0.5,
          ease: 'power3.out',
        }, '-=0.2');
    }, containerRef);

    return () => ctx.revert();
  }, [isActive]);

  // ── 3D tilt on hero card ──
  const handleHeroMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    card.style.transform = `perspective(1200px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) scale3d(1.01,1.01,1.01)`;

    // Parallax image shift
    const img = card.querySelector('.ps-hero-img') as HTMLElement;
    if (img) {
      img.style.transform = `scale(1.1) translate(${(x - 0.5) * -10}px, ${(y - 0.5) * -10}px)`;
    }
  }, []);

  const handleHeroLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    card.style.transform = '';
    const img = card.querySelector('.ps-hero-img') as HTMLElement;
    if (img) img.style.transform = '';
  }, []);

  // ── 3D tilt on secondary cards ──
  const handleSecMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    card.style.transform = `perspective(800px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 10}deg) scale3d(1.03,1.03,1.03)`;

    const img = card.querySelector('.ps-sec-img') as HTMLElement;
    if (img) {
      img.style.transform = `scale(1.15) translate(${(x - 0.5) * -8}px, ${(y - 0.5) * -8}px)`;
    }
  }, []);

  const handleSecLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    card.style.transform = '';
    const img = card.querySelector('.ps-sec-img') as HTMLElement;
    if (img) img.style.transform = '';
  }, []);

  if (!hero) return null;

  return (
    <section ref={containerRef} className="w-full h-full flex flex-col overflow-y-auto bg-white dark:bg-ink select-none">

      {/* ═══ 1. Top metadata ═══ */}
      <div ref={metaRef} className="flex-shrink-0 flex items-center justify-between px-5 sm:px-8 md:px-16 pt-4 sm:pt-5 md:pt-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div
            className="w-4 sm:w-6 h-px bg-warm-300/60 dark:bg-warm-400/30"
            animate={isActive ? { width: 24 } : { width: 16 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
          <span className="font-mono text-[0.5rem] sm:text-[0.6rem] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-warm-400">
            03 — Selected Works
          </span>
        </div>
        <a
          href="https://github.com/Eververdants"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setCursor(true)}
          onMouseLeave={() => setCursor(false)}
          className="group flex items-center gap-1.5 sm:gap-2 font-mono text-[0.5rem] sm:text-[0.6rem] tracking-[0.15em] sm:tracking-[0.25em] uppercase text-warm-400 hover:text-ink dark:hover:text-warm-50 transition-colors duration-400"
        >
          <span className="ps-underline-draw">View All {String(projects.length).padStart(2, '0')}</span>
          <span className="ps-arrow-icon">→</span>
        </a>
      </div>

      {/* ═══ 2. Hero card ═══ */}
      <div ref={heroRef} className="flex-1 min-h-0 grid grid-cols-12 gap-3 sm:gap-4 md:gap-10 px-5 sm:px-8 md:px-16 py-3 sm:py-4 md:py-8">
        {/* Hero image */}
        <a
          href={hero.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setCursor(true)}
          onMouseLeave={() => { setCursor(false); handleHeroLeave; }}
          onMouseMove={handleHeroMove}
          onMouseOut={handleHeroLeave}
          className="ps-hero-card group/hero col-span-12 md:col-span-8 relative flex flex-col min-h-0 card-hover"
          style={{ '--accent': hero.cover.accent } as React.CSSProperties}
        >
          <div className="relative flex-1 min-h-0 overflow-hidden bg-warm-100 dark:bg-ink/40">
            <img
              ref={heroImgRef}
              src={hero.imageUrl}
              alt={hero.title}
              className="ps-hero-img absolute inset-0 w-full h-full object-cover will-change-transform"
            />
            <div className="ps-hero-vignette absolute inset-0 pointer-events-none" />
            {/* Accent bar */}
            <div
              className="absolute left-0 bottom-0 w-1 sm:w-1.5 h-16 sm:h-20 md:h-32 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/hero:h-24 sm:group-hover/hero:h-32 md:group-hover/hero:h-40 hidden sm:block"
              style={{ backgroundColor: hero.cover.accent }}
            />
            {/* Number badge */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/85 dark:bg-ink/85 backdrop-blur-sm hidden sm:block">
              <span className="font-mono text-[0.5rem] sm:text-[0.6rem] tracking-[0.2em] uppercase text-ink dark:text-warm-50">
                {hero.number} / {String(projects.length).padStart(2, '0')}
              </span>
            </div>
            {/* View Project */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 hidden md:flex items-center gap-2 px-3 py-1.5 bg-ink/85 dark:bg-warm-50/90 text-warm-50 dark:text-ink opacity-0 translate-y-2 scale-95 group-hover/hero:opacity-100 group-hover/hero:translate-y-0 group-hover/hero:scale-100 transition-all duration-600"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase">View Project</span>
              <span className="ps-arrow-icon">→</span>
            </div>
          </div>
          {/* Title */}
          <div className="pt-2 sm:pt-3 md:pt-4 flex items-baseline gap-2 sm:gap-3 md:gap-4">
            <h3 className="font-display font-normal text-[clamp(1.2rem,3vw,2.6rem)] leading-[1.05] tracking-[-0.02em] text-ink dark:text-warm-50">
              {hero.title}
            </h3>
            <span
              className="hidden lg:inline-block font-mono text-[0.6rem] tracking-[0.25em] uppercase mt-2 opacity-60"
              style={{ color: hero.cover.accent }}
            >
              Featured
            </span>
          </div>
        </a>

        {/* Right info */}
        <div ref={infoRef} className="col-span-12 md:col-span-4 flex flex-col justify-center gap-1.5 sm:gap-2 md:gap-4">
          <motion.div
            className="hidden lg:block font-display font-normal text-[clamp(3rem,5vw,4.5rem)] leading-none tracking-tighter"
            style={{ color: 'rgba(45, 106, 79, 0.06)' }}
            animate={isActive ? { color: `rgba(from ${hero.cover.accent} r g b / 0.08)` } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {hero.number}
          </motion.div>
          {/* Category */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <motion.div
              className="w-4 sm:w-5 h-px"
              style={{ backgroundColor: hero.cover.accent }}
              animate={isActive ? { width: 24 } : { width: 16 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="font-mono text-[0.5rem] sm:text-[0.6rem] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-warm-400">
              {hero.category}
            </span>
          </div>
          {/* Description */}
          <p className="text-[0.8rem] sm:text-[0.85rem] md:text-[0.92rem] leading-[1.6] sm:leading-[1.7] text-ink/65 dark:text-warm-50/65 max-w-[320px]">
            {hero.description}
          </p>
          {/* Tags */}
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {hero.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="font-mono text-[0.5rem] sm:text-[0.6rem] tracking-[0.1em] sm:tracking-[0.12em] text-warm-400">
                #{tag}
              </span>
            ))}
          </div>
          {/* CTA */}
          <div className="hidden sm:flex items-center gap-2 mt-1">
            <a
              href={hero.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setCursor(true)}
              onMouseLeave={() => setCursor(false)}
              onClick={(e) => e.stopPropagation()}
              className="ps-btn-fill group/btn inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 bg-ink dark:bg-warm-50 text-warm-50 dark:text-ink font-mono text-[0.55rem] sm:text-[0.6rem] tracking-[0.2em] uppercase"
            >
              <span className="relative z-10">{t('sections.projects.demo')}</span>
              <span className="ps-arrow-icon relative z-10">↗</span>
            </a>
            {hero.repoUrl && (
              <a
                href={hero.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setCursor(true)}
                onMouseLeave={() => setCursor(false)}
                onClick={(e) => e.stopPropagation()}
                className="ps-btn-outline group/btn inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 border border-warm-300/70 dark:border-warm-400/30 text-ink dark:text-warm-50 font-mono text-[0.55rem] sm:text-[0.6rem] tracking-[0.2em] uppercase hover:border-forest-500 dark:hover:border-forest-400"
              >
                <span className="relative z-10">{t('sections.projects.source')}</span>
                <span className="ps-arrow-icon relative z-10">↗</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ═══ 3. Secondary cards ═══ */}
      <div ref={secRef} className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-5 px-5 sm:px-8 md:px-16 pb-2 sm:pb-3 md:pb-4">
        {secondary.map((p) => (
          <a
            key={p.id}
            href={p.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setCursor(true)}
            onMouseLeave={() => setCursor(false)}
            onMouseMove={handleSecMove}
            onMouseOut={handleSecLeave}
            className="ps-sec-card group/sec relative aspect-square overflow-hidden bg-warm-100 dark:bg-ink/40 card-hover"
          >
            <img src={p.imageUrl} alt={p.title} className="ps-sec-img absolute inset-0 w-full h-full object-cover will-change-transform" />
            <div className="ps-card-curtain" />
            <div className="ps-card-shimmer" />
            <div className="ps-card-border" />
            {/* Accent bar */}
            <div
              className="absolute top-0 left-0 w-4 sm:w-5 md:w-6 h-0.5 sm:h-1 z-10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/sec:w-8 sm:group-hover/sec:w-10 group-hover/sec:h-1 sm:group-hover/sec:h-1.5 hidden sm:block"
              style={{ backgroundColor: p.cover.accent }}
            />
            {/* Number */}
            <div className="absolute top-2 right-2 md:top-3 md:right-3 font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.2em] uppercase text-warm-50/90 opacity-0 translate-y-[-4px] group-hover/sec:opacity-100 group-hover/sec:translate-y-0 transition-all duration-500 z-10 hidden md:block"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
              {p.number}
            </div>
            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 z-10">
              <div
                className="font-mono text-[0.45rem] sm:text-[0.5rem] md:text-[0.55rem] tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-0.5 translate-y-1 sm:translate-y-2 opacity-0 group-hover/sec:translate-y-0 group-hover/sec:opacity-100 transition-all duration-500 delay-[100ms]"
                style={{ color: p.cover.accent, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                {p.category}
              </div>
              <div className="font-display text-warm-50 text-[0.8rem] sm:text-[0.9rem] md:text-base leading-tight translate-y-1 sm:translate-y-2 opacity-0 group-hover/sec:translate-y-0 group-hover/sec:opacity-100 transition-all duration-500 delay-[180ms]"
                style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                {p.title}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* ═══ 4. Manifesto ═══ */}
      <div ref={manifestoRef} className="hidden sm:flex flex-shrink-0 px-5 sm:px-8 md:px-16 pb-3 sm:pb-4 md:pb-6 items-center justify-center gap-3 sm:gap-4 md:gap-6 text-center">
        <div className="hidden md:block w-16 lg:w-24 h-px bg-gradient-to-r from-transparent via-warm-300/50 to-warm-300/50" />
        <motion.p
          className="font-display italic text-[clamp(0.7rem,1vw,0.95rem)] text-ink/60 dark:text-warm-50/60 max-w-[640px]"
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 5 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Craft over convention. Clarity over clutter. Every line of code a deliberate choice.
        </motion.p>
        <div className="hidden md:block w-16 lg:w-24 h-px bg-gradient-to-l from-transparent via-warm-300/50 to-warm-300/50" />
      </div>
    </section>
  );
};

export default ProjectsScreen;
