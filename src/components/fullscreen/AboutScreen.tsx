import React, { useEffect, useRef, useCallback, useState } from 'react';

const INTERESTS = [
  { label: '摄影', icon: '◉' },
  { label: '书法', icon: '✎' },
  { label: '音乐', icon: '♪' },
  { label: '阅读', icon: '▣' },
  { label: '徒步', icon: '△' },
  { label: '咖啡', icon: '◎' },
];

const STATS = [
  { value: '5+', label: '年经验' },
  { value: '20+', label: '个项目' },
  { value: '1K+', label: '次提交' },
];

const setCursor = (hover: boolean) => {
  (window as any).__setCursor?.(hover);
};

const AboutScreen: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const nameCharsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const nameChars = 'Eververdants'.split('');

  return (
    <section ref={sectionRef} className="w-full h-full flex items-center justify-center px-5 sm:px-8 md:px-16 relative overflow-y-auto">

      {/* ===== DECORATIVE LAYER — md+ only ===== */}
      <div
        className="absolute inset-0 pointer-events-none z-0 animate-[noiseBreath_4s_ease-in-out_infinite] hidden md:block"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="parallax-layer absolute top-[15%] left-0 w-[35%] h-px bg-gradient-to-r from-transparent via-warm-300/40 to-transparent hidden lg:block" data-depth="0.5" />
      <div className="parallax-layer absolute bottom-[20%] right-0 w-[30%] h-px bg-gradient-to-l from-transparent via-warm-300/40 to-transparent hidden lg:block" data-depth="0.8" />
      <div className="parallax-layer absolute top-[60%] left-[5%] w-[15%] h-px bg-gradient-to-r from-warm-300/20 to-transparent hidden lg:block" data-depth="1.2" />
      <div className="parallax-layer absolute top-0 left-[20%] w-px h-[25%] bg-gradient-to-b from-transparent via-warm-300/30 to-transparent hidden lg:block" data-depth="0.6" />
      <div className="parallax-layer absolute bottom-0 right-[15%] w-px h-[20%] bg-gradient-to-t from-transparent via-warm-300/30 to-transparent hidden lg:block" data-depth="1.0" />
      <div className="parallax-layer absolute top-[12%] right-[22%] w-2 h-2 rounded-full bg-forest-500/20 animate-[float1_6s_ease-in-out_infinite] hidden lg:block" data-depth="1.5" />
      <div className="parallax-layer absolute bottom-[25%] left-[12%] w-3 h-3 rounded-full border border-warm-300/30 animate-[float2_8s_ease-in-out_infinite] hidden lg:block" data-depth="0.7" />
      <div className="parallax-layer absolute top-[45%] right-[8%] w-1.5 h-1.5 rounded-full bg-amber-500/20 animate-[float3_5s_ease-in-out_infinite] hidden lg:block" data-depth="1.3" />

      {/* Corner labels — sm+ only */}
      <div className="absolute top-5 left-5 sm:top-8 sm:left-8 font-mono text-[0.5rem] tracking-[0.3em] text-warm-400/40 uppercase hidden sm:block">02 — About</div>
      <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 font-mono text-[0.5rem] tracking-[0.3em] text-warm-400/40 uppercase hidden sm:block">37.7749° N</div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forest-500/20 to-transparent hidden sm:block" />

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-[1100px] mx-auto w-full grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-4 sm:gap-6 md:gap-20 items-center relative z-10">

        {/* LEFT — Avatar + Name */}
        <div className="flex flex-col items-center md:items-start mb-2 sm:mb-4 md:mb-0">
          {/* Avatar */}
          <div className="relative mb-2 sm:mb-3 md:mb-12">
            {/* Rings — sm+ only */}
            <div className="absolute -inset-3 sm:-inset-5 md:-inset-8 rounded-full border border-dashed border-warm-300/30 animate-[slowSpin_20s_linear_infinite] hidden sm:block" />
            <div className="absolute -top-1.5 left-1/2 w-1.5 h-1.5 rounded-full bg-forest-500/40 animate-[orbit1_4s_linear_infinite] hidden sm:block" />
            <div className="absolute top-1/2 -right-2 w-1 h-1 rounded-full bg-amber-500/40 animate-[orbit2_5s_linear_infinite] hidden sm:block" />
            <div className="absolute -bottom-1 left-1/4 w-1 h-1 rounded-full bg-warm-400/40 animate-[orbit3_6s_linear_infinite] hidden sm:block" />
            <div className="absolute -inset-1.5 sm:-inset-2 md:-inset-3 rounded-full border border-forest-500/20 transition-all duration-700 ease-out hidden sm:block" />
            {/* Avatar image */}
            <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-56 md:h-56 rounded-full overflow-hidden relative" style={{ backgroundColor: 'rgb(0, 255, 203)' }}>
              <img src="/image.png" alt="Avatar" className="w-[88%] h-[88%] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            {/* Status dot — sm+ only */}
            <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-forest-500/10 flex items-center justify-center hidden sm:flex">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: 'rgba(0, 255, 203, 0.6)' }} />
            </div>
          </div>

          {/* Name */}
          <h2 className="font-display font-normal text-[clamp(1.6rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.03em] text-ink dark:text-warm-50 text-center md:text-left mb-1 sm:mb-2 md:mb-3">
            {nameChars.map((char, i) => (
              <span key={i} ref={(el) => { nameCharsRef.current[i] = el; }} className="inline-block">
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </h2>

          {/* Role */}
          <p className="font-mono text-[0.65rem] sm:text-[0.72rem] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-warm-400 mb-1 sm:mb-2 md:mb-6 text-center md:text-left">
            Vibe Coder
          </p>

          {/* Description */}
          <p className="text-[0.8rem] sm:text-[0.85rem] md:text-[0.95rem] leading-[1.6] sm:leading-[1.7] md:leading-[1.9] text-ink/50 dark:text-warm-50/50 max-w-[300px] md:max-w-[340px] text-center md:text-left">
            什么语言都能写，<br className="hidden sm:inline" />用代码创造有意思的数字体验。
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col">
          <div className="w-full h-px bg-warm-300/30 dark:bg-warm-400/15 mb-3 sm:mb-4 md:mb-8" />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-6 mb-4 sm:mb-5 md:mb-10">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="font-display font-normal text-[clamp(1.2rem,3vw,2.2rem)] text-ink dark:text-warm-50 leading-none mb-0.5 sm:mb-1">
                  {stat.value}
                </div>
                <div className="font-mono text-[0.5rem] sm:text-[0.55rem] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-warm-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Info blocks — simplified on mobile */}
          <div className="space-y-3 sm:space-y-4 md:space-y-7">
            {/* Education */}
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-5 sm:w-6 h-px bg-forest-500/40" />
                <span className="font-mono text-[0.5rem] sm:text-[0.55rem] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-warm-400">Education</span>
              </div>
              <div className="pl-7 sm:pl-9">
                <div className="text-ink dark:text-warm-50 text-[0.9rem] sm:text-base font-display mb-0.5">昆山市亭林初级中学</div>
                <div className="text-ink/40 dark:text-warm-50/40 text-[0.75rem] sm:text-[0.8rem]">在读中学生 · Vibe Coder</div>
              </div>
            </div>

            {/* Currently */}
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-5 sm:w-6 h-px bg-amber-500/40" />
                <span className="font-mono text-[0.5rem] sm:text-[0.55rem] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-warm-400">Currently</span>
              </div>
              <div className="pl-7 sm:pl-9">
                <div className="text-ink dark:text-warm-50 text-[0.9rem] sm:text-base font-display mb-0.5">Vibe Coding</div>
                <div className="text-ink/40 dark:text-warm-50/40 text-[0.75rem] sm:text-[0.8rem]">跟着感觉写代码</div>
              </div>
            </div>

            {/* Focus */}
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-5 sm:w-6 h-px bg-warm-400/40" />
                <span className="font-mono text-[0.5rem] sm:text-[0.55rem] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-warm-400">Focus</span>
              </div>
              <div className="pl-7 sm:pl-9">
                <div className="text-ink dark:text-warm-50 text-[0.9rem] sm:text-base font-display mb-0.5">全栈 · 什么都能写</div>
                <div className="text-ink/40 dark:text-warm-50/40 text-[0.75rem] sm:text-[0.8rem]">JavaScript · Python · Rust · Go · ...</div>
              </div>
            </div>

            {/* Award */}
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-5 sm:w-6 h-px bg-gradient-to-r from-amber-500/50 to-amber-400/30" />
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-mono text-[0.5rem] sm:text-[0.55rem] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-warm-400">Awards</span>
                  <span className="inline-block px-1 sm:px-1.5 py-[1px] rounded text-[0.4rem] sm:text-[0.45rem] font-mono tracking-wider uppercase text-amber-500/60 dark:text-amber-400/50 border border-amber-500/15">初中组</span>
                </div>
              </div>
              <div className="pl-7 sm:pl-9">
                <div className="text-ink dark:text-warm-50 text-[0.9rem] sm:text-base font-display mb-0.5">振"芯"科技 · 通信智能技术创新赛</div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[0.75rem] sm:text-[0.8rem]">
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d="M12 15l-2 5l9-11h-5l2-5L7 18h5z" />
                    </svg>
                    江苏省一等奖
                  </span>
                  <span className="text-warm-300 dark:text-warm-400/30">·</span>
                  <span className="text-amber-600/70 dark:text-amber-400/60 font-medium">全国总决赛三等奖</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interests — sm+ only */}
          <div className="hidden sm:block">
            <div className="w-full h-px bg-warm-300/30 dark:bg-warm-400/15 my-3 sm:my-4 md:my-8" />
            <div className="font-mono text-[0.5rem] sm:text-[0.55rem] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-warm-400 mb-2 sm:mb-4">Interests</div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-2.5">
              {INTERESTS.map((interest) => (
                <div
                  key={interest.label}
                  className="flex items-center gap-1.5 sm:gap-2 font-mono text-[0.6rem] sm:text-[0.65rem] tracking-[0.08em] px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 border border-warm-300/60 dark:border-warm-400/25 text-warm-400 select-none"
                >
                  <span className="text-[0.65rem] sm:text-[0.75rem] opacity-40">{interest.icon}</span>
                  {interest.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes noiseBreath { 0%, 100% { opacity: 0.02; } 50% { opacity: 0.045; } }
        @keyframes float1 { 0%, 100% { transform: translateY(0) translateX(0); } 25% { transform: translateY(-8px) translateX(3px); } 50% { transform: translateY(-4px) translateX(-2px); } 75% { transform: translateY(-10px) translateX(1px); } }
        @keyframes float2 { 0%, 100% { transform: translateY(0) translateX(0); } 33% { transform: translateY(6px) translateX(-4px); } 66% { transform: translateY(-5px) translateX(3px); } }
        @keyframes float3 { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-7px) translateX(-3px); } }
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbit1 { from { transform: rotate(0deg) translateX(12px) rotate(0deg); } to { transform: rotate(360deg) translateX(12px) rotate(-360deg); } }
        @keyframes orbit2 { from { transform: rotate(0deg) translateX(10px) rotate(0deg); } to { transform: rotate(-360deg) translateX(10px) rotate(360deg); } }
        @keyframes orbit3 { from { transform: rotate(0deg) translateX(14px) rotate(0deg); } to { transform: rotate(360deg) translateX(14px) rotate(-360deg); } }
      `}</style>
    </section>
  );
};

export default AboutScreen;
