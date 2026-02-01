import React from 'react';
import { GALLERY_ITEMS } from '../constants';
import { ZoomIn } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Gallery: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="gallery" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('sections.gallery.title')}</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t('sections.gallery.subtitle')}
        </p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {GALLERY_ITEMS.map((item) => (
          <div key={item.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500">
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
            />

            {/* Glass Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1 block">{t('sections.gallery.category')}</span>
                <h3 className="text-white text-xl font-serif italic">"{item.title}"</h3>
              </div>

              <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity delay-100 hover:bg-white/40">
                <ZoomIn size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;