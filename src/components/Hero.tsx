import React from 'react';
import { ArrowDown, Github, Code2, Camera, PenTool, Music } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const navigateTo = (view: string) => {
  const event = new CustomEvent('navigate-to', { detail: view });
  window.dispatchEvent(event);
};

const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 sm:pt-24 px-4 sm:px-6 overflow-hidden">

      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* Text Content */}
        <div className="text-center lg:text-left order-2 lg:order-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 leading-[1.1] tracking-tight">
            {t('hero.title')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
              {t('hero.titleHighlight')}
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            {t('hero.intro')} <span className="font-semibold text-slate-900 dark:text-white">Eververdants</span>.
            {t('hero.introDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3 sm:gap-4">
            <button
              onClick={() => navigateTo('projects')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base"
            >
              {t('hero.viewProjects')}
            </button>
            <button
              onClick={() => navigateTo('calligraphy')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-full glass-panel text-slate-800 dark:text-white font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 text-sm sm:text-base"
            >
              {t('hero.viewGallery')}
            </button>
          </div>

          <div className="mt-8 sm:mt-12 flex items-center lg:justify-start justify-center gap-4 sm:gap-6">
            <a
              href="https://github.com/Eververdantsx"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full glass-panel hover:scale-110 hover:bg-white dark:hover:bg-white/20 transition-all text-slate-700 dark:text-slate-300"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="https://x.com/Eververdants"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full glass-panel hover:scale-110 hover:bg-white dark:hover:bg-white/20 transition-all text-slate-700 dark:text-slate-300"
              aria-label="X (Twitter)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://space.bilibili.com/2019959464"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full glass-panel hover:scale-110 hover:bg-white dark:hover:bg-white/20 transition-all text-slate-700 dark:text-slate-300"
              aria-label="Bilibili"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z" />
              </svg>
            </a>
            <a
              href="https://www.douyin.com/user/MS4wLjABAAAA8MEFE6VVh4_nWkTLPbueZYywgSyN19xhUFkmDF-nkhlnWytZWiBZ9YWM5s3RsprJ"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full glass-panel hover:scale-110 hover:bg-white dark:hover:bg-white/20 transition-all text-slate-700 dark:text-slate-300"
              aria-label="Douyin"
            >
              <Music size={20} />
            </a>
          </div>
        </div>

        {/* Visual/Card Content */}
        <div className="order-1 lg:order-2 relative flex justify-center perspective-1000">
          {/* Abstract floating cards */}
          <div className="relative w-64 h-72 sm:w-72 sm:h-80 md:w-96 md:h-96">
            <div onClick={() => navigateTo('projects')} className="cursor-pointer absolute inset-0 glass-card rounded-2xl sm:rounded-3xl transform rotate-6 animate-pulse shadow-2xl z-10 flex flex-col items-center justify-center p-6 sm:p-8 text-center border-t border-l border-white/40 hover:scale-105 transition-transform">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 flex items-center justify-center shadow-lg text-white">
                <Code2 size={24} className="sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">{t('hero.cards.code')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{t('hero.cards.codeDesc')}</p>
            </div>

            <div onClick={() => navigateTo('photography')} className="cursor-pointer absolute inset-0 glass-card rounded-2xl sm:rounded-3xl transform -rotate-12 translate-x-6 sm:translate-x-8 -translate-y-6 sm:-translate-y-8 shadow-xl z-0 bg-white/30 dark:bg-black/30 flex flex-col items-center justify-center p-6 sm:p-8 opacity-60 scale-90 border-t border-l border-white/30 hover:opacity-90 transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 flex items-center justify-center shadow-lg text-white">
                <Camera size={24} className="sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">{t('hero.cards.photo')}</h3>
            </div>

            <div onClick={() => navigateTo('calligraphy')} className="cursor-pointer absolute inset-0 glass-card rounded-2xl sm:rounded-3xl transform -rotate-6 translate-x-3 sm:translate-x-4 translate-y-3 sm:translate-y-4 shadow-xl z-0 bg-white/30 dark:bg-black/30 flex flex-col items-center justify-center p-6 sm:p-8 opacity-80 scale-95 border-t border-l border-white/30 hover:opacity-100 transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 flex items-center justify-center shadow-lg text-white">
                <PenTool size={24} className="sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">{t('hero.cards.ink')}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-400 dark:text-slate-600">
        <ArrowDown size={20} className="sm:w-6 sm:h-6" />
      </div>
    </section>
  );
};

export default Hero;