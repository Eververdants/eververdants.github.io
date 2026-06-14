import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="py-20 px-12 flex justify-between items-center border-t border-warm-300 dark:border-warm-400/20"
    >
      <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-warm-400">
        © 2025 {language === 'zh' ? '你的名字' : 'YOUR NAME'}
      </p>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: 40 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="h-px bg-warm-300 dark:bg-warm-400/30"
      />
      <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-warm-400">
        Crafted with care
      </p>
    </motion.footer>
  );
};

export default Footer;
