import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PageLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] bg-white dark:bg-ink flex items-center justify-center"
        >
          <div className="w-[120px] h-px bg-warm-300 dark:bg-warm-400/30 relative overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-ink dark:bg-warm-50"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
