import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, Layers } from 'lucide-react';
import { getProjects } from '../services/contentService';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const FeaturedProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  // Load projects from Cloudflare KV
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects(language);
        setProjects(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, [language]);

  const featuredProjects = projects;

  const navigateToAllProjects = () => {
    const event = new CustomEvent('navigate-to', { detail: 'projects' });
    window.dispatchEvent(event);
  };

  const openProjectDetail = (projectId: string) => {
    const event = new CustomEvent('navigate-to', {
      detail: {
        view: 'project-detail',
        projectId,
        from: 'home'
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <section id="featured-projects" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Layers size={32} />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('sections.projects.title')}</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {t('sections.projects.subtitle')}
            </p>
          </div>
        </div>

        <button
          onClick={navigateToAllProjects}
          className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold group transition-colors"
        >
          {t('sections.projects.viewAll')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => openProjectDetail(project.id)}
              className="group glass-card rounded-3xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>

                <div className="absolute top-4 right-4">
                  <div className="p-2 bg-white/90 dark:bg-black/70 rounded-full text-slate-900 dark:text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight size={20} />
                  </div>
                </div>

                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/20">
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {project.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 md:hidden text-center">
        <button
          onClick={navigateToAllProjects}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
        >
          {t('sections.projects.viewAll')} <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
};

export default FeaturedProjects;
