import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  total: number;
  current: number;
  onNavigate: (index: number) => void;
}

const LABELS = ['首页', '关于', '作品', '连接'];
const LABELS_EN = ['Home', 'About', 'Works', 'Connect'];

const ScreenNav: React.FC<Props> = ({ total, current, onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const handleMouseEnter = useCallback((i: number) => {
    setActiveIndex(i);
    const t = timers.current.get(i);
    if (t) clearTimeout(t);
  }, []);

  const handleMouseLeave = useCallback((i: number) => {
    const t = setTimeout(() => {
      setActiveIndex((prev) => prev === i ? null : prev);
    }, 200);
    timers.current.set(i, t);
  }, []);

  return (
    <nav className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-4 md:right-8 md:gap-5">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={() => handleMouseLeave(i)}
          className="group flex items-center gap-3"
          aria-label={`Go to screen ${i + 1}`}
        >
          {/* Label — appears on hover or when active */}
          <AnimatePresence mode="wait">
            {(activeIndex === i || current === i) && (
              <motion.span
                key={`label-${i}`}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`hidden md:block font-mono text-[0.6rem] tracking-[0.2em] uppercase transition-colors duration-300 ${
                  current === i
                    ? 'text-ink dark:text-warm-50'
                    : 'text-warm-400 group-hover:text-ink dark:group-hover:text-warm-50'
                }`}
              >
                {LABELS[i]}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Dot */}
          <div className="relative w-4 h-4 flex items-center justify-center">
            {/* Pulse ring on active */}
            {current === i && (
              <motion.div
                className="absolute rounded-full border border-ink/30 dark:border-warm-50/30"
                initial={{ width: 12, height: 12, opacity: 0.7 }}
                animate={{ width: 18, height: 18, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            {/* Dot */}
            <motion.div
              className="absolute rounded-full bg-ink dark:bg-warm-50"
              animate={{
                width: current === i ? 8 : 3,
                height: current === i ? 8 : 3,
                scale: activeIndex === i && current !== i ? 1.3 : 1,
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </button>
      ))}

      {/* Screen indicator line */}
      <div className="hidden md:block w-6 h-px bg-warm-300/40 dark:bg-warm-400/20 mt-2" />
      <div className="hidden md:flex flex-col items-end font-mono text-[0.45rem] tracking-[0.2em] text-warm-400/40">
        <span>{String(current + 1).padStart(2, '0')}</span>
        <span>{String(total).padStart(2, '0')}</span>
      </div>
    </nav>
  );
};

export default ScreenNav;
