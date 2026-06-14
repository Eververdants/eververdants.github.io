import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const NAV_ITEMS = [
  { labelKey: 'nav.home', path: '/', hash: '#hero' },
  { labelKey: 'nav.projects', path: '/projects', hash: '#products' },
  { labelKey: 'nav.blog', path: '/blog', hash: '#knowledge' },
  { labelKey: 'nav.videos', path: '/videos', hash: '#social' },
] as const;

const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);

      if (y > lastScrollY.current && y > 120) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const handleNavClick = (item: typeof NAV_ITEMS[number]) => {
    if (item.path === '/' && location.pathname === '/') {
      const target = document.querySelector(item.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(item.path);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/88 dark:bg-ink/88 backdrop-blur-[16px] saturate-[180%] border-b border-warm-200/50 dark:border-warm-400/10 py-5 px-12'
          : 'bg-transparent py-7 px-12'
      }`}
      style={{
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="max-w-[1080px] mx-auto flex justify-between items-center">
        <button
          onClick={() => {
            navigate('/');
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          }}
          className="font-mono text-[0.72rem] tracking-[0.25em] uppercase text-ink dark:text-warm-50 hover:opacity-60 transition-opacity duration-300"
        >
          Studio
        </button>

        <div className="hidden md:flex items-center gap-9">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className="relative font-mono text-[0.7rem] tracking-[0.15em] uppercase text-warm-400 hover:text-ink dark:hover:text-warm-50 transition-colors duration-300 group"
            >
              {t(item.labelKey as any)}
              <span className="absolute bottom-[-4px] left-0 w-0 h-px bg-ink dark:bg-warm-50 group-hover:w-full transition-all duration-400"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }} />
            </button>
          ))}

          <button
            onClick={toggleLanguage}
            className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-warm-400 hover:text-ink dark:hover:text-warm-50 transition-colors duration-300"
          >
            {language === 'en' ? '中' : 'EN'}
          </button>
        </div>

        {/* Mobile: simple language toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-warm-400 hover:text-ink dark:hover:text-warm-50 transition-colors duration-300"
          >
            {language === 'en' ? '中' : 'EN'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
