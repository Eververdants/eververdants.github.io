import React, { useState, useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ScreenNav from '../components/fullscreen/ScreenNav';
import CustomCursor from '../components/fullscreen/CustomCursor';
import HeroScreen from '../components/fullscreen/HeroScreen';
import AboutScreen from '../components/fullscreen/AboutScreen';
import ProjectsScreen from '../components/fullscreen/ProjectsScreen';
import SocialScreen from '../components/fullscreen/SocialScreen';
import { TransitionProvider } from '../contexts/TransitionContext';

interface TransitionState {
  currentScreen: number;
  isAnimating: boolean;
  containerOffset: number;
  pairProgress: number;
  direction: 1 | -1;
}

const TOTAL_SCREENS = 4;
const NONLINEAR_EASING = [0.16, 1, 0.3, 1] as const;

const FullScreenSite: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);
  const isAnimating = useRef(false);
  const directionRef = useRef<1 | -1>(1);
  const transitionState = useRef<TransitionState>({
    currentScreen: 0,
    isAnimating: false,
    containerOffset: 0,
    pairProgress: 0,
    direction: 1,
  });

  // ── Motion values for reactive UI ──
  const rawY = useMotionValue(0);
  const smoothY = useSpring(rawY, { stiffness: 200, damping: 30, mass: 0.5 });
  const progress = useTransform(smoothY, [0, -(TOTAL_SCREENS - 1) * window.innerHeight], [0, 1]);
  const [barProgress, setBarProgress] = useState(0);

  // Keep progress bar in sync via rAF
  useEffect(() => {
    const unsub = progress.on('change', (v) => setBarProgress(v));
    return unsub;
  }, [progress]);

  // ── Parallax offsets for each screen ──
  const screenOffsets = useRef([0, 0, 0, 0]);
  useEffect(() => {
    const unsub = smoothY.on('change', (y) => {
      screenOffsets.current = Array.from({ length: TOTAL_SCREENS }, (_, i) => {
        const screenTop = -i * window.innerHeight;
        const viewportCenter = window.innerHeight / 2;
        const screenCenter = screenTop + window.innerHeight / 2;
        return (y + screenCenter - viewportCenter) / window.innerHeight;
      });
      // Update transition state for context
      transitionState.current.containerOffset = y / window.innerHeight;
      const p = Math.abs(y - (-currentScreen * window.innerHeight)) / window.innerHeight;
      transitionState.current.pairProgress = Math.min(p, 1);
    });
    return unsub;
  }, [currentScreen]);

  const getVh = () => window.innerHeight;

  const navigateTo = useCallback(
    (index: number) => {
      if (isAnimating.current || index < 0 || index >= TOTAL_SCREENS) return;
      if (index === currentScreen) return;

      isAnimating.current = true;
      transitionState.current.isAnimating = true;
      directionRef.current = index > currentScreen ? 1 : -1;
      transitionState.current.direction = directionRef.current;
      const container = containerRef.current;
      if (!container) return;

      const targetY = -index * getVh();

      // ── GSAP timeline: scale + slide + blur ──
      const tl = gsap.timeline({
        onComplete: () => {
          setCurrentScreen(index);
          transitionState.current.currentScreen = index;
          isAnimating.current = false;
          transitionState.current.isAnimating = false;
        },
      });

      if (index > currentScreen) {
        // Going forward: current screen scales slightly + fades, next slides in
        tl.to(container, {
          y: targetY,
          duration: 1.2,
          ease: 'power3.inOut',
        });
      } else {
        // Going backward: direct slide
        tl.to(container, {
          y: targetY,
          duration: 1.2,
          ease: 'power3.inOut',
        });
      }

      // Update rawY for framer-motion derived values
      gsap.to(rawY, {
        y: targetY,
        duration: 1.2,
        ease: 'power3.inOut',
        onUpdate: () => {
          rawY.set(-container.getBoundingClientRect().top || 0);
        },
      });
    },
    [currentScreen, rawY]
  );

  // ── Wheel handler with momentum ──
  useEffect(() => {
    let accumulated = 0;
    let wheelTimer = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime.current < 900) return;

      accumulated += e.deltaY;

      if (Math.abs(accumulated) > 40) {
        lastScrollTime.current = now;
        if (accumulated > 0) navigateTo(currentScreen + 1);
        else navigateTo(currentScreen - 1);
        accumulated = 0;
      }

      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => { accumulated = 0; }, 300);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 600) return;
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 30) {
        lastScrollTime.current = now;
        navigateTo(diff > 0 ? currentScreen + 1 : currentScreen - 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        navigateTo(currentScreen + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        navigateTo(currentScreen - 1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(wheelTimer);
    };
  }, [currentScreen, navigateTo]);

  // ── Resync rawY on resize ──
  useEffect(() => {
    const handleResize = () => {
      const targetY = -currentScreen * window.innerHeight;
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${targetY}px)`;
      }
      rawY.set(targetY);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentScreen, rawY]);

  // ── Render ──
  return (
    <TransitionProvider stateRef={transitionState}>
      <div className="w-full h-dvh overflow-hidden bg-white dark:bg-ink select-none">
        {/* ═══ Progress bar ═══ */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left pointer-events-none"
          style={{
            scaleX: barProgress,
            background: 'linear-gradient(90deg, #2d6a4f, #d4a853, #c97d2d)',
            willChange: 'transform',
          }}
        />

        {/* ═══ Screen number indicator ═══ */}
        <div className="fixed bottom-6 right-6 z-50 font-mono text-[0.55rem] tracking-[0.25em] text-warm-400/40 pointer-events-none hidden sm:block">
          {String(currentScreen + 1).padStart(2, '0')} / {String(TOTAL_SCREENS).padStart(2, '0')}
        </div>

        {/* Custom cursor */}
        <CustomCursor />

        {/* Screen navigation */}
        <ScreenNav total={TOTAL_SCREENS} current={currentScreen} onNavigate={navigateTo} />

        {/* ═══ Screens container ═══ */}
        <div
          ref={containerRef}
          className="w-full will-change-transform"
          style={{ height: `${TOTAL_SCREENS * 100}dvh` }}
        >
          <section className="w-full h-dvh relative">
            <HeroScreen />
          </section>
          <section className="w-full h-dvh relative">
            <AboutScreen isActive={currentScreen === 1} />
          </section>
          <section className="w-full h-dvh relative">
            <ProjectsScreen isActive={currentScreen === 2} />
          </section>
          <section className="w-full h-dvh relative">
            <SocialScreen isActive={currentScreen === 3} />
          </section>
        </div>

      </div>
    </TransitionProvider>
  );
};

export default FullScreenSite;
