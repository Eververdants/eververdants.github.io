import React, { useState } from 'react';
import { Mail, Github, Send, MapPin, Video, Music } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 items-start">
        {/* Left: Info */}
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">{t('sections.contact.title')}</h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 leading-relaxed">
            {t('sections.contact.desc')}
          </p>

          <div className="space-y-4 sm:space-y-6">
            <a href="mailto:llzgd@outlook.com" className="flex items-center gap-3 sm:gap-4 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
              <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Mail size={18} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-base sm:text-lg font-medium break-all">llzgd@outlook.com</span>
            </a>

            <div className="flex items-center gap-3 sm:gap-4 text-slate-700 dark:text-slate-200">
              <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <MapPin size={18} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-base sm:text-lg font-medium">{t('sections.contact.location')}</span>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">{t('sections.contact.follow')}</h3>
            <div className="flex gap-4">
              <a
                href="https://github.com/Eververdantsx"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 glass-card rounded-full hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-200 transition-all duration-300 hover:-translate-y-1"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://x.com/Eververdants"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 glass-card rounded-full hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-200 transition-all duration-300 hover:-translate-y-1"
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
                className="p-3 glass-card rounded-full hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-200 transition-all duration-300 hover:-translate-y-1"
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
                className="p-3 glass-card rounded-full hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-200 transition-all duration-300 hover:-translate-y-1"
                aria-label="Douyin"
              >
                <Music size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden">
          {/* Decorative background element inside card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('sections.contact.form.name')}</label>
              <input
                type="text"
                id="name"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:text-white"
                placeholder={t('sections.contact.form.name')}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('sections.contact.form.email')}</label>
              <input
                type="email"
                id="email"
                required
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:text-white"
                placeholder="hello@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('sections.contact.form.message')}</label>
              <textarea
                id="message"
                required
                rows={4}
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:text-white resize-none"
                placeholder={t('sections.contact.form.message')}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              ) : submitted ? (
                t('sections.contact.form.sent')
              ) : (
                <>{t('sections.contact.form.send')} <Send size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;