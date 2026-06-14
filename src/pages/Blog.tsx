import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarBlank, Clock, BookOpen } from '@phosphor-icons/react';
import TagFilter from '../components/TagFilter';
import { useLanguage } from '../contexts/LanguageContext';
import { getBlogPosts } from '../data';

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

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [selectedTag, setSelectedTag] = useState('All');

  const posts = getBlogPosts(language);

  const tags = useMemo(() => {
    const allTags = posts.flatMap((p) => p.tags);
    return ['All', ...Array.from(new Set(allTags))];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedTag === 'All') return posts;
    return posts.filter((p) => p.tags.includes(selectedTag));
  }, [posts, selectedTag]);

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
            {t('sections.blog.title')}
          </h1>
          <p className="text-warm-400 text-lg max-w-2xl mx-auto">
            {t('sections.blog.subtitle')}
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <TagFilter
            categories={tags}
            selected={selectedTag}
            onSelect={setSelectedTag}
          />
        </motion.div>

        {filteredPosts.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                onClick={() => navigate(`/blog/${post.id}`)}
                className="group p-6 rounded-2xl border border-warm-200 bg-white hover:shadow-sm transition-shadow cursor-pointer"
                variants={fadeUp}
              >
                <div className="flex items-center gap-4 text-xs text-warm-400 mb-3">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarBlank size={14} />
                    {post.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} />
                    {post.readTime}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink mb-3 group-hover:text-forest-500 transition-colors font-display">
                  {post.title}
                </h2>
                <p className="text-sm text-ink/60 leading-relaxed line-clamp-2 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-warm-100 text-ink/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <motion.div className="text-center py-20" variants={fadeUp}>
            <BookOpen size={48} className="mx-auto text-warm-400 mb-4" />
            <h3 className="text-xl font-semibold text-ink mb-2">{t('common.noData')}</h3>
            <p className="text-warm-400">{t('common.noDataDesc')}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Blog;
