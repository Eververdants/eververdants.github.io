import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type ViewState = 'home' | 'projects' | 'photography' | 'calligraphy' | 'blog';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState, hash?: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  // Updated to use views instead of hashes
  const navLinks: { name: string; view: ViewState; hash?: string }[] = [
    { name: t('nav.projects'), view: 'projects' },
    { name: t('nav.photography'), view: 'photography' },
    { name: t('nav.calligraphy'), view: 'calligraphy' },
    { name: t('nav.blog'), view: 'blog' },
  ];

  const handleNavClick = (view: ViewState, hash?: string) => {
    setIsOpen(false);
    onNavigate(view, hash);
  };

  const isNotHome = currentView !== 'home';

  return (
    <nav
      className={`fixed top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 md:left-8 md:right-8 z-50 rounded-xl sm:rounded-2xl transition-all duration-300 ${scrolled || isNotHome
        ? 'glass-panel shadow-lg py-2 px-4 sm:py-3 sm:px-6'
        : 'bg-transparent py-3 px-3 sm:py-4 sm:px-4'
        }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center space-x-1.5 sm:space-x-2 group focus:outline-none">
            <div className={`rounded-lg sm:rounded-xl overflow-hidden transition-all ${scrolled || isNotHome ? 'ring-2 ring-emerald-500/30' : 'ring-2 ring-white/30'}`}>
              <img
                src="/image.png"
                alt="Eververdants"
                className="w-8 h-8 sm:w-10 sm:h-10 object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <span className={`text-base sm:text-xl font-bold tracking-tight ${scrolled || isNotHome ? 'text-slate-800 dark:text-slate-100' : 'text-slate-900 dark:text-white'}`}>
              Eververdants
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${scrolled || isNotHome ? '' : 'bg-white/30 dark:bg-black/30 backdrop-blur-md rounded-full px-2 py-1 border border-white/20'}`}>
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => onNavigate(link.view, link.hash)}
                  className={`px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-medium transition-all ${currentView === link.view
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 hover:text-emerald-700 dark:hover:text-emerald-400'
                    }`}
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>

            <button
              onClick={toggleLanguage}
              className="p-2.5 rounded-full hover:bg-white/40 dark:hover:bg-black/40 text-slate-700 dark:text-slate-300 transition-colors"
              aria-label="Toggle Language"
            >
              <Languages size={20} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-white/40 dark:hover:bg-black/40 text-slate-700 dark:text-slate-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => onNavigate('home', '#contact')}
              className="ml-2 px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              {t('nav.letsTalk')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full bg-white/20 backdrop-blur-md text-slate-800 dark:text-slate-200"
            >
              <Languages size={20} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 backdrop-blur-md text-slate-800 dark:text-slate-200"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full bg-white/20 backdrop-blur-md text-slate-800 dark:text-slate-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isOpen && (
        <div className="md:hidden mt-4 glass-card rounded-2xl p-4 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.view, link.hash)}
                className="px-4 py-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 font-medium transition-colors text-left"
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => handleNavClick('home', '#contact')}
              className="mt-2 px-4 py-3 rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-center border border-emerald-500/30"
            >
              {t('nav.contact')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;