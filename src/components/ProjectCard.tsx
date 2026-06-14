import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

const MAX_VISIBLE_TAGS = 3;

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const visibleTags = project.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraCount = project.tags.length - MAX_VISIBLE_TAGS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/project/${project.id}`)}
      className="group cursor-pointer bg-white dark:bg-ink rounded-xl overflow-hidden border border-warm-200 dark:border-warm-400/10 card-hover"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 dark:bg-ink/90 text-ink dark:text-warm-50 shadow-md">
            <ArrowSquareOut size={16} />
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest-500">
            {project.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-ink dark:text-warm-50 mb-2 group-hover:text-forest-500 dark:group-hover:text-forest-300 transition-colors font-display">
          {project.title}
        </h3>
        <p className="text-sm text-ink/60 dark:text-warm-50/60 leading-relaxed line-clamp-2 mb-4">
          {project.description}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-warm-100 dark:bg-warm-400/10 text-ink/60 dark:text-warm-50/60"
            >
              {tag}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-warm-200 dark:bg-warm-400/20 text-ink/50 dark:text-warm-50/50">
              +{extraCount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
