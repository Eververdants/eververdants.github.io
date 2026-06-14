import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CalendarBlank, ArrowSquareOut, CaretLeft, Play, Tag } from '@phosphor-icons/react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useLanguage } from '../contexts/LanguageContext';
import { getVideos } from '../data';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const VideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const videos = getVideos(language);
  const video = videos.find((v) => v.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!video) {
    return (
      <div className="min-h-[100dvh] pt-28 pb-20 flex items-center justify-center">
        <motion.div
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Play size={48} className="mx-auto text-warm-400 mb-4" />
          <h2 className="text-2xl font-bold text-ink mb-4">{t('common.noData')}</h2>
          <p className="text-warm-400 mb-8">{t('common.noDataDesc')}</p>
          <button
            onClick={() => navigate('/videos')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-forest-500 text-white font-semibold hover:bg-forest-600 transition-colors active:scale-[0.98]"
          >
            <CaretLeft size={18} />
            {t('sections.videos.back')}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="mb-8" variants={fadeUp}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-500">
              {video.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-ink font-display mb-6">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-warm-400 mb-8">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={15} />
              {video.duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarBlank size={15} />
              {video.date}
            </span>
          </div>
        </motion.div>

        <motion.div className="relative aspect-video rounded-xl overflow-hidden bg-ink mb-8" variants={fadeUp}>
          <iframe
            src={`https://player.bilibili.com/player.html?bvid=${video.bilibiliEmbedId}`}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            title={video.title}
          />
        </motion.div>

        <motion.div className="flex flex-wrap items-center gap-3 mb-10" variants={fadeUp}>
          <a
            href={video.bilibiliUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition-colors active:scale-[0.98]"
          >
            <ArrowSquareOut size={16} />
            {t('sections.videos.watchOnBilibili')}
          </a>
        </motion.div>

        {video.noteContent && (
          <motion.div className="mb-10" variants={fadeUp}>
            <h2 className="text-xl font-bold text-ink mb-4">{t('sections.videos.notes')}</h2>
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-warm-200">
              <MarkdownRenderer content={video.noteContent} />
            </div>
          </motion.div>
        )}

        {video.tags && video.tags.length > 0 && (
          <motion.div className="pt-6 border-t border-warm-200" variants={fadeUp}>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-warm-100 text-ink/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <motion.button
          onClick={() => navigate('/videos')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-forest-500 hover:text-forest-600 transition-colors active:scale-[0.98]"
          variants={fadeUp}
        >
          <CaretLeft size={16} />
          {t('sections.videos.back')}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default VideoDetail;
