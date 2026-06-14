import React, { useState, useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import ScreenNav from '../components/fullscreen/ScreenNav';
import CustomCursor from '../components/fullscreen/CustomCursor';
import HeroScreen from '../components/fullscreen/HeroScreen';
import AboutScreen from '../components/fullscreen/AboutScreen';
import ProjectsScreen from '../components/fullscreen/ProjectsScreen';
import SocialScreen from '../components/fullscreen/SocialScreen';

const TOTAL_SCREENS = 4;

const FullScreenSite: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);
  const isAnimating = useRef(false);

  const getViewportHeight = () => window.innerHeight;

  const navigateTo = useCallback((index: number) => {
    if (isAnimating.current || index < 0 || index >= TOTAL_SCREENS) return;
    if (index === currentScreen) return;

    isAnimating.current = true;
    const container = containerRef.current;
    if (!container) return;

    const targetY = -index * getViewportHeight();

    gsap.to(container, {
      y: targetY,
      duration: 1,
      ease: 'power3.inOut',
      onComplete: () => {
        setCurrentScreen(index);
        isAnimating.current = false;
      },
    });
  }, [currentScreen]);

  // Wheel handler — discrete screen switching
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime.current < 1200) return;
      lastScrollTime.current = now;

      if (e.deltaY > 20) {
        navigateTo(currentScreen + 1);
      } else if (e.deltaY < -20) {
        navigateTo(currentScreen - 1);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 700) return;

      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 35) {
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
    };
  }, [currentScreen, navigateTo]);

  return (
    <div className="w-full h-dvh overflow-hidden bg-white dark:bg-ink">
      {/* Custom cursor — at top level, never transformed */}
      <CustomCursor />

      {/* Screen navigation dots */}
      <ScreenNav total={TOTAL_SCREENS} current={currentScreen} onNavigate={navigateTo} />

      {/* Screens container — uses GSAP transform for discrete switching */}
      <div
        ref={containerRef}
        className="w-full"
        style={{ height: `${TOTAL_SCREENS * 100}dvh` }}
      >
        <section className="w-full h-dvh">
          <HeroScreen />
        </section>
        <section className="w-full h-dvh">
          <AboutScreen isActive={currentScreen === 1} />
        </section>
        <section className="w-full h-dvh">
          <ProjectsScreen isActive={currentScreen === 2} />
        </section>
        <section className="w-full h-dvh">
          <SocialScreen isActive={currentScreen === 3} />
        </section>
      </div>

      {/* Fixed background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-white dark:bg-ink" />
    </div>
  );
};

export default FullScreenSite;
