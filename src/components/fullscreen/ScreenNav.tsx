import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  total: number;
  current: number;
  onNavigate: (index: number) => void;
}

const LABELS = ['首页', '关于', '作品', '连接'];

const ScreenNav: React.FC<Props> = ({ total, current, onNavigate }) => {
  return (
    <nav className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-4 md:right-8 md:gap-5">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          className="group flex items-center gap-3"
          aria-label={`Go to screen ${i + 1}`}
        >
          <span
            className={`hidden md:block font-mono text-[0.6rem] tracking-[0.2em] uppercase transition-all duration-400 ${
              current === i
                ? 'opacity-100 text-ink dark:text-warm-50 translate-x-0'
                : 'opacity-0 text-warm-400 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {LABELS[i]}
          </span>
          <div className="relative w-3 h-3 flex items-center justify-center">
            <motion.div
              className="absolute rounded-full bg-ink dark:bg-warm-50"
              animate={{
                width: current === i ? 8 : 3,
                height: current === i ? 8 : 3,
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </button>
      ))}
    </nav>
  );
};

export default ScreenNav;
