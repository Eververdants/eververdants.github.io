import React, { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socialPlatforms, primaryPlatforms, secondaryPlatforms } from '../../data/social';
import { getSocialIcon } from '../social-icons';

const NONLINEAR_EASING = [0.16, 1, 0.3, 1] as const;

interface Props {
  isActive: boolean;
}

const setCursor = (hover: boolean) => {
  (window as any).__setCursor?.(hover);
};

// ── WeChat Card with QR reveal ──
const WeChatCard: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const platform = secondaryPlatforms.find(p => p.id === 'wechat')!;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    card.style.transform = `perspective(800px) rotateX(${(0.5 - y) * 12}deg) rotateY(${(x - 0.5) * 12}deg) scale3d(1.03,1.03,1.03)`;

    const content = card.querySelector('.card-inner') as HTMLElement;
    if (content) content.style.transform = `translate(${(x - 0.5) * -8}px, ${(y - 0.5) * -8}px)`;

    const gx = x * 100;
    const gy = y * 100;

    const glow = card.querySelector('.card-glow') as HTMLElement;
    if (glow) {
      glow.style.opacity = '1';
      glow.style.background = `radial-gradient(circle 300px at ${gx}% ${gy}%, rgba(7,193,96,0.10), transparent 70%)`;
    }

    const border = card.querySelector('.card-border') as HTMLElement;
    if (border) border.style.opacity = '1';

    const shimmer = card.querySelector('.card-shimmer') as HTMLElement;
    if (shimmer) {
      shimmer.style.opacity = '1';
      shimmer.style.background = `linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 70%)`;
      shimmer.style.backgroundPosition = `${gx * 3}% 0`;
    }
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(false);
    const card = e.currentTarget;
    card.style.transform = '';
    const content = card.querySelector('.card-inner') as HTMLElement;
    if (content) content.style.transform = '';
    const glow = card.querySelector('.card-glow') as HTMLElement;
    if (glow) glow.style.opacity = '0';
    const border = card.querySelector('.card-border') as HTMLElement;
    if (border) border.style.opacity = '0';
    const shimmer = card.querySelector('.card-shimmer') as HTMLElement;
    if (shimmer) shimmer.style.opacity = '0';
  }, []);

  return (
    <div
      className="group relative cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => { setCursor(true); setIsHovered(true); }}
    >
      {/* Glow */}
      <div className="card-glow absolute -inset-4 rounded-3xl opacity-0 pointer-events-none transition-opacity duration-500" />

      {/* Animated border */}
      <div className="card-border absolute inset-0 rounded-xl opacity-0 pointer-events-none overflow-hidden transition-opacity duration-500">
        <div className="absolute inset-0 rounded-xl" style={{
          padding: '1px',
          background: 'linear-gradient(135deg, #07C16050, transparent 50%, #06ad5650)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }} />
      </div>

      {/* Shimmer */}
      <div className="card-shimmer absolute inset-0 rounded-xl opacity-0 pointer-events-none transition-opacity duration-300" />

      {/* Card inner */}
      <motion.div
        className="card-inner relative bg-white/60 dark:bg-ink-700/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border transition-all duration-500 overflow-hidden"
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        animate={{
          borderColor: isHovered
            ? 'rgba(7,193,96,0.35)'
            : 'rgba(236,232,224,0.2)',
        }}
        transition={{ duration: 0.5, ease: NONLINEAR_EASING }}
      >
        {/* Front: icon + name */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <motion.div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #07C160, #06ad56)',
            }}
            animate={{ scale: isHovered ? 1.1 : 1, rotate: isHovered ? -3 : 0 }}
            transition={{ duration: 0.5, ease: NONLINEAR_EASING }}
          >
            {getSocialIcon('wechat', '#ffffff', 18)}
          </motion.div>
          <div className="flex-1 min-w-0">
            <motion.div
              className="font-display text-[0.8rem] sm:text-sm font-medium text-ink dark:text-warm-50"
              animate={{ color: isHovered ? '#07C160' : undefined }}
              transition={{ duration: 0.4, ease: NONLINEAR_EASING }}
            >
              微信
            </motion.div>
          </div>
          <motion.span
            className="text-xs text-warm-400"
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -4 }}
            transition={{ duration: 0.4, ease: NONLINEAR_EASING }}
          >→</motion.span>
        </div>

        {/* QR Code — animated reveal */}
        <AnimatePresence initial={false}>
          {isHovered && (
            <motion.div
              key="qr"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: NONLINEAR_EASING }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-green-500/15">
                <div className="relative">
                  <img
                    src="/images/好友码.JPG"
                    alt="好友码"
                    className="w-full rounded-lg"
                  />
                  {/* Decorative corner accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400/40 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400/40 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-400/40 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-400/40 rounded-br-lg" />
                </div>
                <p className="text-[10px] text-center text-warm-400 mt-1.5 font-mono tracking-wider">
                  扫码添加好友 · Scan to connect
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// ── Main Screen ──
const SocialScreen: React.FC<Props> = ({ isActive }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [appreciateHovered, setAppreciateHovered] = useState(false);

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const tiltX = (0.5 - y) * 12;
    const tiltY = (x - 0.5) * 12;
    const px = (x - 0.5) * -8;
    const py = (y - 0.5) * -8;
    const gx = x * 100;
    const gy = y * 100;

    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03,1.03,1.03)`;

    const content = card.querySelector('.card-inner') as HTMLElement;
    if (content) content.style.transform = `translate(${px}px, ${py}px)`;

    const glow = card.querySelector('.card-glow') as HTMLElement;
    if (glow) {
      glow.style.opacity = '1';
      glow.style.background = `radial-gradient(circle 300px at ${gx}% ${gy}%, rgba(201,169,110,0.12), transparent 70%)`;
    }

    const border = card.querySelector('.card-border') as HTMLElement;
    if (border) border.style.opacity = '1';

    const shimmer = card.querySelector('.card-shimmer') as HTMLElement;
    if (shimmer) {
      shimmer.style.opacity = '1';
      shimmer.style.background = `linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 70%)`;
      shimmer.style.backgroundPosition = `${gx * 3}% 0`;
    }
  }, []);

  const handleCardMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = '';
    const content = card.querySelector('.card-inner') as HTMLElement;
    if (content) content.style.transform = '';
    const glow = card.querySelector('.card-glow') as HTMLElement;
    if (glow) glow.style.opacity = '0';
    const border = card.querySelector('.card-border') as HTMLElement;
    if (border) border.style.opacity = '0';
    const shimmer = card.querySelector('.card-shimmer') as HTMLElement;
    if (shimmer) shimmer.style.opacity = '0';
  }, []);

  const handleCardClick = (url: string) => {
    if (url !== '#') window.open(url, '_blank');
  };

  const renderPrimaryCard = (platform: typeof primaryPlatforms[number], index: number) => (
    <div
      key={platform.id}
      className="group relative cursor-pointer"
      style={{ transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      onMouseEnter={() => setCursor(true)}
      onClick={() => handleCardClick(platform.url)}
    >
      <div className="card-glow absolute -inset-4 rounded-3xl opacity-0 pointer-events-none transition-opacity duration-500" />
      <div className="card-border absolute inset-0 rounded-2xl opacity-0 pointer-events-none overflow-hidden transition-opacity duration-500">
        <div className="absolute inset-0 rounded-2xl" style={{
          padding: '1px',
          background: `linear-gradient(135deg, ${platform.gradient[0]}60, transparent 40%, transparent 60%, ${platform.gradient[1]}60)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }} />
      </div>
      <div className="card-shimmer absolute inset-0 rounded-2xl opacity-0 pointer-events-none transition-opacity duration-300" />
      <div className="card-inner relative bg-white dark:bg-ink-700 rounded-2xl p-4 md:p-6 border border-warm-200/30 dark:border-warm-800/30 transition-all duration-500"
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
            style={{
              background: `linear-gradient(135deg, ${platform.gradient[0]}, ${platform.gradient[1]})`,
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {getSocialIcon(platform.icon, '#ffffff', 28)}
          </div>
          {platform.primary && (
            <div className="text-right">
              <div className="font-mono text-xs text-warm-400">Followers</div>
              <div className="font-display text-lg font-semibold text-ink dark:text-warm-50">
                {platform.followers}
              </div>
            </div>
          )}
        </div>
        <h3 className="font-display text-lg md:text-xl font-semibold text-ink dark:text-warm-50 mb-1 md:mb-2 transition-colors duration-500 group-hover:text-amber-700 dark:group-hover:text-amber-400">
          {platform.name.zh}
        </h3>
        <div className="flex items-center gap-2 text-warm-400">
          <span className="font-mono text-xs transition-colors duration-500 group-hover:text-ink dark:group-hover:text-warm-50">Visit</span>
          <span className="visit-arrow text-sm transition-all duration-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">→</span>
        </div>
      </div>
    </div>
  );

  return (
    <section ref={containerRef} className="w-full h-full relative overflow-y-auto bg-white dark:bg-ink">
      <div className="absolute inset-0 bg-gradient-to-br from-warm-50/50 via-transparent to-warm-100/30 dark:from-ink dark:to-ink-800" />

      {/* Header — hidden on mobile */}
      <div className="hidden sm:block absolute top-5 left-5 sm:top-8 sm:left-8 md:left-16 z-30">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isActive ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: NONLINEAR_EASING }}
          className="font-mono text-[0.6rem] sm:text-[0.65rem] tracking-[0.3em] sm:tracking-[0.35em] uppercase text-warm-400 mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={isActive ? { width: 24 } : {}}
            transition={{ duration: 1, delay: 0.4, ease: NONLINEAR_EASING }}
            className="h-px bg-warm-300 dark:bg-warm-400/30"
          />
          Connect
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={isActive ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, delay: 0.3, ease: NONLINEAR_EASING }}
          className="font-display font-normal text-[clamp(1.5rem,4vw,3rem)] tracking-[-0.02em] text-ink dark:text-warm-50"
        >
          社交平台
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease: NONLINEAR_EASING }}
          className="font-sans text-xs sm:text-sm text-warm-400 mt-1 sm:mt-2 max-w-xs"
        >
          连接创作者的数字宇宙
        </motion.p>
      </div>

      {/* Cards grid */}
      <div className="absolute inset-0 flex items-center sm:items-center justify-center p-4 pt-6 sm:pt-20 sm:p-8 md:pt-16 md:p-16 overflow-y-auto">
        <div className="w-full max-w-6xl">
          {/* Primary — mobile: 1 col, sm: 2 col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
            {primaryPlatforms.map((platform, i) => renderPrimaryCard(platform, i))}
          </div>

          {/* Secondary — hidden on mobile, sm: 3 col */}
          <div className="hidden sm:grid grid-cols-3 gap-3 md:gap-4">
            {secondaryPlatforms.map((platform) => {
              // Replace WeChat with a custom QR-reveal card
              if (platform.id === 'wechat') {
                return <WeChatCard key="wechat" />;
              }
              return (
                <div
                  key={platform.id}
                  className="group relative cursor-pointer"
                  style={{ transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  onMouseEnter={() => setCursor(true)}
                  onClick={() => handleCardClick(platform.url)}
                >
                  <div className="card-glow absolute -inset-4 rounded-3xl opacity-0 pointer-events-none transition-opacity duration-500" />
                  <div className="card-border absolute inset-0 rounded-xl opacity-0 pointer-events-none overflow-hidden transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-xl" style={{
                      padding: '1px',
                      background: `linear-gradient(135deg, ${platform.gradient[0]}50, transparent 50%, ${platform.gradient[1]}50)`,
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                    }} />
                  </div>
                  <div className="card-shimmer absolute inset-0 rounded-xl opacity-0 pointer-events-none transition-opacity duration-300" />
                  <div className="card-inner relative bg-white/60 dark:bg-ink-700/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-warm-200/20 dark:border-warm-800/20 transition-all duration-500"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                        style={{
                          background: `linear-gradient(135deg, ${platform.gradient[0]}, ${platform.gradient[1]})`,
                          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        {getSocialIcon(platform.icon, '#ffffff', 18)}
                      </div>
                      <div>
                        <div className="font-display text-[0.8rem] sm:text-sm font-medium text-ink dark:text-warm-50 transition-colors duration-500 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                          {platform.name.zh}
                        </div>
                        {platform.primary && (
                          <div className="font-mono text-[9px] sm:text-[10px] text-warm-400">
                            {platform.followers}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="visit-arrow inline-block text-xs text-warm-400 opacity-0 ml-1 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 赞赏码 (Appreciation QR) — enhanced gold & coin effects ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 1.0, ease: NONLINEAR_EASING }}
        className="hidden sm:block absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-16 z-20"
        onMouseEnter={() => setAppreciateHovered(true)}
        onMouseLeave={() => setAppreciateHovered(false)}
      >
        <motion.div
          className="relative origin-bottom-left"
          animate={{ scale: appreciateHovered ? 2.0 : 1 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
            mass: 0.6,
          }}
        >
          {/* Pulse rings — expand outward on hover */}
          <AnimatePresence>
            {appreciateHovered && (
              <>
                <motion.div
                  key="pr1"
                  className="absolute inset-0 rounded-xl border-2 border-amber-400/50 pointer-events-none"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  key="pr2"
                  className="absolute inset-0 rounded-xl border border-amber-300/40 pointer-events-none"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.0, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                />
                <motion.div
                  key="pr3"
                  className="absolute inset-0 rounded-xl border border-yellow-200/30 pointer-events-none"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Orbiting coin particles — 5 coins circle the card */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i / 5) * 360;
            const r = appreciateHovered ? 56 : 28;
            return (
              <motion.div
                key={`oc-${i}`}
                className="absolute w-[9px] h-[9px] rounded-full pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                  border: '1px solid rgba(251,191,36,0.6)',
                  boxShadow: '0 0 6px rgba(217,119,6,0.5)',
                  left: '50%',
                  top: '50%',
                  marginLeft: -4.5,
                  marginTop: -4.5,
                }}
                animate={{
                  x: Math.cos((angle * Math.PI) / 180) * r,
                  y: Math.sin((angle * Math.PI) / 180) * r,
                  scale: appreciateHovered ? [1, 1.4, 1] : 0,
                  opacity: appreciateHovered ? [0.4, 1, 0.4] : 0,
                }}
                transition={{
                  duration: 2.5 + i * 0.2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.15,
                }}
              />
            );
          })}

          {/* Floating coin particles — rise upward on hover */}
          <AnimatePresence>
            {appreciateHovered && [0, 1, 2].map((i) => (
              <motion.div
                key={`fu-${i}`}
                className="absolute w-[6px] h-[6px] rounded-full pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #fde68a, #f59e0b)',
                  left: `${25 + i * 25}%`,
                  bottom: '100%',
                  boxShadow: '0 0 8px rgba(251,191,36,0.6)',
                }}
                initial={{ y: 0, opacity: 0.8, scale: 0.5 }}
                animate={{
                  y: [-8, -35, -55],
                  opacity: [0.8, 0.4, 0],
                  scale: [0.5, 1.2, 0.3],
                }}
                exit={{ opacity: 0, y: -30 }}
                transition={{
                  duration: 1.5 + i * 0.25,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 0.35,
                }}
              />
            ))}
          </AnimatePresence>

          {/* Background glow */}
          <motion.div
            className="absolute -inset-8 rounded-3xl pointer-events-none"
            animate={{
              opacity: appreciateHovered ? 1 : 0,
              background: appreciateHovered
                ? 'radial-gradient(circle 150px at center, rgba(217,119,6,0.2) 0%, rgba(251,191,36,0.08) 40%, transparent 70%)'
                : 'radial-gradient(circle 150px at center, transparent)',
            }}
            transition={{ duration: 0.6, ease: NONLINEAR_EASING }}
          />

          {/* Card with rotating gold gradient border */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden">
            {/* Rotating conic gradient — creates flowing golden border */}
            <motion.div
              className="absolute -inset-4"
              style={{
                background: 'conic-gradient(from 0deg, #fbbf24 0%, #f59e0b 15%, #fde68a 30%, #fbbf24 45%, #d97706 60%, #92400e 75%, #f59e0b 85%, #fde68a 95%, #fbbf24 100%)',
              }}
              animate={appreciateHovered ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            {/* Inner content — masks the center, leaves 2px border visible */}
            <div className="absolute inset-[2px] rounded-[10px] overflow-hidden bg-white dark:bg-ink-800 shadow-inner">
              <img
                src="/images/赞赏码.JPG"
                alt="赞赏码"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Label */}
          <motion.div
            className="text-center mt-2.5"
            animate={{
              opacity: appreciateHovered ? 1 : 0.65,
              y: appreciateHovered ? 0 : 2,
            }}
            transition={{ duration: 0.4, ease: NONLINEAR_EASING }}
          >
            <motion.span
              className="inline-block font-mono text-[8px] tracking-[0.18em] uppercase"
              animate={{
                color: appreciateHovered ? '#d97706' : 'rgba(217,119,6,0.6)',
                textShadow: appreciateHovered
                  ? '0 0 14px rgba(217,119,6,0.5), 0 0 30px rgba(251,191,36,0.2)'
                  : '0 0 0px transparent',
              }}
              transition={{ duration: 0.4, ease: NONLINEAR_EASING }}
            >
              ✦ 赞赏 ✦
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>

    </section>
  );
};

export default SocialScreen;
