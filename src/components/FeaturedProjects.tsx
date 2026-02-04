import React, { useState, useEffect } from 'react';
import { ExternalLink, ArrowRight, ArrowUpRight, X, Github, CheckCircle2, Layers } from 'lucide-react';
import { getProjects } from '../services/contentService';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const FeaturedProjects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isClosing, setIsClosing] = useState(false);
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedProject(null);
      setIsClosing(false);
    }, 300);
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
              onClick={() => setSelectedProject(project)}
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

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
            onClick={handleClose}
          ></div>

          <div className={`relative w-full max-w-4xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20 ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>

            {/* Close Button - Fixed */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            {/* Image Section - Fixed, No Scroll */}
            <div className="w-full md:w-2/5 h-64 md:h-full relative flex-shrink-0">
              <img
                src={selectedProject.imageUrl}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10"></div>

              <div className="absolute bottom-4 left-4 flex gap-3 md:hidden">
                <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-slate-900 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <ExternalLink size={14} /> {t('sections.projects.demo')}
                </a>
              </div>
            </div>

            {/* Content Section - Scrollable */}
            <div className="w-full md:w-3/5 overflow-y-auto flex flex-col bg-white dark:bg-slate-900">
              <div className="p-6 md:p-10 flex flex-col">
                <div className="mb-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">{selectedProject.category}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{selectedProject.title}</h3>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-base md:text-lg">
                  {selectedProject.fullDescription || selectedProject.description}
                </p>

                {selectedProject.features && (
                  <div className="mb-8">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{t('sections.projects.features')}</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProject.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-200 text-sm">
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-8">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{t('sections.projects.tech')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 hidden md:flex gap-4">
                  <a
                    href={selectedProject.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                  >
                    {t('sections.projects.demo')} <ExternalLink size={18} />
                  </a>
                  {selectedProject.repoUrl && (
                    <a
                      href={selectedProject.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-semibold transition-colors flex items-center gap-2"
                    >
                      <Github size={18} /> {t('sections.projects.source')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedProjects;