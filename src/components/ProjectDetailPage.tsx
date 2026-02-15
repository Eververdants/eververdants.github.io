import React, { useEffect, useState } from 'react';
import { ChevronLeft, ExternalLink, Github, CheckCircle2, Layers } from 'lucide-react';
import { getProjects } from '../services/contentService';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const renderInlineLinks = (text: string): React.ReactNode[] => {
  const parts = text.split(URL_REGEX);
  return parts.map((part, index) => {
    if (part.match(URL_REGEX)) {
      return (
        <a
          key={`url-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 dark:text-emerald-400 hover:underline break-all"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={`txt-${index}`}>{part}</React.Fragment>;
  });
};

const renderArticleContent = (content: string): React.ReactNode[] => {
  const blocks: React.ReactNode[] = [];
  const lines = content.split('\n');
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith('```')) {
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push(
        <pre key={`code-${key++}`} className="mb-6 mt-4 overflow-x-auto rounded-xl bg-slate-950 text-slate-100 p-4 text-sm">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${key++}`} className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
          {line.replace('### ', '')}
        </h3>
      );
      i += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${key++}`} className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-10 mb-5">
          {line.replace('## ', '')}
        </h2>
      );
      i += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().replace(/^- /, ''));
        i += 1;
      }

      blocks.push(
        <ul key={`ul-${key++}`} className="mb-6 space-y-2 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
          {items.map((item, idx) => (
            <li key={`li-${idx}`}>{renderInlineLinks(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    const paragraph: string[] = [line];
    i += 1;
    while (i < lines.length) {
      const current = lines[i].trim();
      if (!current || current.startsWith('## ') || current.startsWith('### ') || current.startsWith('- ') || current.startsWith('```')) {
        break;
      }
      paragraph.push(current);
      i += 1;
    }

    blocks.push(
      <p key={`p-${key++}`} className="mb-5 text-slate-700 dark:text-slate-300 leading-8 text-base md:text-lg">
        {renderInlineLinks(paragraph.join(' '))}
      </p>
    );
  }

  return blocks;
};

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const projects = await getProjects(language);
        setProject(projects.find((item) => item.id === projectId) || null);
      } catch (err) {
        console.error('Failed to load project detail:', err);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [language, projectId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [projectId]);

  if (loading) {
    return (
      <div className="pt-12 pb-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-12 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
            <Layers size={40} className="text-slate-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {language === 'zh' ? '项目不存在' : 'Project Not Found'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-10">
            {language === 'zh' ? '该项目可能已被移除或暂不可用。' : 'This project may have been removed or is unavailable.'}
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity"
          >
            <ChevronLeft size={18} />
            {language === 'zh' ? '返回项目列表' : 'Back to Projects'}
          </button>
        </div>
      </div>
    );
  }

  const hasArticleContent = Boolean(project.articleContent && project.articleContent.trim());

  return (
    <div className="pb-28 md:pb-20 min-h-screen">
      <div className="relative h-[38vh] md:h-[48vh] overflow-hidden">
        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-black/20 to-black/40"></div>

        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/85 dark:bg-black/55 backdrop-blur-md text-slate-900 dark:text-white hover:bg-white dark:hover:bg-black transition-colors shadow-lg"
          >
            <ChevronLeft size={18} />
            <span className="text-sm font-semibold">{t('sections.projects.back') || (language === 'zh' ? '返回项目列表' : 'Back to Projects')}</span>
          </button>
        </div>

        <div className="absolute top-6 right-4 sm:right-8 z-10 hidden md:flex items-center gap-3">
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-lg"
          >
            {t('sections.projects.demo')} <ExternalLink size={16} />
          </a>
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 hover:bg-white text-slate-900 font-semibold transition-colors shadow-lg"
            >
              <Github size={16} /> {t('sections.projects.source')}
            </a>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <article className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 p-8 md:p-12">
          <div className="mb-3">
            <span className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {project.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            {project.title}
          </h1>

          <div className="mb-8 sticky top-20 z-20">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 flex flex-wrap gap-3 shadow-sm">
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
              >
                {t('sections.projects.demo')} <ExternalLink size={16} />
              </a>
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold transition-colors"
                >
                  <Github size={16} /> {t('sections.projects.source')}
                </a>
              )}
            </div>
          </div>

          {hasArticleContent ? (
            <div className="mb-10">
              {renderArticleContent(project.articleContent!)}
            </div>
          ) : (
            <p className="text-base md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-10">
              {project.fullDescription || project.description}
            </p>
          )}

          {!hasArticleContent && project.features && project.features.length > 0 && (
            <section className="mb-10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                {t('sections.projects.features')}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                    <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              {t('sections.projects.tech')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </article>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 shadow-xl flex gap-3">
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
          >
            {t('sections.projects.demo')} <ExternalLink size={16} />
          </a>
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold transition-colors"
            >
              <Github size={16} /> {t('sections.projects.source')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
