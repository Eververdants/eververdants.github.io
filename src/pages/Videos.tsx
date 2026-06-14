import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play } from '@phosphor-icons/react';
import VideoCard from '../components/VideoCard';
import TagFilter from '../components/TagFilter';
import { useLanguage } from '../contexts/LanguageContext';
import { getVideos } from '../data';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const Videos: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const videos = getVideos(language);

  const categories = useMemo(() => {
    const cats = videos.map((v) => v.category);
    return ['All', ...Array.from(new Set(cats))];
  }, [videos]);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'All') return videos;
    return videos.filter((v) => v.category === selectedCategory);
  }, [videos, selectedCategory]);

  return (
    <motion.div
      className="min-h-[100dvh] pt-28 pb-20"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12" variants={fadeUp}>
          <h1 className="text-4xl md:text-5xl font-bold text-ink font-display mb-4">
            {t('sections.videos.archiveTitle')}
          </h1>
          <p className="text-warm-400 text-lg max-w-2xl mx-auto">
            {t('sections.videos.archiveSubtitle')}
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <TagFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </motion.div>

        {filteredVideos.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {filteredVideos.map((video) => (
              <motion.div key={video.id} variants={fadeUp}>
                <VideoCard video={video} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div className="text-center py-20" variants={fadeUp}>
            <Play size={48} className="mx-auto text-warm-400 mb-4" />
            <h3 className="text-xl font-semibold text-ink mb-2">{t('sections.videos.empty')}</h3>
            <p className="text-warm-400">{t('sections.videos.emptyDesc')}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Videos;
