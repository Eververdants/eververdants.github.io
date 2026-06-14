import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowSquareOut, GithubLogo, CheckCircle, CaretLeft, Tag } from '@phosphor-icons/react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useLanguage } from '../contexts/LanguageContext';
import { getProjects } from '../data';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const projects = getProjects(language);
  const project = projects.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-[100dvh] pt-28 pb-20 flex items-center justify-center">
        <motion.div
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold text-ink mb-4">{t('common.noData')}</h2>
          <p className="text-warm-400 mb-8">{t('common.noDataDesc')}</p>
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-forest-500 text-white font-semibold hover:bg-forest-600 transition-colors active:scale-[0.98]"
          >
            <CaretLeft size={18} />
            {t('sections.projects.back')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-[100dvh] pt-28 pb-20"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <motion.div
          className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-warm-200"
          variants={fadeUp}
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-forest-50 text-forest-500"
              >
                {tag}
              </span>
            ))}
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-500">
              {project.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-ink font-display mb-6">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition-colors active:scale-[0.98]"
            >
              <ArrowSquareOut size={16} />
              {t('sections.projects.demo')}
            </a>
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-warm-300 text-ink text-sm font-semibold hover:bg-warm-100 transition-colors active:scale-[0.98]"
              >
                <GithubLogo size={16} />
                {t('sections.projects.source')}
              </a>
            )}
          </div>

          {project.articleContent ? (
            <div className="mb-10">
              <MarkdownRenderer content={project.articleContent} />
            </div>
          ) : project.features && project.features.length > 0 ? (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-ink mb-4">{t('sections.projects.features')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-warm-50">
                    <CheckCircle size={18} className="text-forest-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-ink/70">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="pt-6 border-t border-warm-200">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} className="text-warm-400" />
              <span className="text-sm font-semibold text-ink">{t('sections.projects.tech')}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-warm-100 text-ink/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-warm-200">
            <button
              onClick={() => navigate('/projects')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-forest-500 hover:text-forest-600 transition-colors active:scale-[0.98]"
            >
              <CaretLeft size={16} />
              {t('sections.projects.back')}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectDetail;
