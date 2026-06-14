import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, FileText, ArrowSquareOut } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { VideoItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface VideoCardProps {
  video: VideoItem;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-ink rounded-xl overflow-hidden border border-warm-200 dark:border-warm-400/10 card-hover"
    >
      <div className="relative aspect-video overflow-hidden group">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-forest-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
            <Play size={24} className="text-white fill-white ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
            <Clock size={12} />
            {video.duration}
          </span>
          <span className="px-2 py-1 rounded-md bg-amber-500/90 text-white text-xs font-medium">
            {video.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-ink dark:text-warm-50 mb-2 font-display">
          {video.title}
        </h3>
        <p className="text-sm text-ink/60 dark:text-warm-50/60 leading-relaxed line-clamp-2 mb-4">
          {video.description}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/video/${video.id}`)}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-warm-100 dark:bg-warm-400/10 text-ink dark:text-warm-50 hover:bg-warm-200 dark:hover:bg-warm-400/20 transition-colors"
          >
            <FileText size={14} />
            {t('sections.videos.notes')}
          </button>
          <a
            href={video.bilibiliUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-forest-500 text-white hover:bg-forest-600 transition-colors"
          >
            <ArrowSquareOut size={14} />
            Bilibili
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;
