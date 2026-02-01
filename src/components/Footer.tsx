import React from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="mt-12 py-8 glass-panel border-t border-white/20 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium">
          <span>© 2025 Eververdants. {t('sections.footer.madeWith')}</span>
          <Heart size={14} className="text-rose-500 fill-current animate-pulse" />
          <span>{t('sections.footer.and')} React.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;